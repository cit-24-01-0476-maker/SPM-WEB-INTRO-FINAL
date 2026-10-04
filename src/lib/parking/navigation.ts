import type { GeofenceState, MapNode, ParkingMap } from "./types";

export function calculateRoute(map: ParkingMap, start: string, destination: string): string[] {
  if (!map.nodes.some((n) => n.id === start) || !map.nodes.some((n) => n.id === destination))
    return [];
  const distances = new Map(map.nodes.map((n) => [n.id, Infinity]));
  const previous = new Map<string, string>();
  const remaining = new Set(map.nodes.map((n) => n.id));
  distances.set(start, 0);
  while (remaining.size) {
    const current = [...remaining].sort((a, b) => distances.get(a)! - distances.get(b)!)[0];
    if (!Number.isFinite(distances.get(current)!)) break;
    remaining.delete(current);
    if (current === destination) {
      const route = [current];
      while (previous.has(route[0])) route.unshift(previous.get(route[0])!);
      return route;
    }
    for (const edge of map.edges.filter((e) => e.enabled)) {
      const neighbour =
        edge.from === current
          ? edge.to
          : edge.direction === "BOTH" && edge.to === current
            ? edge.from
            : null;
      if (!neighbour || !remaining.has(neighbour)) continue;
      const distance = distances.get(current)! + edge.distance;
      if (distance < distances.get(neighbour)!) {
        distances.set(neighbour, distance);
        previous.set(neighbour, current);
      }
    }
  }
  return [];
}
export function calculateRouteDistance(map: ParkingMap, route: string[]): number {
  return route
    .slice(1)
    .reduce(
      (total, id, i) =>
        total +
        Math.min(
          ...map.edges
            .filter(
              (e) =>
                e.enabled &&
                ((e.from === route[i] && e.to === id) ||
                  (e.direction === "BOTH" && e.to === route[i] && e.from === id)),
            )
            .map((e) => e.distance),
          Infinity,
        ),
      0,
    );
}
export function routePosition(
  map: ParkingMap,
  route: string[],
  progress: number,
): { x: number; y: number; segment: number } {
  const nodes = route
    .map((id) => map.nodes.find((n) => n.id === id))
    .filter((n): n is MapNode => !!n);
  if (!nodes.length) return { x: 50, y: 290, segment: 0 };
  let remaining = calculateRouteDistance(map, route) * Math.max(0, Math.min(1, progress));
  for (let i = 0; i < nodes.length - 1; i++) {
    const length = calculateRouteDistance(map, [nodes[i].id, nodes[i + 1].id]);
    if (remaining <= length && length > 0) {
      const t = remaining / length;
      return {
        x: nodes[i].x + (nodes[i + 1].x - nodes[i].x) * t,
        y: nodes[i].y + (nodes[i + 1].y - nodes[i].y) * t,
        segment: i,
      };
    }
    remaining -= length;
  }
  return { ...nodes[nodes.length - 1], segment: Math.max(0, nodes.length - 2) };
}
export function getCurrentInstruction(
  map: ParkingMap,
  route: string[],
  progress: number,
  destination: string,
): string {
  if (!route.length) return "Route not found. Ask the provider to check the map.";
  if (progress >= 1) return `You have arrived at ${destination}`;
  if (progress > 0.85) return `${destination} ahead`;
  const { segment } = routePosition(map, route, progress);
  const a = map.nodes.find((n) => n.id === route[segment]);
  const b = map.nodes.find((n) => n.id === route[segment + 1]);
  const c = map.nodes.find((n) => n.id === route[segment + 2]);
  if (!a || !b || !c) return `Continue toward ${destination}`;
  const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
  return Math.abs(cross) < 1
    ? "Continue straight"
    : cross > 0
      ? `Turn right at ${b.label}`
      : `Turn left at ${b.label}`;
}
export function findNearestNode(map: ParkingMap, point: { x: number; y: number }) {
  return [...map.nodes].sort(
    (a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y),
  )[0];
}
export function distanceToFacility(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = Math.PI / 180;
  const dlat = (b.lat - a.lat) * rad,
    dlng = (b.lng - a.lng) * rad;
  const value =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dlng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
export function getGeofenceState(distance: number, radius: number, accuracy = 0): GeofenceState {
  if (accuracy > radius || distance > radius * 3) return "OUTSIDE";
  return distance + accuracy <= radius ? "ARRIVED" : "APPROACHING";
}
export function isInsideGeofence(distance: number, radius: number, accuracy = 0) {
  return getGeofenceState(distance, radius, accuracy) === "ARRIVED";
}

export interface LocationProvider {
  getLocation(): Promise<{ lat: number; lng: number; accuracy: number }>;
}
export class MockLocationProvider implements LocationProvider {
  constructor(private point: { lat: number; lng: number }) {}
  async getLocation() {
    return { ...this.point, accuracy: 0 };
  }
}
export class BrowserGPSLocationProvider implements LocationProvider {
  getLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location unavailable. Continue in demo mode."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        (e) =>
          reject(
            new Error(
              e.code === 1
                ? "Location permission denied. Demo navigation remains available."
                : "Location unavailable. Demo navigation remains available.",
            ),
          ),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
      );
    });
  }
}
