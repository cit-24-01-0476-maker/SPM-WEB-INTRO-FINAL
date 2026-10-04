export const BOOKING_STATUS = [
  "PENDING",
  "CONFIRMED",
  "ARRIVING",
  "CHECKED_IN",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];
export type SlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "BLOCKED";
export type PaymentOutcome = "SUCCESS" | "FAILED" | "CANCELLED" | "TIMEOUT";
export type GeofenceState = "OUTSIDE" | "APPROACHING" | "ARRIVED" | "ENTERED";
export interface Driver {
  id: string;
  name: string;
  email: string;
}
export interface Vehicle {
  id: string;
  driverId: string;
  plate: string;
  type: "Car";
  colour: string;
  nickname: string;
  isDefault: boolean;
}
export interface Provider {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "SUSPENDED";
}
export interface Pricing {
  firstHour: number;
  additionalHour: number;
}
export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: "ENTRY" | "EXIT" | "CHECKIN" | "ROAD" | "SLOT";
  label: string;
}
export interface MapEdge {
  id: string;
  from: string;
  to: string;
  distance: number;
  direction: "BOTH" | "ONE_WAY";
  enabled: boolean;
}
export interface ParkingZone {
  id: string;
  name: string;
}
export interface ParkingSlot {
  id: string;
  code: string;
  nodeId: string;
  x: number;
  y: number;
  zone: string;
  status: SlotStatus;
}
export interface ParkingMap {
  nodes: MapNode[];
  edges: MapEdge[];
  zones: ParkingZone[];
}
export interface Facility {
  id: string;
  providerId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  open: string;
  close: string;
  status: "OPEN" | "CLOSED";
  distanceKm: number;
  geofenceRadius: number;
  pricing: Pricing;
  rules: string;
  entrance: string;
  exit: string;
  slots: ParkingSlot[];
  map: ParkingMap;
}
export interface Booking {
  id: string;
  driverId: string;
  vehicleId: string;
  plate: string;
  facilityId: string;
  slotId: string;
  status: BookingStatus;
  createdAt: number;
  arrivalAt: number;
  expiresAt: number;
  paid: number;
  pricing: Pricing;
  commissionRate: number;
  qrToken: string;
}
export interface ParkingSession {
  id: string;
  bookingId: string;
  startedAt: number;
  endedAt?: number;
  simulatedMinutes: number;
  status: "ACTIVE" | "COMPLETED";
  charge?: number;
  commission?: number;
  providerNet?: number;
  reference?: string;
}
export interface WalletTransaction {
  id: string;
  driverId: string;
  bookingId?: string;
  amount: number;
  kind: "TOP_UP" | "BOOKING" | "REFUND" | "FINAL_PAYMENT";
  at: number;
  reference: string;
}
export interface VerificationEvent {
  id: string;
  bookingId: string;
  stage: "ENTRY" | "EXIT";
  method: "ANPR" | "QR";
  result: "APPROVED" | "FAILED" | "LOW_CONFIDENCE";
  at: number;
  plate: string;
}
export interface Notification {
  id: string;
  driverId: string;
  title: string;
  message: string;
  at: number;
  read: boolean;
}
export interface NavigationSession {
  bookingId: string;
  mode: "OUTDOOR" | "SLOT" | "EXIT" | "FIND_CAR";
  status: "NOT_STARTED" | "NAVIGATING" | "APPROACHING" | "ARRIVED" | "EXITED";
  progress: number;
  route: string[];
  geofence: GeofenceState;
}
export interface DemoState {
  schema: 1;
  revision: number;
  drivers: Driver[];
  currentDriverId: string | null;
  currentProviderId: string;
  vehicles: Vehicle[];
  providers: Provider[];
  facilities: Facility[];
  bookings: Booking[];
  sessions: ParkingSession[];
  transactions: WalletTransaction[];
  wallets: Record<string, number>;
  verifications: VerificationEvent[];
  notifications: Notification[];
  navigation: NavigationSession | null;
  selection: { facilityId: string; slotId: string } | null;
  commissionRate: number;
  demoStep: number;
}
