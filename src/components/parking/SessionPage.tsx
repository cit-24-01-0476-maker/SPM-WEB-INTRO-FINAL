import { useEffect, useState } from "react";
import { useParking } from "@/lib/parking/useParking";
import { activeBooking, activeSession } from "@/lib/parking/service";
import {
  calculateDuration,
  calculateOutstandingAmount,
  calculateParkingCharge,
  calculatePlatformCommission,
  calculateProviderRevenue,
  money,
} from "@/lib/parking/billing";
import { Panel, PageTitle, Stat, Empty, Status, Field, Hint } from "./ui";
import { dateTime } from "@/lib/parking/format";
import type { PaymentOutcome } from "@/lib/parking/types";
export function SessionPage() {
  const { state, run } = useParking();
  const b = activeBooking(state),
    session = activeSession(state);
  const [now, setNow] = useState(Date.now),
    [outcome, setOutcome] = useState<PaymentOutcome>("SUCCESS");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!session || !b)
    return (
      <>
        <PageTitle
          title="Parking Session"
          description="Your parking timer, running charge and exit journey."
        />
        <Panel>
          <Empty
            title="No active session"
            description="Follow your booked route and park at your reserved space to start a session."
            href={
              state.sessions.some((p) => p.status === "COMPLETED")
                ? "/app/history"
                : "/app/bookings"
            }
            label={
              state.sessions.some((p) => p.status === "COMPLETED") ? "View receipt" : "My Booking"
            }
          />
        </Panel>
      </>
    );
  const f = state.facilities.find((f) => f.id === b.facilityId)!;
  const minutes = calculateDuration(session, now),
    charge = calculateParkingCharge(minutes, b.pricing),
    outstanding = calculateOutstandingAmount(charge, b.paid);
  const ready =
    state.navigation?.mode === "EXIT" &&
    state.navigation.progress >= 1 &&
    state.verifications.some(
      (v) => v.bookingId === b.id && v.stage === "EXIT" && v.result === "APPROVED",
    );
  async function navigate(type: "FIND_CAR" | "EXIT_START") {
    if (await run({ type })) window.location.assign("/app/navigation");
  }
  return (
    <>
      <PageTitle
        title={ready ? "Final bill" : "Your Parking Session"}
        description={`${f.name} · Space ${b.slotId} · ${b.plate}`}
        action={<Status value="ACTIVE" />}
      />
      <div className="parking-stats-grid">
        <Stat
          label="Parking duration"
          value={`${Math.floor(minutes)}m ${Math.floor((minutes % 1) * 60)}s`}
          note="Includes controlled simulated time"
        />
        <Stat label="Estimated charge" value={money(charge)} />
        <Stat label="Previously paid" value={money(b.paid)} />
        <Stat label="Outstanding" value={money(outstanding)} />
      </div>
      <div className="parking-two-column">
        <Panel title="Session information">
          <dl className="parking-details">
            <dt>Started</dt>
            <dd>{dateTime(session.startedAt)}</dd>
            <dt>First hour</dt>
            <dd>{money(b.pricing.firstHour)}</dd>
            <dt>Additional started hour</dt>
            <dd>{money(b.pricing.additionalHour)}</dd>
            <dt>Wallet</dt>
            <dd>{money(state.wallets[b.driverId] ?? 0)}</dd>
            <dt>Platform commission ({b.commissionRate * 100}%)</dt>
            <dd>{money(calculatePlatformCommission(charge, b.commissionRate))}</dd>
            <dt>Provider net</dt>
            <dd>{money(calculateProviderRevenue(charge, b.commissionRate))}</dd>
          </dl>
          <button
            onClick={() => void run({ type: "TIME_ADD", minutes: 60 }, "Added one simulated hour")}
          >
            Add 60 minutes (demo)
          </button>
          <Hint>
            Pricing and commission are locked to the booking. Final payment deducts only the
            outstanding amount.
          </Hint>
        </Panel>
        <Panel title={ready ? "Complete demo payment" : "Your next step"}>
          {ready ? (
            <form
              className="parking-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (await run({ type: "COMPLETE", outcome }, "Parking complete. Receipt ready."))
                  window.location.assign("/app/history");
              }}
            >
              <Field label="Demo payment outcome">
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as PaymentOutcome)}
                >
                  {["SUCCESS", "FAILED", "CANCELLED", "TIMEOUT"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <p>
                Final amount due: <strong>{money(outstanding)}</strong>
              </p>
              <button className="eco-button">Pay outstanding & complete parking</button>
              <Hint>
                Successful payment creates a receipt and releases your parking space. Failed
                payments keep the session active.
              </Hint>
            </form>
          ) : (
            <>
              <p>
                Find your parked car using the custom map, or follow the calculated route to the
                exit.
              </p>
              <div className="eco-actions">
                <button className="eco-button" onClick={() => void navigate("FIND_CAR")}>
                  Find My Car
                </button>
                <button onClick={() => void navigate("EXIT_START")}>Navigate to Exit →</button>
              </div>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
