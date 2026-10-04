import { initialState } from "./data";
import {
  calculateDuration,
  calculateOutstandingAmount,
  calculateParkingCharge,
  calculatePlatformCommission,
  calculateProviderRevenue,
} from "./billing";
import { calculateRoute } from "./navigation";
import type {
  Booking,
  DemoState,
  Driver,
  Facility,
  ParkingMap,
  PaymentOutcome,
  Provider,
  SlotStatus,
  Vehicle,
} from "./types";

export type Action =
  | { type: "LOGIN"; driver?: Omit<Driver, "id"> }
  | { type: "LOGOUT" }
  | { type: "PROFILE"; name: string; email: string }
  | { type: "VEHICLE_SAVE"; vehicle: Omit<Vehicle, "driverId"> }
  | { type: "VEHICLE_DELETE"; id: string }
  | { type: "VEHICLE_DEFAULT"; id: string }
  | { type: "TOP_UP"; amount: number; outcome: PaymentOutcome }
  | { type: "SELECT"; facilityId: string; slotId: string }
  | { type: "BOOK"; vehicleId: string; arrivalAt: number; outcome: PaymentOutcome }
  | { type: "CANCEL"; id: string }
  | { type: "MANAGE_CANCEL"; id: string }
  | { type: "EXPIRE"; id: string }
  | { type: "OUTDOOR_START"; bookingId: string }
  | { type: "SLOT_RESUME" }
  | { type: "ADVANCE" }
  | { type: "NAV_RESET" }
  | {
      type: "VERIFY";
      stage: "ENTRY" | "EXIT";
      method: "ANPR" | "QR";
      value: string;
      fail?: boolean;
      lowConfidence?: boolean;
    }
  | { type: "PARK" }
  | { type: "TIME_ADD"; minutes: number }
  | { type: "FIND_CAR" }
  | { type: "EXIT_START" }
  | { type: "COMPLETE"; outcome: PaymentOutcome }
  | { type: "NOTIFICATIONS_READ" }
  | { type: "PROVIDER_REGISTER"; provider: Provider; facility: Facility }
  | { type: "PROVIDER_SELECT"; id: string }
  | { type: "PROVIDER_SAVE"; provider: Provider }
  | { type: "FACILITY_SAVE"; facility: Facility }
  | { type: "MAP_SAVE"; facilityId: string; map: ParkingMap; slots: Facility["slots"] }
  | { type: "SLOT_STATUS"; facilityId: string; slotId: string; status: SlotStatus }
  | { type: "COMMISSION"; rate: number }
  | { type: "PROVIDER_STATUS"; id: string; status: Provider["status"] }
  | { type: "DEMO_NEXT" }
  | { type: "RESET" };

export const uid = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
export const activeBooking = (s: DemoState, driverId = s.currentDriverId) =>
  s.bookings.find(
    (b) =>
      b.driverId === driverId &&
      ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
  );
export const activeSession = (s: DemoState) =>
  s.sessions.find(
    (p) =>
      p.status === "ACTIVE" &&
      s.bookings.find((b) => b.id === p.bookingId)?.driverId === s.currentDriverId,
  );
export const driverVehicles = (s: DemoState) =>
  s.vehicles.filter((v) => v.driverId === s.currentDriverId);
export const defaultVehicle = (s: DemoState) =>
  driverVehicles(s).find((v) => v.isDefault) ?? driverVehicles(s)[0];
export const availableSpaces = (f: Facility) =>
  f.slots.filter((s) => s.status === "AVAILABLE").length;
export function nextOpeningArrival(f: Facility, at = Date.now()): number {
  const arrival = new Date(at);
  const time = `${String(arrival.getHours()).padStart(2, "0")}:${String(arrival.getMinutes()).padStart(2, "0")}`;
  const closed =
    f.open < f.close ? time < f.open || time >= f.close : time < f.open && time >= f.close;
  if (closed) {
    if (f.open < f.close && time >= f.close) arrival.setDate(arrival.getDate() + 1);
    const [hour, minute] = f.open.split(":").map(Number);
    arrival.setHours(hour, minute, 0, 0);
  }
  return arrival.getTime();
}
export function metrics(s: DemoState, providerId?: string) {
  const facilities = s.facilities.filter((f) => !providerId || f.providerId === providerId);
  const ids = new Set(facilities.map((f) => f.id));
  const bookings = s.bookings.filter((b) => ids.has(b.facilityId));
  const sessions = s.sessions.filter((p) => bookings.some((b) => b.id === p.bookingId));
  const slots = facilities.flatMap((f) => f.slots),
    completed = sessions.filter((p) => p.status === "COMPLETED");
  return {
    facilities: facilities.length,
    total: slots.length,
    available: slots.filter((p) => p.status === "AVAILABLE").length,
    reserved: slots.filter((p) => p.status === "RESERVED").length,
    occupied: slots.filter((p) => p.status === "OCCUPIED").length,
    blocked: slots.filter((p) => p.status === "BLOCKED").length,
    bookings: bookings.length,
    activeBookings: bookings.filter((b) =>
      ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
    ).length,
    activeSessions: sessions.filter((p) => p.status === "ACTIVE").length,
    completed: completed.length,
    gross: completed.reduce((t, p) => t + (p.charge ?? 0), 0),
    commission: completed.reduce((t, p) => t + (p.commission ?? 0), 0),
    net: completed.reduce((t, p) => t + (p.providerNet ?? 0), 0),
  };
}
function requireValue<T>(value: T | null | undefined, message: string): T {
  if (value === undefined || value === null) throw new Error(message);
  return value;
}
function checkPayment(outcome: PaymentOutcome) {
  if (outcome !== "SUCCESS")
    throw new Error(`Demo payment ${outcome.toLowerCase()}. No money was taken; you can retry.`);
}
function notify(s: DemoState, title: string, message: string, now: number) {
  if (s.currentDriverId)
    s.notifications.unshift({
      id: uid("notice"),
      driverId: s.currentDriverId,
      title,
      message,
      at: now,
      read: false,
    });
}
function transaction(
  s: DemoState,
  amount: number,
  kind: DemoState["transactions"][number]["kind"],
  now: number,
  bookingId?: string,
) {
  const driverId = requireValue(s.currentDriverId, "Enter the driver demo first.");
  if ((s.wallets[driverId] ?? 0) + amount < 0)
    throw new Error("Wallet insufficient. Top up your demo wallet and retry.");
  s.wallets[driverId] = Math.round(((s.wallets[driverId] ?? 0) + amount) * 100) / 100;
  const id = uid("txn");
  s.transactions.unshift({
    id,
    reference: id.toUpperCase(),
    driverId,
    bookingId,
    amount,
    kind,
    at: now,
  });
  if (s.wallets[driverId] < 200)
    notify(s, "Low wallet balance", "Top up your demo wallet before your next payment.", now);
  return id.toUpperCase();
}
function getJourney(s: DemoState) {
  const booking = requireValue(
    activeBooking(s),
    "No active booking. Reserve a parking space first.",
  );
  const facility = requireValue(
    s.facilities.find((f) => f.id === booking.facilityId),
    "Facility unavailable.",
  );
  const slot = requireValue(
    facility.slots.find((p) => p.id === booking.slotId),
    "Parking space unavailable.",
  );
  return { booking, facility, slot };
}
function validateMap(map: ParkingMap, slots: Facility["slots"]) {
  if (!slots.length) throw new Error("The facility needs at least one parking space.");
  const ids = new Set(map.nodes.map((n) => n.id));
  if (
    ids.size !== map.nodes.length ||
    new Set(slots.map((p) => p.code)).size !== slots.length ||
    new Set(slots.map((p) => p.id)).size !== slots.length
  )
    throw new Error("Map identifiers and slot codes must be unique.");
  if (!map.nodes.some((n) => n.type === "ENTRY") || !map.nodes.some((n) => n.type === "EXIT"))
    throw new Error("The map needs an entrance and exit.");
  if (
    map.nodes.some(
      (n) =>
        !Number.isFinite(n.x) ||
        !Number.isFinite(n.y) ||
        n.x < 20 ||
        n.x > 780 ||
        n.y < 20 ||
        n.y > 470,
    )
  )
    throw new Error("Keep map elements inside the layout.");
  if (
    map.edges.some(
      (e) => !ids.has(e.from) || !ids.has(e.to) || e.distance <= 0 || !Number.isFinite(e.distance),
    )
  )
    throw new Error("Road connections need valid endpoints and positive distances.");
  const entry = map.nodes.find((n) => n.type === "ENTRY")!,
    exit = map.nodes.find((n) => n.type === "EXIT")!;
  for (const slot of slots) {
    if (!ids.has(slot.nodeId) || !map.zones.some((z) => z.id === slot.zone))
      throw new Error("Every slot needs a map node and zone.");
    if (
      !calculateRoute(map, entry.id, slot.nodeId).length ||
      !calculateRoute(map, slot.nodeId, exit.id).length
    )
      throw new Error(
        `Route not found for ${slot.code}. Connect it to the road network before saving.`,
      );
  }
}
function validateFacility(f: Facility) {
  if (!f.name.trim() || !f.address.trim() || !f.entrance.trim() || !f.exit.trim())
    throw new Error("Enter facility name, address, entrance and exit details.");
  if (
    !Number.isFinite(f.lat) ||
    Math.abs(f.lat) > 90 ||
    !Number.isFinite(f.lng) ||
    Math.abs(f.lng) > 180
  )
    throw new Error("Enter valid geographic coordinates.");
  if (
    !Number.isFinite(f.pricing.firstHour) ||
    f.pricing.firstHour < 0 ||
    !Number.isFinite(f.pricing.additionalHour) ||
    f.pricing.additionalHour < 0
  )
    throw new Error("Parking rates must be non-negative amounts.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.open) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(f.close))
    throw new Error("Enter valid opening and closing times.");
  validateMap(f.map, f.slots);
}

/** Pure service transaction: failed commands never change or persist any state. */
export function applyAction(previous: DemoState, action: Action, now = Date.now()): DemoState {
  if (action.type === "RESET") return { ...initialState(), revision: previous.revision + 1 };
  if (action.type === "DEMO_NEXT") return advancePresentation(previous, now);
  if (action.type === "MANAGE_CANCEL") {
    const booking = requireValue(
      previous.bookings.find((b) => b.id === action.id),
      "Booking unavailable.",
    );
    const next = applyAction(
      { ...previous, currentDriverId: booking.driverId },
      { type: "CANCEL", id: booking.id },
      now,
    );
    next.currentDriverId = previous.currentDriverId;
    return next;
  }
  const s = structuredClone(previous);
  switch (action.type) {
    case "LOGIN": {
      s.selection = null;
      if (action.driver) {
        const email = action.driver.email.trim().toLowerCase();
        if (!action.driver.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new Error("Enter your name and a valid email for the demo profile.");
        const driver = s.drivers.find((d) => d.email === email) ?? {
          id: uid("driver"),
          name: action.driver.name.trim(),
          email,
        };
        if (!s.drivers.some((d) => d.id === driver.id)) s.drivers.push(driver);
        s.wallets[driver.id] ??= 1500;
        s.currentDriverId = driver.id;
      } else s.currentDriverId = "driver-demo";
      break;
    }
    case "LOGOUT":
      s.currentDriverId = null;
      s.selection = null;
      s.navigation = null;
      break;
    case "PROFILE": {
      const driver = requireValue(
        s.drivers.find((d) => d.id === s.currentDriverId),
        "Enter demo first.",
      );
      if (!action.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(action.email))
        throw new Error("Enter a name and valid email.");
      if (
        s.drivers.some(
          (d) => d.id !== driver.id && d.email.toLowerCase() === action.email.toLowerCase(),
        )
      )
        throw new Error("This email belongs to another demo profile.");
      driver.name = action.name.trim();
      driver.email = action.email.trim().toLowerCase();
      break;
    }
    case "VEHICLE_SAVE": {
      const driverId = requireValue(s.currentDriverId, "Enter demo first.");
      const plate = action.vehicle.plate.toUpperCase().trim();
      if (!/^[A-Z0-9 -]{4,15}$/.test(plate) || !action.vehicle.nickname.trim())
        throw new Error("Enter a vehicle nickname and valid plate number.");
      if (s.vehicles.some((v) => v.id !== action.vehicle.id && v.plate === plate))
        throw new Error("That plate already belongs to a vehicle.");
      const current = s.vehicles.find((v) => v.id === action.vehicle.id);
      if (current && current.driverId !== driverId)
        throw new Error("This vehicle belongs to another demo driver.");
      if (
        s.bookings.some(
          (b) =>
            b.vehicleId === action.vehicle.id &&
            ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
        )
      )
        throw new Error("Finish or cancel this vehicle's active booking before editing it.");
      const vehicle = {
        ...action.vehicle,
        driverId,
        plate,
        isDefault: action.vehicle.isDefault || !driverVehicles(s).length,
      };
      if (vehicle.isDefault)
        s.vehicles.filter((v) => v.driverId === driverId).forEach((v) => (v.isDefault = false));
      s.vehicles = s.vehicles.filter((v) => v.id !== vehicle.id);
      s.vehicles.push(vehicle);
      break;
    }
    case "VEHICLE_DELETE": {
      const vehicle = requireValue(
        s.vehicles.find((v) => v.id === action.id && v.driverId === s.currentDriverId),
        "Vehicle unavailable.",
      );
      if (
        s.bookings.some(
          (b) =>
            b.vehicleId === action.id &&
            ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
        )
      )
        throw new Error("This vehicle has an active booking. Complete or cancel it first.");
      s.vehicles = s.vehicles.filter((v) => v.id !== action.id);
      if (vehicle.isDefault && driverVehicles(s)[0]) driverVehicles(s)[0].isDefault = true;
      break;
    }
    case "VEHICLE_DEFAULT": {
      requireValue(
        s.vehicles.find((v) => v.id === action.id && v.driverId === s.currentDriverId),
        "Vehicle unavailable.",
      );
      driverVehicles(s).forEach((v) => (v.isDefault = v.id === action.id));
      break;
    }
    case "TOP_UP":
      checkPayment(action.outcome);
      if (!Number.isFinite(action.amount) || action.amount <= 0 || action.amount > 100000)
        throw new Error("Enter a top-up amount between LKR 1 and 100,000.");
      transaction(s, action.amount, "TOP_UP", now);
      notify(s, "Payment success", "Demo wallet top-up received.", now);
      break;
    case "SELECT": {
      const f = requireValue(
        s.facilities.find((f) => f.id === action.facilityId),
        "Facility unavailable.",
      );
      if (
        f.status !== "OPEN" ||
        s.providers.find((p) => p.id === f.providerId)?.status !== "ACTIVE"
      )
        throw new Error("Facility closed. Choose an open parking facility.");
      const slot = requireValue(
        f.slots.find((p) => p.id === action.slotId),
        "Space not found.",
      );
      if (slot.status !== "AVAILABLE")
        throw new Error("Slot no longer available. Select another space.");
      s.selection = { facilityId: f.id, slotId: slot.id };
      break;
    }
    case "BOOK": {
      requireValue(s.currentDriverId, "Enter the driver demo first.");
      if (activeBooking(s))
        throw new Error("You already have an active booking. Complete or cancel it first.");
      const selected = requireValue(s.selection, "Select a parking space first.");
      const f = requireValue(
        s.facilities.find((f) => f.id === selected.facilityId),
        "Facility unavailable.",
      );
      if (
        f.status !== "OPEN" ||
        s.providers.find((p) => p.id === f.providerId)?.status !== "ACTIVE"
      )
        throw new Error("Facility closed. Booking unavailable.");
      const slot = requireValue(
        f.slots.find((p) => p.id === selected.slotId && p.status === "AVAILABLE"),
        "Slot no longer available.",
      );
      const vehicle = requireValue(
        s.vehicles.find((v) => v.id === action.vehicleId && v.driverId === s.currentDriverId),
        "Select your vehicle first.",
      );
      if (
        !Number.isFinite(action.arrivalAt) ||
        action.arrivalAt < now - 60000 ||
        action.arrivalAt > now + 7 * 86400000
      )
        throw new Error("Choose an arrival within the next seven days.");
      const time = new Date(action.arrivalAt);
      const hour = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
      if (f.open < f.close ? hour < f.open || hour >= f.close : hour < f.open && hour >= f.close)
        throw new Error("Facility is closed at the selected arrival time.");
      checkPayment(action.outcome);
      const booking: Booking = {
        id: uid("booking"),
        driverId: s.currentDriverId!,
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        facilityId: f.id,
        slotId: slot.id,
        status: "CONFIRMED",
        createdAt: now,
        arrivalAt: action.arrivalAt,
        expiresAt: action.arrivalAt + 30 * 60000,
        paid: f.pricing.firstHour,
        pricing: { ...f.pricing },
        commissionRate: s.commissionRate,
        qrToken: uid("SPM-DEMO"),
      };
      transaction(s, -booking.paid, "BOOKING", now, booking.id);
      s.bookings.unshift(booking);
      slot.status = "RESERVED";
      s.selection = null;
      notify(s, "Booking confirmed", `${f.name} · ${slot.code}. First-hour payment received.`, now);
      notify(s, "Booking reminder", "Arrive within 30 minutes of your booking time.", now);
      break;
    }
    case "CANCEL":
    case "EXPIRE": {
      const b = requireValue(
        s.bookings.find((b) => b.id === action.id && b.driverId === s.currentDriverId),
        "Booking unavailable.",
      );
      if (!["CONFIRMED", "ARRIVING"].includes(b.status))
        throw new Error("Only bookings before check-in can be cancelled or expired.");
      if (action.type === "EXPIRE" && now <= b.expiresAt)
        throw new Error("This booking has not expired yet.");
      b.status = action.type === "CANCEL" ? "CANCELLED" : "EXPIRED";
      const slot = s.facilities
        .find((f) => f.id === b.facilityId)
        ?.slots.find((p) => p.id === b.slotId);
      if (slot) slot.status = "AVAILABLE";
      transaction(s, b.paid, "REFUND", now, b.id);
      b.paid = 0;
      if (s.navigation?.bookingId === b.id) s.navigation = null;
      notify(
        s,
        action.type === "CANCEL" ? "Booking cancelled" : "Booking expired",
        "Reservation released and demo payment refunded.",
        now,
      );
      break;
    }
    case "OUTDOOR_START": {
      const b = requireValue(
        s.bookings.find((b) => b.id === action.bookingId && b.driverId === s.currentDriverId),
        "Booking unavailable.",
      );
      if (!["CONFIRMED", "ARRIVING"].includes(b.status))
        throw new Error("This booking cannot start outdoor navigation.");
      if (now > b.expiresAt)
        throw new Error("Booking expired. Release the expired reservation in My Booking.");
      b.status = "ARRIVING";
      s.navigation = {
        bookingId: b.id,
        mode: "OUTDOOR",
        status: "NAVIGATING",
        progress: 0,
        route: [],
        geofence: "OUTSIDE",
      };
      break;
    }
    case "SLOT_RESUME": {
      const { booking: b, facility: f, slot } = getJourney(s);
      if (b.status !== "CHECKED_IN") throw new Error("Entry verification is required first.");
      const entry = requireValue(
        f.map.nodes.find((n) => n.type === "ENTRY"),
        "Entrance missing.",
      );
      const route = calculateRoute(f.map, entry.id, slot.nodeId);
      if (!route.length) throw new Error("Route not found. Check the facility map.");
      s.navigation = {
        bookingId: b.id,
        mode: "SLOT",
        status: "NAVIGATING",
        progress: 0,
        route,
        geofence: "ENTERED",
      };
      break;
    }
    case "ADVANCE": {
      const nav = requireValue(s.navigation, "Navigation unavailable. Start a route first.");
      if (activeBooking(s)?.id !== nav.bookingId)
        throw new Error("Start your own booking route first.");
      if (nav.progress >= 1)
        throw new Error("You have arrived. Continue with the next parking step.");
      nav.progress = Math.min(1, Math.round((nav.progress + 0.2) * 100) / 100);
      nav.status =
        nav.progress >= 1 ? "ARRIVED" : nav.progress >= 0.8 ? "APPROACHING" : "NAVIGATING";
      if (nav.mode === "OUTDOOR") {
        const previous = nav.geofence;
        nav.geofence =
          nav.progress >= 1 ? "ARRIVED" : nav.progress >= 0.8 ? "APPROACHING" : "OUTSIDE";
        if (previous !== nav.geofence && nav.geofence !== "OUTSIDE")
          notify(
            s,
            nav.geofence === "ARRIVED" ? "Arrived at parking" : "Approaching parking",
            nav.geofence === "ARRIVED"
              ? "Verify your entry to continue."
              : "Your parking facility is nearby.",
            now,
          );
      }
      break;
    }
    case "NAV_RESET": {
      const nav = requireValue(s.navigation, "Start a route first.");
      if (nav.status === "EXITED" || activeBooking(s)?.id !== nav.bookingId)
        throw new Error("This journey is complete.");
      nav.progress = 0;
      nav.status = "NAVIGATING";
      if (nav.mode === "OUTDOOR") nav.geofence = "OUTSIDE";
      break;
    }
    case "VERIFY": {
      const { booking: b, facility: f, slot } = getJourney(s);
      const nav = requireValue(s.navigation, "Start navigation first.");
      if (
        nav.bookingId !== b.id ||
        nav.progress < 1 ||
        (action.stage === "ENTRY" && nav.mode !== "OUTDOOR") ||
        (action.stage === "EXIT" && nav.mode !== "EXIT")
      )
        throw new Error("Arrive at the appropriate verification point first.");
      if (action.stage === "ENTRY" && now > b.expiresAt)
        throw new Error("Booking expired. Cancel the reservation and rebook.");
      const expected = action.method === "ANPR" ? b.plate : b.qrToken;
      const approved =
        !action.fail &&
        !action.lowConfidence &&
        action.value.trim().toUpperCase() === expected.toUpperCase();
      s.verifications.unshift({
        id: uid("verify"),
        bookingId: b.id,
        stage: action.stage,
        method: action.method,
        result: approved ? "APPROVED" : action.lowConfidence ? "LOW_CONFIDENCE" : "FAILED",
        at: now,
        plate: b.plate,
      });
      if (approved && action.stage === "ENTRY") {
        const entry = requireValue(
          f.map.nodes.find((n) => n.type === "ENTRY"),
          "Map entrance unavailable.",
        );
        const route = calculateRoute(f.map, entry.id, slot.nodeId);
        if (!route.length) throw new Error("Route not found. Ask the provider to connect the map.");
        b.status = "CHECKED_IN";
        s.navigation = {
          bookingId: b.id,
          mode: "SLOT",
          status: "NAVIGATING",
          progress: 0,
          route,
          geofence: "ENTERED",
        };
        notify(
          s,
          "Entry approved",
          "Demo verification matched your booking. Follow the route to your reserved space.",
          now,
        );
      }
      break;
    }
    case "PARK": {
      const { booking: b, slot } = getJourney(s);
      const nav = requireValue(s.navigation, "No slot navigation.");
      if (b.status !== "CHECKED_IN" || nav.mode !== "SLOT" || nav.progress < 1)
        throw new Error("Navigate to your exact reserved space first.");
      b.status = "ACTIVE";
      slot.status = "OCCUPIED";
      s.sessions.unshift({
        id: uid("session"),
        bookingId: b.id,
        startedAt: now,
        simulatedMinutes: 0,
        status: "ACTIVE",
      });
      notify(
        s,
        "Parking started",
        `You are parked at ${slot.code}. Your session timer is running.`,
        now,
      );
      break;
    }
    case "TIME_ADD": {
      const session = requireValue(activeSession(s), "No active parking session.");
      if (!Number.isFinite(action.minutes) || action.minutes <= 0 || action.minutes > 1440)
        throw new Error("Choose a demo duration up to 24 hours.");
      session.simulatedMinutes += action.minutes;
      break;
    }
    case "FIND_CAR":
    case "EXIT_START": {
      requireValue(activeSession(s), "No active session. Park your vehicle first.");
      const { booking: b, facility: f, slot } = getJourney(s);
      const entry = requireValue(
        f.map.nodes.find((n) => n.type === "ENTRY"),
        "Entrance missing.",
      );
      const exit = requireValue(
        f.map.nodes.find((n) => n.type === "EXIT"),
        "Exit missing.",
      );
      const route =
        action.type === "FIND_CAR"
          ? calculateRoute(f.map, entry.id, slot.nodeId)
          : calculateRoute(f.map, slot.nodeId, exit.id);
      if (!route.length) throw new Error("Route not found. Check the facility map.");
      s.navigation = {
        bookingId: b.id,
        mode: action.type === "FIND_CAR" ? "FIND_CAR" : "EXIT",
        status: "NAVIGATING",
        progress: 0,
        route,
        geofence: "ENTERED",
      };
      break;
    }
    case "COMPLETE": {
      const { booking: b, slot } = getJourney(s);
      const session = requireValue(activeSession(s), "No active session.");
      const nav = requireValue(s.navigation, "Navigate to the exit first.");
      if (nav.mode !== "EXIT" || nav.progress < 1)
        throw new Error("Navigate to the parking exit first.");
      if (
        !s.verifications.some(
          (v) => v.bookingId === b.id && v.stage === "EXIT" && v.result === "APPROVED",
        )
      )
        throw new Error("Complete exit verification before paying.");
      checkPayment(action.outcome);
      const charge = calculateParkingCharge(calculateDuration(session, now), b.pricing);
      const outstanding = calculateOutstandingAmount(charge, b.paid);
      const reference = transaction(s, -outstanding, "FINAL_PAYMENT", now, b.id);
      if (b.paid > charge) transaction(s, b.paid - charge, "REFUND", now, b.id);
      session.endedAt = now;
      session.status = "COMPLETED";
      session.charge = charge;
      session.commission = calculatePlatformCommission(charge, b.commissionRate);
      session.providerNet = calculateProviderRevenue(charge, b.commissionRate);
      session.reference = reference;
      b.status = "COMPLETED";
      slot.status = "AVAILABLE";
      nav.status = "EXITED";
      notify(
        s,
        "Exit completed",
        "Payment success. Receipt ready and parking space released.",
        now,
      );
      break;
    }
    case "NOTIFICATIONS_READ":
      s.notifications
        .filter((n) => n.driverId === s.currentDriverId)
        .forEach((n) => (n.read = true));
      break;
    case "PROVIDER_REGISTER": {
      if (
        !action.provider.name.trim() ||
        !action.provider.company.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(action.provider.email)
      )
        throw new Error("Enter provider name, company and valid email.");
      validateFacility(action.facility);
      s.providers.push(action.provider);
      s.facilities.push(action.facility);
      s.currentProviderId = action.provider.id;
      break;
    }
    case "PROVIDER_SELECT":
      requireValue(
        s.providers.find((p) => p.id === action.id),
        "Provider unavailable.",
      );
      s.currentProviderId = action.id;
      break;
    case "PROVIDER_SAVE": {
      if (
        !action.provider.name.trim() ||
        !action.provider.company.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(action.provider.email)
      )
        throw new Error("Enter provider name, company and valid email.");
      const index = s.providers.findIndex((p) => p.id === action.provider.id);
      if (index < 0) throw new Error("Provider unavailable.");
      s.providers[index] = action.provider;
      break;
    }
    case "FACILITY_SAVE": {
      validateFacility(action.facility);
      requireValue(
        s.providers.find((p) => p.id === action.facility.providerId),
        "Provider unavailable.",
      );
      const index = s.facilities.findIndex((f) => f.id === action.facility.id);
      if (index < 0) s.facilities.push(action.facility);
      else {
        const old = s.facilities[index];
        if (
          s.bookings.some(
            (b) =>
              b.facilityId === old.id &&
              ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
          ) &&
          (JSON.stringify(old.map) !== JSON.stringify(action.facility.map) ||
            old.providerId !== action.facility.providerId)
        )
          throw new Error("Finish active bookings before changing the facility layout.");
        s.facilities[index] = { ...action.facility, slots: old.slots, map: old.map };
      }
      break;
    }
    case "MAP_SAVE": {
      const f = requireValue(
        s.facilities.find((f) => f.id === action.facilityId),
        "Facility not found.",
      );
      if (
        s.bookings.some(
          (b) =>
            b.facilityId === f.id &&
            ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
        )
      )
        throw new Error("Finish or cancel active bookings before changing this layout.");
      if (action.slots.some((p) => p.status === "RESERVED"))
        throw new Error("Reserve spaces through the booking flow.");
      validateMap(action.map, action.slots);
      f.map = action.map;
      f.slots = action.slots;
      break;
    }
    case "SLOT_STATUS": {
      const f = requireValue(
        s.facilities.find((f) => f.id === action.facilityId),
        "Facility unavailable.",
      );
      const slot = requireValue(
        f.slots.find((p) => p.id === action.slotId),
        "Space unavailable.",
      );
      if (
        s.bookings.some(
          (b) =>
            b.facilityId === f.id &&
            b.slotId === slot.id &&
            ["CONFIRMED", "ARRIVING", "CHECKED_IN", "ACTIVE"].includes(b.status),
        )
      )
        throw new Error(
          "This space belongs to an active booking. Complete or cancel that journey first.",
        );
      if (action.status === "RESERVED")
        throw new Error("Reservations are managed through bookings.");
      slot.status = action.status;
      break;
    }
    case "COMMISSION":
      if (!Number.isFinite(action.rate) || action.rate < 0 || action.rate > 1)
        throw new Error("Commission must be between 0 and 100 percent.");
      s.commissionRate = action.rate;
      break;
    case "PROVIDER_STATUS":
      requireValue(
        s.providers.find((p) => p.id === action.id),
        "Provider unavailable.",
      ).status = action.status;
      break;
  }
  s.revision = previous.revision + 1;
  return s;
}

function advancePresentation(s: DemoState, now: number): DemoState {
  let action: Action;
  const booking = activeBooking(s, "driver-demo");
  const nav = s.navigation;
  if (s.currentDriverId !== "driver-demo") action = { type: "LOGIN" };
  else if (!booking && s.sessions.some((p) => p.status === "COMPLETED"))
    throw new Error("Demo complete. Reset to present the journey again.");
  else if (!booking && !s.selection) action = { type: "SELECT", facilityId: "sltc", slotId: "A05" };
  else if (!booking) {
    const facility = s.facilities.find((f) => f.id === "sltc")!;
    action = {
      type: "BOOK",
      vehicleId: defaultVehicle(s)!.id,
      arrivalAt: nextOpeningArrival(facility, now),
      outcome: "SUCCESS",
    };
  } else if (booking.status === "CONFIRMED")
    action = { type: "OUTDOOR_START", bookingId: booking.id };
  else if (nav && nav.progress < 1) action = { type: "ADVANCE" };
  else if (booking.status === "ARRIVING")
    action = { type: "VERIFY", stage: "ENTRY", method: "ANPR", value: booking.plate };
  else if (booking.status === "CHECKED_IN") action = { type: "PARK" };
  else if (booking.status === "ACTIVE" && nav?.mode !== "EXIT") {
    const session = activeSession(s)!;
    action =
      session.simulatedMinutes < 75 ? { type: "TIME_ADD", minutes: 75 } : { type: "EXIT_START" };
  } else if (
    !s.verifications.some(
      (v) => v.bookingId === booking.id && v.stage === "EXIT" && v.result === "APPROVED",
    )
  )
    action = { type: "VERIFY", stage: "EXIT", method: "ANPR", value: booking.plate };
  else action = { type: "COMPLETE", outcome: "SUCCESS" };
  const next = applyAction(s, action, now);
  next.demoStep = s.demoStep + 1;
  return next;
}

export function assistantReply(s: DemoState, question: string): string {
  const b = activeBooking(s),
    session = activeSession(s),
    wallet = s.wallets[s.currentDriverId ?? ""] ?? 0;
  const q = question.toLowerCase();
  if (/wallet|balance/.test(q)) return `Your demo wallet balance is LKR ${wallet.toFixed(2)}.`;
  if (/charge|cost|bill/.test(q))
    return session && b
      ? `Your current estimated charge is LKR ${calculateParkingCharge(calculateDuration(session), b.pricing)}. Your first-hour payment was LKR ${b.paid}.`
      : "No active session. Parking rates are shown on each facility.";
  if (/where|space|slot|parked|car/.test(q))
    return b
      ? `Your parking space is ${b.slotId} at ${s.facilities.find((f) => f.id === b.facilityId)?.name}. ${b.status === "ACTIVE" ? "Use Find My Car to follow the demo walking route." : "Follow your booking journey to park there."}`
      : "You have no active reservation. Find Parking to select a space.";
  if (/booking/.test(q))
    return b
      ? `Your current booking is ${b.status.toLowerCase()} for ${b.slotId}. Vehicle ${b.plate}.`
      : "No active booking. Your previous bookings are in History.";
  if (/exit/.test(q))
    return session
      ? "Open Parking Session and choose Navigate to Exit. Complete the demo verification and final payment to release your space."
      : "You need an active parking session before navigating to the exit.";
  if (/transaction|payment/.test(q)) {
    const t = s.transactions.find((t) => t.driverId === s.currentDriverId);
    return t
      ? `Latest demo transaction: ${t.kind.toLowerCase().replaceAll("_", " ")}, LKR ${t.amount.toFixed(2)}. Reference ${t.reference}.`
      : "No demo transactions yet.";
  }
  if (/avail|recommend|near|find/.test(q))
    return (
      s.facilities
        .filter(
          (f) =>
            f.status === "OPEN" &&
            availableSpaces(f) > 0 &&
            s.providers.find((p) => p.id === f.providerId)?.status === "ACTIVE",
        )
        .map(
          (f) =>
            `${f.name}: ${availableSpaces(f)} available, LKR ${f.pricing.firstHour}/first hour.`,
        )
        .join(" ") || "No open parking with available spaces. Try another facility later."
    );
  return "This controlled demo assistant can explain your booking, parking space, wallet, charge, exit or available facilities. It does not call an online AI model.";
}
export function recommendParking(s: DemoState) {
  return s.facilities
    .filter(
      (f) =>
        f.status === "OPEN" &&
        availableSpaces(f) > 0 &&
        s.providers.find((p) => p.id === f.providerId)?.status === "ACTIVE",
    )
    .map((f) => ({
      facility: f,
      score:
        (availableSpaces(f) / f.slots.length) * 50 - f.distanceKm * 5 - f.pricing.firstHour / 20,
    }))
    .sort((a, b) => b.score - a.score);
}
