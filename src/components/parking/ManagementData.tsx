import { useState } from "react";
import { useParking } from "@/lib/parking/useParking";
import { money, calculateDuration, calculateParkingCharge } from "@/lib/parking/billing";
import { metrics } from "@/lib/parking/service";
import type { Provider, SlotStatus } from "@/lib/parking/types";
import { Panel, PageTitle, Field, Status, Stat, Empty, Hint } from "./ui";
import { dateTime } from "@/lib/parking/format";
function DataTable({ columns, rows }: { columns: string[]; rows: (string | number)[][] }) {
  function download() {
    const csv = [columns, ...rows]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spm-eco-demo-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      {rows.length ? (
        <>
          <button className="parking-text-button" onClick={download}>
            Export demo CSV
          </button>
          <div className="parking-table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((value, j) => (
                      <td key={j}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty
          title="No records yet"
          description="Run the connected campus demo to create bookings, sessions and transactions."
        />
      )}
    </>
  );
}
export function ManagementData({
  page,
  operations = false,
}: {
  page: string;
  operations?: boolean;
}) {
  const { state, run } = useParking();
  const facilities = state.facilities.filter(
    (f) => operations || f.providerId === state.currentProviderId,
  );
  const ids = new Set(facilities.map((f) => f.id));
  const bookings = state.bookings.filter((b) => ids.has(b.facilityId));
  const bookingIds = new Set(bookings.map((b) => b.id));
  const sessions = state.sessions.filter((s) => bookingIds.has(s.bookingId));
  let columns: string[] = [],
    rows: (string | number)[][] = [];
  const title = page.replaceAll("-", " ");
  if (page === "drivers") {
    columns = ["Name", "Demo email", "Vehicles", "Wallet", "Bookings"];
    rows = state.drivers.map((d) => [
      d.name,
      d.email,
      state.vehicles.filter((v) => v.driverId === d.id).length,
      money(state.wallets[d.id] ?? 0),
      state.bookings.filter((b) => b.driverId === d.id).length,
    ]);
  }
  if (page === "providers") {
    columns = ["Company", "Provider", "Contact", "Facilities", "Status"];
    rows = state.providers.map((p) => [
      p.company,
      p.name,
      p.email,
      state.facilities.filter((f) => f.providerId === p.id).length,
      p.status,
    ]);
  }
  if (page === "bookings") {
    columns = ["Facility", "Space", "Plate", "Arrival", "Status", "Prepayment", "Reference"];
    rows = bookings.map((b) => [
      state.facilities.find((f) => f.id === b.facilityId)!.name,
      b.slotId,
      b.plate,
      dateTime(b.arrivalAt),
      b.status,
      money(b.paid),
      b.id,
    ]);
  }
  if (page === "sessions") {
    columns = ["Facility", "Space", "Plate", "Started", "Duration (min)", "Charge", "Status"];
    rows = sessions.map((p) => {
      const b = bookings.find((b) => b.id === p.bookingId)!;
      return [
        state.facilities.find((f) => f.id === b.facilityId)!.name,
        b.slotId,
        b.plate,
        dateTime(p.startedAt),
        Math.ceil(calculateDuration(p)),
        money(p.charge ?? calculateParkingCharge(calculateDuration(p), b.pricing)),
        p.status,
      ];
    });
  }
  if (page === "transactions") {
    columns = ["Date", "Driver", "Type", "Amount", "Reference"];
    rows = state.transactions
      .filter((t) => operations || (!!t.bookingId && bookingIds.has(t.bookingId)))
      .map((t) => [
        dateTime(t.at),
        state.drivers.find((d) => d.id === t.driverId)?.name ?? t.driverId,
        t.kind,
        money(t.amount),
        t.reference,
      ]);
  }
  if (page === "verifications") {
    columns = ["Date", "Plate", "Stage", "Method", "Result", "Booking"];
    rows = state.verifications
      .filter((v) => bookingIds.has(v.bookingId))
      .map((v) => [dateTime(v.at), v.plate, v.stage, v.method, v.result, v.bookingId]);
  }
  if (page === "reports") {
    columns = ["Facility", "Completed", "Gross", "Commission", "Provider net"];
    rows = facilities.map((f) => {
      const m = metrics({ ...state, facilities: [f] }, f.providerId);
      return [f.name, m.completed, money(m.gross), money(m.commission), money(m.net)];
    });
  }
  return (
    <>
      <PageTitle
        title={title.charAt(0).toUpperCase() + title.slice(1)}
        description="Records from the centralized parking prototype. These are demo records, separate from website visitors and inquiries."
      />
      <Panel>
        <DataTable columns={columns} rows={rows} />
      </Panel>
      {page === "bookings" &&
        bookings.some((b) => ["CONFIRMED", "ARRIVING"].includes(b.status)) && (
          <Panel title="Manage reservations">
            {bookings
              .filter((b) => ["CONFIRMED", "ARRIVING"].includes(b.status))
              .map((b) => (
                <div className="parking-list-row" key={b.id}>
                  <span>
                    {b.plate} · {b.slotId}
                  </span>
                  <button
                    onClick={() =>
                      void run(
                        { type: "MANAGE_CANCEL", id: b.id },
                        "Demo booking cancelled and refunded",
                      )
                    }
                  >
                    Cancel & refund reservation
                  </button>
                </div>
              ))}
          </Panel>
        )}
      {page === "providers" && operations && (
        <Panel title="Provider status">
          {state.providers.map((p) => (
            <div className="parking-list-row" key={p.id}>
              <span>{p.company}</span>
              <button
                onClick={() =>
                  void run(
                    {
                      type: "PROVIDER_STATUS",
                      id: p.id,
                      status: p.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                    },
                    "Provider status updated",
                  )
                }
              >
                {p.status === "ACTIVE" ? "Suspend new bookings" : "Reactivate provider"}
              </button>
            </div>
          ))}
        </Panel>
      )}
      {page === "reports" && (
        <Hint>
          Revenue and configurable commission are recognized only for completed sessions. Wallet
          prepayments are not double-counted as revenue.
        </Hint>
      )}
    </>
  );
}
export function SlotsManager({ operations = false }: { operations?: boolean }) {
  const { state, run } = useParking();
  const facilities = state.facilities.filter(
    (f) => operations || f.providerId === state.currentProviderId,
  );
  return (
    <>
      <PageTitle
        title="Parking Spaces"
        description="Manage manually available, occupied or blocked spaces. Active bookings protect their reserved spaces."
      />
      {facilities.map((f) => (
        <Panel key={f.id} title={f.name}>
          <div className="parking-managed-slots">
            {f.slots.map((p) => (
              <div key={p.id} className="parking-managed-slot">
                <h3>{p.code}</h3>
                <Status value={p.status} />
                <Field label="Change availability">
                  <select
                    value={p.status}
                    onChange={(e) =>
                      void run(
                        {
                          type: "SLOT_STATUS",
                          facilityId: f.id,
                          slotId: p.id,
                          status: e.target.value as SlotStatus,
                        },
                        "Space status saved",
                      )
                    }
                  >
                    <option>AVAILABLE</option>
                    {p.status === "RESERVED" && <option>RESERVED</option>}
                    <option>OCCUPIED</option>
                    <option>BLOCKED</option>
                  </select>
                </Field>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </>
  );
}
export function ManagementSettings({ operations = false }: { operations?: boolean }) {
  const { state, run } = useParking();
  const [rate, setRate] = useState(state.commissionRate * 100);
  const [provider, setProvider] = useState<Provider>(() =>
    structuredClone(state.providers.find((p) => p.id === state.currentProviderId)!),
  );
  const m = metrics(state, operations ? undefined : state.currentProviderId);
  return (
    <>
      <PageTitle
        title="Settings & Business Model"
        description="Parking providers receive net parking revenue. SPM ECO receives a configurable commission from completed sessions."
      />
      <div className="parking-stats-grid">
        <Stat label="Default platform commission" value={`${state.commissionRate * 100}%`} />
        <Stat label="Gross revenue" value={money(m.gross)} />
        <Stat label="Platform commission" value={money(m.commission)} />
        <Stat label="Provider net" value={money(m.net)} />
      </div>
      <Panel title="Commission model">
        <p>
          For a LKR 500 completed parking transaction at the default 10% rate, the platform receives
          LKR 50 and the provider receives LKR 450. Commission is configurable and applies to new
          bookings.
        </p>
        {operations ? (
          <form
            className="parking-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run({ type: "COMMISSION", rate: rate / 100 }, "Default commission saved");
            }}
          >
            <Field label="Platform commission percent">
              <input
                type="number"
                min="0"
                max="100"
                step=".1"
                required
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </Field>
            <button className="eco-button">Save commission</button>
          </form>
        ) : (
          <Hint>
            Rates and commission are quoted at booking time. Updating defaults cannot rewrite an
            existing booking's bill.
          </Hint>
        )}
      </Panel>
      {!operations && (
        <Panel title="Provider contact details">
          <form
            className="parking-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run({ type: "PROVIDER_SAVE", provider }, "Provider details saved");
            }}
          >
            {(["name", "company", "email", "phone"] as const).map((key) => (
              <Field key={key} label={key}>
                <input
                  required
                  type={key === "email" ? "email" : "text"}
                  value={provider[key]}
                  onChange={(e) => setProvider({ ...provider, [key]: e.target.value })}
                />
              </Field>
            ))}
            <button className="eco-button">Save provider</button>
          </form>
        </Panel>
      )}
      <Hint>
        These management areas are open prototype workspaces with fictional records, not secure
        production administrator portals. Existing Website CMS authentication remains separate.
      </Hint>
    </>
  );
}
