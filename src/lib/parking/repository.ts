import { initialState } from "./data";
import { applyAction, type Action } from "./service";
import type { DemoState } from "./types";

const KEY = "spm-parking-prototype-v1";
const serverSnapshot = initialState();
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((listener) => listener());
}
function valid(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const s = value as DemoState;
  return (
    s.schema === 1 &&
    Number.isInteger(s.revision) &&
    Array.isArray(s.drivers) &&
    Array.isArray(s.vehicles) &&
    Array.isArray(s.facilities) &&
    s.facilities.every(
      (f) => Array.isArray(f.slots) && Array.isArray(f.map?.nodes) && Array.isArray(f.map?.edges),
    ) &&
    Array.isArray(s.providers) &&
    Array.isArray(s.bookings) &&
    Array.isArray(s.sessions) &&
    Array.isArray(s.transactions) &&
    Array.isArray(s.notifications) &&
    Array.isArray(s.verifications) &&
    !!s.wallets &&
    Number.isFinite(s.commissionRate)
  );
}
function read(): DemoState | null {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return valid(stored) ? stored : null;
  } catch {
    return null;
  }
}
function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  snapshot = read() ?? initialState();
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) {
      snapshot = read() ?? initialState();
      emit();
    }
  });
}
/** One replaceable demo repository. Browser persistence is never production authorization. */
export const demoRepository = {
  subscribe(listener: () => void) {
    initialize();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    initialize();
    return snapshot;
  },
  getServerSnapshot() {
    return serverSnapshot;
  },
  async execute(action: Action): Promise<void> {
    initialize();
    const execute = () => {
      const latest = read();
      const current = latest && latest.revision > snapshot.revision ? latest : snapshot;
      const next = applyAction(current, action);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* In-memory demo remains usable when persistence is unavailable. */
      }
      snapshot = next;
      emit();
    };
    if (navigator.locks) await navigator.locks.request(KEY, execute);
    else execute();
  },
};
