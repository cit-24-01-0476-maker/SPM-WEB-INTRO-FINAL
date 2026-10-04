import { useEffect, useState } from "react";
import { useParking } from "@/lib/parking/useParking";
import { activeBooking, activeSession } from "@/lib/parking/service";
import { money } from "@/lib/parking/billing";
import { ParkingMap } from "./ParkingMap";
import { PageTitle, Panel, Stat, Status, Hint } from "./ui";
export function CampusDemo() {
  const { state, run } = useParking();
  const [running, setRunning] = useState(false),
    [resetOpen, setResetOpen] = useState(false);
  const b = activeBooking(state, "driver-demo"),
    session = activeSession(state),
    facility = state.facilities.find((f) => f.id === "sltc")!;
  const completed = state.sessions.some(
    (s) =>
      s.status === "COMPLETED" &&
      state.bookings.find((b) => b.id === s.bookingId)?.driverId === "driver-demo",
  );
  useEffect(() => {
    if (!running || completed) return;
    const timer = setTimeout(() => {
      void run({ type: "DEMO_NEXT" }).then((ok) => {
        if (!ok) setRunning(false);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [running, state.demoStep, completed, run]);
  const stage = completed
    ? "Receipt ready · Demo complete"
    : !state.currentDriverId
      ? "Enter demo driver"
      : !state.selection && !b
        ? "Find SLTC Main Parking"
        : !b
          ? "Select A05 & confirm booking"
          : b.status === "CONFIRMED"
            ? "Start outdoor navigation"
            : b.status === "ARRIVING"
              ? state.navigation?.progress === 1
                ? "Entry verification"
                : "Approach facility geofence"
              : b.status === "CHECKED_IN"
                ? state.navigation?.progress === 1
                  ? "Park at A05"
                  : "Follow custom map to A05"
                : state.navigation?.mode === "EXIT"
                  ? state.navigation.progress === 1
                    ? "Exit verification & final payment"
                    : "Follow calculated exit route"
                  : "Active parking session";
  return (
    <>
      <PageTitle
        title="SLTC Campus Presentation"
        description="The connected A05 parking journey, from reservation to final receipt. All steps use the same services as the driver app."
      />
      <Panel title={stage}>
        <div className="eco-actions">
          <button className="eco-button" disabled={completed} onClick={() => setRunning(true)}>
            Start Demo
          </button>
          <button onClick={() => setRunning(false)}>Pause</button>
          <button
            disabled={completed}
            onClick={() => {
              setRunning(false);
              void run({ type: "DEMO_NEXT" });
            }}
          >
            Next Step
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setResetOpen(true);
            }}
          >
            Reset Demo
          </button>
          <a className="parking-text-button" href="/provider">
            Open provider dashboard →
          </a>
          <a className="parking-text-button" href="/parking-admin">
            Open parking operations →
          </a>
        </div>
        {resetOpen && (
          <div className="parking-reset-confirm">
            <p>
              Reset the shared demo dataset? This clears demo bookings, payments, facilities and map
              edits in this browser. The Website CMS is unaffected.
            </p>
            <button
              onClick={async () => {
                if (await run({ type: "RESET" }, "Demo reset")) setResetOpen(false);
              }}
            >
              Reset shared demo data
            </button>
            <button onClick={() => setResetOpen(false)}>Keep current demo</button>
          </div>
        )}
        <Hint>
          Start runs the presentation automatically. Pause and Next Step let you explain each stage.
          Vehicle, wallet and facility data are fictional. No external hardware or service
          credentials are needed.
        </Hint>
      </Panel>
      <div className="parking-stats-grid">
        <Stat label="Demo destination" value="A05" />
        <Stat
          label="Space status"
          value={
            <Status
              value={
                state.selection?.slotId === "A05"
                  ? "SELECTED"
                  : (facility.slots.find((p) => p.id === "A05")?.status ?? "AVAILABLE")
              }
            />
          }
        />
        <Stat label="Wallet" value={money(state.wallets["driver-demo"])} />
        <Stat
          label="Session"
          value={completed ? "COMPLETED" : session ? "ACTIVE" : "Not started"}
        />
      </div>
      <Panel className="parking-map-panel">
        <ParkingMap
          facility={facility}
          selected={state.selection?.facilityId === "sltc" ? state.selection.slotId : undefined}
          navigation={state.navigation}
        />
      </Panel>
      <div className="parking-demo-milestones">
        {["Find", "Book", "Navigate", "Verify", "Park", "Exit", "Receipt"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      {completed && (
        <Panel title="Journey complete">
          <p>
            A05 is available again. Wallet, transaction history, platform commission and provider
            revenue have been updated.
          </p>
          <a className="eco-button" href="/app/history">
            View final receipt →
          </a>
        </Panel>
      )}
    </>
  );
}
