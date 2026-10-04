import { useParking } from "@/lib/parking/useParking";
import { metrics, availableSpaces } from "@/lib/parking/service";
import { money } from "@/lib/parking/billing";
import { PageTitle, Panel, Stat, Field, Status } from "./ui";
export function ManagementDashboard({ operations = false }: { operations?: boolean }) {
  const { state, run } = useParking();
  const providerId = operations ? undefined : state.currentProviderId;
  const m = metrics(state, providerId);
  const facilities = state.facilities.filter((f) => !providerId || f.providerId === providerId);
  return (
    <>
      <PageTitle
        title={operations ? "Parking Operations" : "Provider Overview"}
        description={
          operations
            ? "Shared platform bookings, sessions, transactions and commission. Separate from the Website CMS."
            : "Manage your facilities and follow the same parking activity as the driver app."
        }
        action={
          <a
            className="eco-button"
            href={operations ? "/parking-admin/reports" : "/provider/facilities"}
          >
            {operations ? "View reports" : "Manage facilities"} →
          </a>
        }
      />
      {!operations && (
        <Panel>
          <div className="parking-provider-switch">
            <Field label="Demo provider">
              <select
                value={state.currentProviderId}
                onChange={(e) => void run({ type: "PROVIDER_SELECT", id: e.target.value })}
              >
                {state.providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company}
                  </option>
                ))}
              </select>
            </Field>
            <a className="parking-text-button" href="/provider/register">
              Register a demo provider →
            </a>
          </div>
        </Panel>
      )}
      <div className="parking-stats-grid">
        {operations && (
          <>
            <Stat label="Drivers" value={state.drivers.length} />
            <Stat label="Providers" value={state.providers.length} />
          </>
        )}
        <Stat label="Facilities" value={m.facilities} />
        <Stat label="Total spaces" value={m.total} />
        <Stat label="Available" value={m.available} />
        <Stat label="Reserved" value={m.reserved} />
        <Stat label="Occupied" value={m.occupied} />
        <Stat label="Active bookings" value={m.activeBookings} />
        <Stat label="Active sessions" value={m.activeSessions} />
        <Stat label="Completed sessions" value={m.completed} />
        <Stat label="Gross parking revenue" value={money(m.gross)} />
        <Stat label="SPM ECO commission" value={money(m.commission)} />
        <Stat label="Provider net revenue" value={money(m.net)} />
        {operations && <Stat label="Verification events" value={state.verifications.length} />}
      </div>
      <div className="parking-two-column">
        <Panel title="Facility occupancy">
          {facilities.map((f) => {
            const occupancy =
              f.slots.filter((p) => p.status === "OCCUPIED").length / f.slots.length;
            return (
              <div className="parking-occupancy" key={f.id}>
                <div>
                  <strong>{f.name}</strong>
                  <span>
                    {Math.round(occupancy * 100)}% occupied · {availableSpaces(f)} available
                  </span>
                </div>
                <progress max="1" value={occupancy} />
              </div>
            );
          })}
        </Panel>
        <Panel title="Connected platform">
          <p>
            Reservations immediately update availability. Parking arrival updates occupancy.
            Completed sessions update the wallet, receipts, provider revenue and platform
            commission.
          </p>
          <div className="parking-list-row">
            <span>Demo platform commission</span>
            <strong>{state.commissionRate * 100}%</strong>
          </div>
          <p>
            Commission is deducted from completed parking revenue; it is not an extra driver fee.
          </p>
          <a href="/app/demo" className="eco-button">
            Run SLTC A05 campus demo →
          </a>
        </Panel>
      </div>
      <Panel title="Recent bookings">
        {state.bookings
          .filter((b) => facilities.some((f) => f.id === b.facilityId))
          .slice(0, 5)
          .map((b) => (
            <div className="parking-list-row" key={b.id}>
              <div>
                <h3>
                  {state.facilities.find((f) => f.id === b.facilityId)?.name} · {b.slotId}
                </h3>
                <p>{b.plate}</p>
              </div>
              <Status value={b.status} />
            </div>
          ))}
        {!m.bookings && <p>No bookings yet. Start the campus demo to see the dashboard update.</p>}
      </Panel>
    </>
  );
}
