import { DEFAULT_COMMISSION, DEFAULT_PRICING } from "./billing";
import type { DemoState, Facility, MapNode, ParkingMap, ParkingSlot } from "./types";

export function createLayout(count = 5): { map: ParkingMap; slots: ParkingSlot[] } {
  const nodes: MapNode[] = [
    { id: "ENTRY_01", x: 55, y: 290, type: "ENTRY", label: "Entrance" },
    { id: "CHECKIN_01", x: 145, y: 290, type: "CHECKIN", label: "Check-in" },
    { id: "ROAD_01", x: 250, y: 290, type: "ROAD", label: "West junction" },
    { id: "ROAD_02", x: 550, y: 290, type: "ROAD", label: "East junction" },
    { id: "EXIT_01", x: 730, y: 290, type: "EXIT", label: "Exit" },
  ];
  const slots = Array.from({ length: count }, (_, i) => {
    const code = `A${String(i + 1).padStart(2, "0")}`;
    const row = Math.floor(i / 5),
      x = 230 + (i % 5) * 100,
      y = row % 2 ? 380 + Math.floor(row / 2) * 70 : 170 - Math.floor(row / 2) * 60;
    const nodeId = `SLOT_${code}`;
    nodes.push({ id: nodeId, x, y, type: "SLOT", label: code });
    const roadId = `ROAD_SLOT_${code}`;
    nodes.push({ id: roadId, x, y: 290, type: "ROAD", label: `Lane ${code}` });
    return { id: code, code, nodeId, x, y, zone: "ZONE_A", status: "AVAILABLE" as const };
  });
  const ordered = [...nodes.filter((n) => n.type !== "SLOT")].sort((a, b) => a.x - b.x);
  const pairs = ordered.slice(1).map((n, i) => ({ from: ordered[i].id, to: n.id }));
  for (const slot of slots) pairs.push({ from: `ROAD_SLOT_${slot.code}`, to: slot.nodeId });
  const edges = pairs.map((p, i) => ({
    id: `EDGE_${i + 1}`,
    ...p,
    distance: Math.max(
      1,
      Math.hypot(
        nodes.find((n) => n.id === p.from)!.x - nodes.find((n) => n.id === p.to)!.x,
        nodes.find((n) => n.id === p.from)!.y - nodes.find((n) => n.id === p.to)!.y,
      ) / 5,
    ),
    direction: "BOTH" as const,
    enabled: true,
  }));
  return { map: { nodes, edges, zones: [{ id: "ZONE_A", name: "Zone A" }] }, slots };
}
export function initialState(): DemoState {
  const layout = createLayout();
  const primary: Facility = {
    id: "sltc",
    providerId: "provider-sltc",
    name: "SLTC Main Parking",
    address: "SLTC Residential Campus, Padukka",
    lat: 6.837,
    lng: 80.091,
    open: "06:00",
    close: "23:00",
    status: "OPEN",
    distanceKm: 1.8,
    geofenceRadius: 100,
    pricing: { ...DEFAULT_PRICING },
    rules: "Cars only. Keep access lanes clear. Confirm your reserved space before parking.",
    entrance: "Main campus entrance · ENTRY_01",
    exit: "East lane · EXIT_01",
    ...layout,
  };
  primary.slots[1].status = "OCCUPIED";
  primary.slots[3].status = "BLOCKED";
  const town: Facility = {
    ...primary,
    id: "padukka",
    providerId: "provider-town",
    name: "Padukka Town Parking",
    address: "Town centre, Padukka",
    distanceKm: 3.4,
    lat: 6.842,
    lng: 80.096,
    pricing: { firstHour: 120, additionalHour: 100 },
    ...createLayout(),
  };
  const closed: Facility = {
    ...primary,
    id: "campus-west",
    name: "SLTC West Parking",
    address: "West campus entrance, Padukka",
    status: "CLOSED",
    distanceKm: 2.1,
    ...createLayout(),
  };
  return {
    schema: 1,
    revision: 0,
    drivers: [{ id: "driver-demo", name: "Demo Driver", email: "driver@example.test" }],
    currentDriverId: null,
    currentProviderId: "provider-sltc",
    vehicles: [
      {
        id: "vehicle-demo",
        driverId: "driver-demo",
        plate: "CAA-1234",
        type: "Car",
        colour: "White",
        nickname: "My car",
        isDefault: true,
      },
    ],
    providers: [
      {
        id: "provider-sltc",
        name: "Campus Parking Team",
        company: "SLTC Parking — demo",
        email: "campus@example.test",
        phone: "Demo contact",
        status: "ACTIVE",
      },
      {
        id: "provider-town",
        name: "Town Parking Team",
        company: "Padukka Parking — demo",
        email: "town@example.test",
        phone: "Demo contact",
        status: "ACTIVE",
      },
    ],
    facilities: [primary, town, closed],
    bookings: [],
    sessions: [],
    transactions: [],
    wallets: { "driver-demo": 1500 },
    verifications: [],
    notifications: [],
    navigation: null,
    selection: null,
    commissionRate: DEFAULT_COMMISSION,
    demoStep: 0,
  };
}
