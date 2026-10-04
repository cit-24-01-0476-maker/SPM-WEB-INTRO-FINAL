import { useParking } from "@/lib/parking/useParking";
import {
  activeBooking,
  activeSession,
  defaultVehicle,
  availableSpaces,
  recommendParking,
} from "@/lib/parking/service";
import { calculateDuration, calculateParkingCharge, money } from "@/lib/parking/billing";
import { PageTitle, Panel, Stat, Status, Empty } from "./ui";
import { dateTime } from "@/lib/parking/format";
export function DriverDashboard() {
  const { state, run } = useParking();
  const driver = state.drivers.find((d) => d.id === state.currentDriverId)!;
  const vehicle = defaultVehicle(state),
    booking = activeBooking(state),
    session = activeSession(state);
  return (
    <>
      <PageTitle
        title={`Welcome, ${driver.name}`}
        description="Your next parking journey starts here."
        action={
          <a className="eco-button" href="/app/parking">
            Find Parking →
          </a>
        }
      />
      <div className="parking-stats-grid">
        <Stat
          label="Selected vehicle"
          value={vehicle?.plate ?? "Add a car"}
          note={vehicle?.nickname}
        />
        <Stat label="Wallet balance" value={money(state.wallets[driver.id] ?? 0)} />
        <Stat label="Active booking" value={booking?.slotId ?? "None"} note={booking?.status} />
        <Stat
          label="Current charge"
          value={
            session && booking
              ? money(calculateParkingCharge(calculateDuration(session), booking.pricing))
              : money(0)
          }
          note="Demo payment"
        />
      </div>
      <div className="parking-quick-actions">
        {[
          ["/app/parking", "Find Parking"],
          ["/app/bookings", "My Booking"],
          ["/app/wallet", "Wallet"],
          ["/app/find-car", "Find My Car"],
        ].map(([href, label]) => (
          <a href={href} key={href}>
            {label} →
          </a>
        ))}
      </div>
      <div className="parking-two-column">
        <Panel title="Your parking journey">
          {booking ? (
            <div className="parking-booking-summary">
              <Status value={booking.status} />
              <h3>{state.facilities.find((f) => f.id === booking.facilityId)?.name}</h3>
              <p>
                Space {booking.slotId} · Vehicle {booking.plate}
              </p>
              <p>Arrival {dateTime(booking.arrivalAt)}</p>
              <a href={session ? "/app/session" : "/app/bookings"} className="eco-button">
                Continue journey →
              </a>
            </div>
          ) : (
            <Empty
              title="Ready when you are"
              description="Choose an open facility and reserve your preferred space."
              href="/app/parking"
            />
          )}
        </Panel>
        <Panel title="Nearby parking">
          {recommendParking(state)
            .slice(0, 3)
            .map(({ facility: f }) => (
              <a className="parking-list-row" key={f.id} href={`/app/parking/${f.id}`}>
                <div>
                  <h3>{f.name}</h3>
                  <p>
                    {f.distanceKm} km · {availableSpaces(f)} spaces available
                  </p>
                </div>
                <strong>{money(f.pricing.firstHour)}</strong>
              </a>
            ))}
        </Panel>
      </div>
      <div className="parking-two-column">
        <Panel title="Notifications">
          <button
            className="parking-text-button"
            onClick={() => void run({ type: "NOTIFICATIONS_READ" })}
          >
            Mark all read
          </button>
          {state.notifications
            .filter((n) => n.driverId === driver.id)
            .slice(0, 5)
            .map((n) => (
              <div className="parking-list-row" key={n.id}>
                <div>
                  <h3>
                    {n.title}
                    {!n.read && " •"}
                  </h3>
                  <p>{n.message}</p>
                  <small>{dateTime(n.at)}</small>
                </div>
              </div>
            ))}
          {!state.notifications.some((n) => n.driverId === driver.id) && (
            <p>Your booking, payment and arrival updates will appear here.</p>
          )}
        </Panel>
        <Panel title="Recent bookings">
          {state.bookings
            .filter((b) => b.driverId === driver.id)
            .slice(0, 4)
            .map((b) => (
              <a href="/app/history" className="parking-list-row" key={b.id}>
                <div>
                  <h3>
                    {state.facilities.find((f) => f.id === b.facilityId)?.name} · {b.slotId}
                  </h3>
                  <p>{dateTime(b.createdAt)}</p>
                </div>
                <Status value={b.status} />
              </a>
            ))}
          <a href="/app/demo" className="parking-text-button">
            Try the complete SLTC A05 presentation →
          </a>
        </Panel>
      </div>
    </>
  );
}
