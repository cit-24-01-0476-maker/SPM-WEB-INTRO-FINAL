import { useState } from "react";
import { useParking } from "@/lib/parking/useParking";
import { activeBooking } from "@/lib/parking/service";
import { money, calculateDuration } from "@/lib/parking/billing";
import type { PaymentOutcome } from "@/lib/parking/types";
import { PageTitle, Panel, Field, Empty, Status, Stat, Hint } from "./ui";
import { dateTime } from "@/lib/parking/format";
export function BookingsPage({ bookingId }: { bookingId?: string }) {
  const { state, run } = useParking();
  const b = bookingId
    ? state.bookings.find((b) => b.id === bookingId && b.driverId === state.currentDriverId)
    : activeBooking(state);
  if (!b)
    return (
      <>
        <PageTitle
          title="My Booking"
          description="Your reservation, vehicle and entry token in one place."
        />
        <Panel>
          <Empty
            title="No active booking"
            description="Find a facility and choose an available space to begin."
            href="/app/parking"
          />
        </Panel>
      </>
    );
  const f = state.facilities.find((f) => f.id === b.facilityId)!;
  const expired = Date.now() > b.expiresAt && ["CONFIRMED", "ARRIVING"].includes(b.status);
  return (
    <>
      <PageTitle title="My Booking" description={f.name} />
      <div className="parking-two-column">
        <Panel title={`Reserved space ${b.slotId}`}>
          <Status value={expired ? "EXPIRED" : b.status} />
          <dl className="parking-details">
            <dt>Vehicle</dt>
            <dd>{b.plate}</dd>
            <dt>Arrival</dt>
            <dd>{dateTime(b.arrivalAt)}</dd>
            <dt>Arrival grace period ends</dt>
            <dd>{dateTime(b.expiresAt)}</dd>
            <dt>Paid</dt>
            <dd>{money(b.paid)}</dd>
            <dt>Booking reference</dt>
            <dd>{b.id}</dd>
          </dl>
          <div className="eco-actions">
            {["COMPLETED", "CANCELLED", "EXPIRED"].includes(b.status) && (
              <a className="eco-button" href="/app/history">
                View history & receipt
              </a>
            )}
            {["CONFIRMED", "ARRIVING"].includes(b.status) && !expired && (
              <button
                className="eco-button"
                onClick={async () => {
                  if (await run({ type: "OUTDOOR_START", bookingId: b.id }))
                    window.location.assign("/app/navigation");
                }}
              >
                Start outdoor navigation
              </button>
            )}
            {b.status === "CHECKED_IN" && (
              <a className="eco-button" href="/app/navigation">
                Navigate to reserved space
              </a>
            )}
            {b.status === "ACTIVE" && (
              <a className="eco-button" href="/app/session">
                Open parking session
              </a>
            )}
            {["CONFIRMED", "ARRIVING"].includes(b.status) && (
              <button
                onClick={() =>
                  void run(
                    expired ? { type: "EXPIRE", id: b.id } : { type: "CANCEL", id: b.id },
                    "Reservation released and payment refunded",
                  )
                }
              >
                {expired ? "Release expired booking" : "Cancel & refund"}
              </button>
            )}
          </div>
        </Panel>
        <Panel title="Demo QR fallback">
          <div className="parking-qr-demo" aria-label="Demo booking verification token">
            <span>SPM ECO</span>
            <strong>{b.slotId}</strong>
            <small>DEMO QR TOKEN</small>
          </div>
          <code className="parking-token">{b.qrToken}</code>
          <Hint>
            This is a simulated QR token, not a production access credential. Use the QR
            verification simulator if the plate scan fails.
          </Hint>
          <p>{f.entrance}</p>
          <p>{f.rules}</p>
        </Panel>
      </div>
    </>
  );
}
export function WalletPage() {
  const { state, run } = useParking();
  const [amount, setAmount] = useState(500);
  const [outcome, setOutcome] = useState<PaymentOutcome>("SUCCESS");
  const balance = state.wallets[state.currentDriverId ?? ""] ?? 0;
  return (
    <>
      <PageTitle
        title="Wallet"
        description="Simulated top-ups and parking payments. No real money or card information."
      />
      <div className="parking-two-column">
        <Panel title="Demo balance">
          <Stat label="Available balance" value={money(balance)} />
          <form
            className="parking-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run({ type: "TOP_UP", amount, outcome }, "Demo top-up received");
            }}
          >
            <Field label="Top-up amount">
              <input
                required
                type="number"
                min="1"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </Field>
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
            <button className="eco-button">Top up demo wallet</button>
          </form>
        </Panel>
        <Panel title="Transaction history">
          {state.transactions
            .filter((t) => t.driverId === state.currentDriverId)
            .map((t) => (
              <div className="parking-list-row" key={t.id}>
                <div>
                  <h3>{t.kind.replaceAll("_", " ")}</h3>
                  <p>{dateTime(t.at)}</p>
                  <small className="parking-break-word">{t.reference}</small>
                </div>
                <strong className={t.amount < 0 ? "parking-debit" : "parking-credit"}>
                  {t.amount > 0 ? "+" : ""}
                  {money(t.amount)}
                </strong>
              </div>
            ))}
          {!state.transactions.some((t) => t.driverId === state.currentDriverId) && (
            <Empty
              title="No transactions"
              description="Your demo top-ups and parking charges will appear here."
            />
          )}
        </Panel>
      </div>
    </>
  );
}
export function HistoryPage() {
  const { state } = useParking();
  const bookings = state.bookings.filter((b) => b.driverId === state.currentDriverId);
  return (
    <>
      <PageTitle
        title="History & Receipts"
        description="Your bookings, completed sessions and final demo receipts."
      />
      {!bookings.length && (
        <Panel>
          <Empty
            title="No booking history"
            description="Complete your first parking journey to see the receipt here."
            href="/app/parking"
          />
        </Panel>
      )}
      {bookings.map((b) => {
        const f = state.facilities.find((f) => f.id === b.facilityId);
        const session = state.sessions.find((s) => s.bookingId === b.id);
        return (
          <Panel key={b.id} title={`${f?.name} · ${b.slotId}`}>
            <a href={`/app/bookings/${b.id}`}>View booking details →</a>
            <Status value={b.status} />
            <p>
              Vehicle {b.plate} · Booked {dateTime(b.createdAt)}
            </p>
            {session?.status === "COMPLETED" ? (
              <div className="parking-receipt">
                <h3>Demo payment receipt</h3>
                <dl className="parking-details">
                  <dt>Provider</dt>
                  <dd>{state.providers.find((p) => p.id === f?.providerId)?.company}</dd>
                  <dt>Space / vehicle</dt>
                  <dd>
                    {b.slotId} / {b.plate}
                  </dd>
                  <dt>Started</dt>
                  <dd>{dateTime(session.startedAt)}</dd>
                  <dt>Ended</dt>
                  <dd>{dateTime(session.endedAt!)}</dd>
                  <dt>Duration (includes simulated time)</dt>
                  <dd>{Math.ceil(calculateDuration(session))} minutes</dd>
                  <dt>Total parking charge</dt>
                  <dd>{money(session.charge ?? 0)}</dd>
                  <dt>Previously paid</dt>
                  <dd>{money(b.paid)}</dd>
                  <dt>Final payment</dt>
                  <dd>{money((session.charge ?? 0) - b.paid)}</dd>
                  <dt>Platform commission ({b.commissionRate * 100}%)</dt>
                  <dd>{money(session.commission ?? 0)}</dd>
                  <dt>Provider net</dt>
                  <dd>{money(session.providerNet ?? 0)}</dd>
                  <dt>Payment</dt>
                  <dd>SUCCESS · Demo wallet</dd>
                  <dt>Reference</dt>
                  <dd>{session.reference}</dd>
                </dl>
                <button onClick={() => window.print()}>Print receipt</button>
              </div>
            ) : (
              <p>
                {["CANCELLED", "EXPIRED"].includes(b.status)
                  ? "Reservation released. Demo payment refunded."
                  : "Receipt will be available after exit verification and final payment."}
              </p>
            )}
          </Panel>
        );
      })}
    </>
  );
}
