import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Exercise the real pure services without importing the browser or CMS runtime.
const folder = await mkdtemp(join(tmpdir(), "spm-parking-tests-"));
for (const name of ["types", "billing", "data", "navigation", "service"]) {
  const source = await readFile(new URL(`../src/lib/parking/${name}.ts`, import.meta.url), "utf8");
  const output = ts
    .transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replace(/from "(\.\/[^".]+)"/g, 'from "$1.mjs"');
  await writeFile(join(folder, `${name}.mjs`), output);
}
const load = (name) => import(pathToFileURL(join(folder, `${name}.mjs`)).href);
const { initialState, createLayout } = await load("data");
const { applyAction, metrics, nextOpeningArrival } = await load("service");
const { calculateParkingCharge, calculatePlatformCommission } = await load("billing");
const { calculateRoute, calculateRouteDistance, getGeofenceState, routePosition } =
  await load("navigation");
const now = new Date(2026, 9, 3, 10, 0, 0).getTime();
const act = (s, action, at = now) => applyAction(s, action, at);
const advance = (s) => {
  for (let i = 0; i < 5; i++) s = act(s, { type: "ADVANCE" });
  return s;
};
function reserve() {
  let s = act(initialState(), { type: "LOGIN" });
  s = act(s, { type: "SELECT", facilityId: "sltc", slotId: "A05" });
  return act(s, { type: "BOOK", vehicleId: "vehicle-demo", arrivalAt: now, outcome: "SUCCESS" });
}
function park(s = reserve()) {
  s = advance(act(s, { type: "OUTDOOR_START", bookingId: s.bookings[0].id }));
  s = act(s, { type: "VERIFY", stage: "ENTRY", method: "QR", value: s.bookings[0].qrToken });
  return act(advance(s), { type: "PARK" });
}
function exit(s) {
  s = advance(act(s, { type: "EXIT_START" }));
  return act(s, { type: "VERIFY", stage: "EXIT", method: "ANPR", value: "CAA-1234" });
}
test("A05 complete journey reconciles wallet, receipt, commission and both management views", () => {
  let s = reserve();
  assert.equal(s.wallets["driver-demo"], 1400);
  assert.equal(s.facilities[0].slots[4].status, "RESERVED");
  assert.equal(metrics(s, "provider-sltc").reserved, 1);
  s = act(s, { type: "OUTDOOR_START", bookingId: s.bookings[0].id });
  s = advance(s);
  s = act(s, {
    type: "VERIFY",
    stage: "ENTRY",
    method: "ANPR",
    value: "WRONG",
    lowConfidence: true,
  });
  assert.equal(s.bookings[0].status, "ARRIVING");
  assert.equal(s.verifications[0].result, "LOW_CONFIDENCE");
  s = act(s, { type: "VERIFY", stage: "ENTRY", method: "QR", value: s.bookings[0].qrToken });
  assert.equal(s.navigation.route.at(-1), "SLOT_A05");
  s = act(advance(s), { type: "PARK" });
  assert.equal(s.facilities[0].slots[4].status, "OCCUPIED");
  s = act(s, { type: "FIND_CAR" });
  assert.equal(s.navigation.mode, "FIND_CAR");
  assert.equal(s.navigation.route.at(-1), "SLOT_A05");
  s = act(s, { type: "TIME_ADD", minutes: 75 });
  s = act(exit(s), { type: "COMPLETE", outcome: "SUCCESS" });
  assert.equal(s.wallets["driver-demo"], 1320);
  assert.equal(s.sessions[0].charge, 180);
  assert.equal(s.sessions[0].commission, 18);
  assert.equal(s.sessions[0].providerNet, 162);
  assert.equal(s.facilities[0].slots[4].status, "AVAILABLE");
  assert.equal(s.bookings[0].status, "COMPLETED");
  assert.equal(metrics(s, "provider-sltc").gross, 180);
  assert.equal(metrics(s).gross, 180);
  assert.equal(
    s.transactions.reduce((sum, t) => sum + t.amount, 0),
    -180,
  );
  assert.ok(s.sessions[0].reference);
  const previous = structuredClone(s);
  assert.throws(() => act(s, { type: "COMPLETE", outcome: "SUCCESS" }));
  assert.deepEqual(s, previous);
});
test("failed booking/payment and insufficient wallet are atomic and retryable", () => {
  let s = act(initialState(), { type: "LOGIN" });
  s = act(s, { type: "SELECT", facilityId: "sltc", slotId: "A05" });
  for (const outcome of ["FAILED", "CANCELLED", "TIMEOUT"]) {
    const previous = structuredClone(s);
    assert.throws(() =>
      act(s, { type: "BOOK", vehicleId: "vehicle-demo", arrivalAt: now, outcome }),
    );
    assert.deepEqual(s, previous);
  }
  s.wallets["driver-demo"] = 99;
  assert.throws(
    () => act(s, { type: "BOOK", vehicleId: "vehicle-demo", arrivalAt: now, outcome: "SUCCESS" }),
    /insufficient/i,
  );
  s = exit(act(park(), { type: "TIME_ADD", minutes: 75 }));
  const previous = structuredClone(s);
  assert.throws(() => act(s, { type: "COMPLETE", outcome: "FAILED" }));
  assert.deepEqual(s, previous);
  assert.equal(s.facilities[0].slots[4].status, "OCCUPIED");
  assert.equal(act(s, { type: "COMPLETE", outcome: "SUCCESS" }).sessions[0].charge, 180);
});
test("one reservation per driver, shared conflict prevention and cancellation refund", () => {
  let s = reserve();
  assert.throws(() => act(s, { type: "SELECT", facilityId: "sltc", slotId: "A05" }), /available/i);
  assert.throws(
    () => act(s, { type: "BOOK", vehicleId: "vehicle-demo", arrivalAt: now, outcome: "SUCCESS" }),
    /active booking/i,
  );
  s = act(s, { type: "CANCEL", id: s.bookings[0].id });
  assert.equal(s.wallets["driver-demo"], 1500);
  assert.equal(s.facilities[0].slots[4].status, "AVAILABLE");
  assert.throws(() => act(s, { type: "CANCEL", id: s.bookings[0].id }));
});
test("expired reservations reject entry and refund only once", () => {
  let s = reserve();
  const booking = s.bookings[0];
  assert.throws(() => act(s, { type: "EXPIRE", id: booking.id }), /not expired/i);
  assert.throws(
    () => act(s, { type: "OUTDOOR_START", bookingId: booking.id }, booking.expiresAt + 1),
    /expired/i,
  );
  s = act(s, { type: "EXPIRE", id: booking.id }, booking.expiresAt + 1);
  assert.equal(s.wallets["driver-demo"], 1500);
  assert.equal(s.bookings[0].status, "EXPIRED");
  assert.throws(() => act(s, { type: "EXPIRE", id: booking.id }, booking.expiresAt + 2));
});
test("pricing boundaries and booking snapshots survive later provider and commission edits", () => {
  assert.deepEqual(
    [0, 60, 60.01, 120, 120.01].map((m) =>
      calculateParkingCharge(m, { firstHour: 100, additionalHour: 80 }),
    ),
    [100, 100, 180, 180, 260],
  );
  assert.equal(calculatePlatformCommission(180), 18);
  let s = reserve();
  const facility = structuredClone(s.facilities[0]);
  facility.pricing = { firstHour: 999, additionalHour: 999 };
  s = act(s, { type: "FACILITY_SAVE", facility });
  s = act(s, { type: "COMMISSION", rate: 0.25 });
  s = act(exit(act(park(s), { type: "TIME_ADD", minutes: 75 })), {
    type: "COMPLETE",
    outcome: "SUCCESS",
  });
  assert.equal(s.sessions[0].charge, 180);
  assert.equal(s.sessions[0].commission, 18);
});
test("map edits are isolated, validated and locked while bookings are active", () => {
  let s = initialState();
  const town = structuredClone(s.facilities[1]);
  town.map.edges[0].distance += 12;
  s = act(s, { type: "MAP_SAVE", facilityId: town.id, map: town.map, slots: town.slots });
  assert.notEqual(s.facilities[0].map.edges[0].distance, s.facilities[1].map.edges[0].distance);
  const broken = structuredClone(s.facilities[0]);
  broken.map.edges = broken.map.edges.filter((e) => e.to !== "SLOT_A05");
  assert.throws(
    () => act(s, { type: "MAP_SAVE", facilityId: broken.id, map: broken.map, slots: broken.slots }),
    /Route not found/i,
  );
  s = reserve();
  assert.throws(
    () =>
      act(s, {
        type: "MAP_SAVE",
        facilityId: "sltc",
        map: s.facilities[0].map,
        slots: s.facilities[0].slots,
      }),
    /active bookings/i,
  );
  assert.throws(() =>
    act(s, { type: "SLOT_STATUS", facilityId: "sltc", slotId: "A05", status: "AVAILABLE" }),
  );
  for (const count of [1, 5, 10]) {
    const layout = createLayout(count);
    for (const slot of layout.slots)
      assert.ok(calculateRoute(layout.map, "ENTRY_01", slot.nodeId).length);
  }
});
test("Dijkstra honors shortest weighted route, one-way roads and disabled connections", () => {
  const map = {
    nodes: ["a", "b", "c"].map((id, i) => ({ id, x: i * 100, y: 100, type: "ROAD", label: id })),
    zones: [],
    edges: [
      { id: "1", from: "a", to: "c", distance: 20, direction: "ONE_WAY", enabled: true },
      { id: "2", from: "a", to: "b", distance: 2, direction: "ONE_WAY", enabled: true },
      { id: "3", from: "b", to: "c", distance: 3, direction: "ONE_WAY", enabled: true },
    ],
  };
  assert.deepEqual(calculateRoute(map, "a", "c"), ["a", "b", "c"]);
  assert.equal(calculateRouteDistance(map, ["a", "b", "c"]), 5);
  assert.deepEqual(calculateRoute(map, "c", "a"), []);
  map.edges[2].enabled = false;
  assert.deepEqual(calculateRoute(map, "a", "c"), ["a", "c"]);
  assert.equal(routePosition(map, ["a", "c"], 0.5).x, 100);
  assert.equal(getGeofenceState(50, 100, 10), "ARRIVED");
  assert.equal(getGeofenceState(90, 100, 20), "APPROACHING");
  assert.equal(getGeofenceState(20, 100, 150), "OUTSIDE");
});
test("SLTC presentation completes both during operating hours and after closing", () => {
  for (const at of [now, new Date(2026, 9, 3, 23, 30).getTime()]) {
    let s = initialState();
    for (let i = 0; i < 35 && !s.sessions.some((p) => p.status === "COMPLETED"); i++)
      s = act(s, { type: "DEMO_NEXT" }, at);
    assert.equal(s.sessions[0].status, "COMPLETED");
    assert.equal(s.sessions[0].charge, 180);
    assert.equal(s.facilities[0].slots[4].status, "AVAILABLE");
  }
});
test("vehicle CRUD maintains one default and protects vehicles used by bookings", () => {
  let s = act(initialState(), { type: "LOGIN" });
  const vehicle = {
    id: "second-car",
    plate: "cab-2345",
    type: "Car",
    colour: "Blue",
    nickname: "Second car",
    isDefault: true,
  };
  s = act(s, { type: "VEHICLE_SAVE", vehicle });
  assert.equal(s.vehicles.find((v) => v.id === vehicle.id).plate, "CAB-2345");
  assert.equal(s.vehicles.filter((v) => v.isDefault).length, 1);
  assert.throws(
    () => act(s, { type: "VEHICLE_SAVE", vehicle: { ...vehicle, id: "duplicate" } }),
    /plate/i,
  );
  s = act(s, { type: "VEHICLE_DEFAULT", id: "vehicle-demo" });
  s = act(s, { type: "VEHICLE_DELETE", id: vehicle.id });
  assert.equal(s.vehicles.length, 1);
  s = reserve();
  assert.throws(() => act(s, { type: "VEHICLE_DELETE", id: "vehicle-demo" }), /active booking/i);
});
test("different drivers cannot take a reserved space or move another driver's route", () => {
  let s = reserve();
  s = act(s, { type: "OUTDOOR_START", bookingId: s.bookings[0].id });
  s = act(s, { type: "LOGIN", driver: { name: "Second Driver", email: "second@example.test" } });
  assert.throws(() => act(s, { type: "SELECT", facilityId: "sltc", slotId: "A05" }), /available/i);
  assert.throws(() => act(s, { type: "ADVANCE" }), /own booking/i);
  assert.throws(() => act(s, { type: "VEHICLE_DELETE", id: "vehicle-demo" }));
  const before = s.wallets[s.currentDriverId];
  assert.throws(() => act(s, { type: "TOP_UP", amount: 500, outcome: "TIMEOUT" }));
  s = act(s, { type: "TOP_UP", amount: 500, outcome: "SUCCESS" });
  assert.equal(s.wallets[s.currentDriverId], before + 500);
});
test("checked-in route resumes after logout and overnight opening time remains on the correct day", () => {
  let s = reserve();
  s = advance(act(s, { type: "OUTDOOR_START", bookingId: s.bookings[0].id }));
  s = act(s, { type: "VERIFY", stage: "ENTRY", method: "ANPR", value: "CAA-1234" });
  s = act(act(s, { type: "LOGOUT" }), { type: "LOGIN" });
  s = act(s, { type: "SLOT_RESUME" });
  assert.equal(s.navigation.mode, "SLOT");
  assert.equal(s.navigation.route.at(-1), "SLOT_A05");
  const facility = { ...s.facilities[0], open: "20:00", close: "06:00" };
  const midday = new Date(2026, 9, 3, 12).getTime();
  assert.equal(nextOpeningArrival(facility, midday), new Date(2026, 9, 3, 20).getTime());
  const late = new Date(2026, 9, 3, 23).getTime();
  assert.equal(nextOpeningArrival(facility, late), late);
});
