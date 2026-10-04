import { useState } from "react";
import { useParking } from "@/lib/parking/useParking";
import {
  availableSpaces,
  driverVehicles,
  defaultVehicle,
  nextOpeningArrival,
} from "@/lib/parking/service";
import { money } from "@/lib/parking/billing";
import { ParkingPhoto } from "@/components/site/ParkingPhoto";
import { ParkingMap } from "./ParkingMap";
import { PageTitle, Panel, Field, Status, Stat, Empty, Hint } from "./ui";

export function ParkingSearch() {
  const { state } = useParking();
  const [search, setSearch] = useState(""),
    [available, setAvailable] = useState(false),
    [open, setOpen] = useState(false),
    [sort, setSort] = useState("distance"),
    [maxPrice, setMaxPrice] = useState(1000);
  const facilities = state.facilities
    .filter(
      (f) =>
        (f.name + f.address).toLowerCase().includes(search.toLowerCase()) &&
        (!available || availableSpaces(f) > 0) &&
        (!open || f.status === "OPEN") &&
        f.pricing.firstHour <= maxPrice &&
        state.providers.find((p) => p.id === f.providerId)?.status === "ACTIVE",
    )
    .sort((a, b) =>
      sort === "price" ? a.pricing.firstHour - b.pricing.firstHour : a.distanceKm - b.distanceKm,
    );
  return (
    <>
      <PageTitle
        title="Find Parking"
        description="Discover parking near your destination. Availability reflects the shared campus demo."
      />
      <Panel>
        <div className="parking-search-filters">
          <Field label="Search">
            <input
              placeholder="Facility or address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
          <Field label="Sort by">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="distance">Distance</option>
              <option value="price">Price</option>
            </select>
          </Field>
          <Field label="Maximum first-hour price">
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </Field>
          <label className="parking-check">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Available spaces
          </label>
          <label className="parking-check">
            <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} />
            Open now
          </label>
        </div>
      </Panel>
      <div className="parking-facility-grid">
        {facilities.map((f) => (
          <Panel key={f.id} className="parking-facility-card">
            <ParkingPhoto className="parking-facility-photo" />
            <div className="parking-card-header">
              <h2>{f.name}</h2>
              <Status value={f.status} />
            </div>
            <p>{f.address}</p>
            <p>
              {f.distanceKm} km · {f.open}–{f.close}
            </p>
            <div className="parking-facility-numbers">
              <strong>
                {availableSpaces(f)} / {f.slots.length} available
              </strong>
              <span>{money(f.pricing.firstHour)} / first hour</span>
            </div>
            <div className="eco-actions">
              <a className="eco-button" href={`/app/parking/${f.id}`}>
                View Details
              </a>
              <a className="parking-text-button" href={`/app/parking/${f.id}#select-space`}>
                Navigate / book →
              </a>
            </div>
          </Panel>
        ))}
      </div>
      {!facilities.length && (
        <Panel>
          <Empty
            title="No parking found"
            description="Try a different name, price or availability filter."
          />
        </Panel>
      )}
      <Hint>
        Distances and operating status are demonstration values. No live map API is required.
      </Hint>
    </>
  );
}
export function FacilityDetails({ id }: { id: string }) {
  const { state, run } = useParking();
  const facility = state.facilities.find((f) => f.id === id);
  const [vehicleId, setVehicleId] = useState(defaultVehicle(state)?.id ?? "");
  const [arrival, setArrival] = useState(() => {
    const at = Date.now() + 5 * 60000;
    const d = new Date(facility ? nextOpeningArrival(facility, at) : at);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [outcome, setOutcome] = useState<"SUCCESS" | "FAILED" | "CANCELLED" | "TIMEOUT">("SUCCESS");
  const [busy, setBusy] = useState(false);
  if (!facility)
    return (
      <Empty
        title="Facility not found"
        description="Choose one of the available parking facilities."
        href="/app/parking"
      />
    );
  const selected = state.selection?.facilityId === facility.id ? state.selection.slotId : undefined;
  const provider = state.providers.find((p) => p.id === facility.providerId);
  async function book() {
    setBusy(true);
    if (
      await run(
        { type: "BOOK", vehicleId, arrivalAt: new Date(arrival).getTime(), outcome },
        "Booking confirmed",
      )
    )
      window.location.assign("/app/bookings");
    setBusy(false);
  }
  return (
    <>
      <PageTitle
        title={facility.name}
        description={facility.address}
        action={<Status value={facility.status} />}
      />
      <div className="parking-stats-grid">
        <Stat
          label="Available spaces"
          value={`${availableSpaces(facility)} / ${facility.slots.length}`}
        />
        <Stat label="First hour" value={money(facility.pricing.firstHour)} />
        <Stat label="Additional started hour" value={money(facility.pricing.additionalHour)} />
        <Stat label="Opening hours" value={`${facility.open}–${facility.close}`} />
      </div>
      <div className="parking-two-column parking-map-layout">
        <Panel title="Select Parking Slot" className="parking-map-panel">
          <div id="select-space">
            <ParkingMap
              facility={facility}
              selected={selected}
              onSelect={(slotId) => void run({ type: "SELECT", facilityId: id, slotId })}
            />
          </div>
          <Hint>
            A05 is the primary SLTC presentation destination. Only available spaces can be selected.
          </Hint>
        </Panel>
        <Panel title="Continue to Booking">
          <form
            className="parking-form"
            onSubmit={(e) => {
              e.preventDefault();
              void book();
            }}
          >
            <p>
              Selected space: <strong>{selected ?? "Choose on the map"}</strong>
            </p>
            <Field label="Vehicle">
              <select value={vehicleId} required onChange={(e) => setVehicleId(e.target.value)}>
                <option value="">Select vehicle</option>
                {driverVehicles(state).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} · {v.nickname}
                  </option>
                ))}
              </select>
            </Field>
            {!driverVehicles(state).length && (
              <a href="/app/vehicles" className="parking-text-button">
                Add a vehicle first →
              </a>
            )}
            <Field label="Arrival time">
              <input
                type="datetime-local"
                required
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
              />
            </Field>
            <Field label="Demo payment outcome">
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as typeof outcome)}
              >
                {["SUCCESS", "FAILED", "CANCELLED", "TIMEOUT"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <div className="parking-payment-summary">
              <span>First-hour prepayment</span>
              <strong>{money(facility.pricing.firstHour)}</strong>
              <small>
                Wallet {money(state.wallets[state.currentDriverId ?? ""] ?? 0)}. Additional started
                hours are settled on exit.
              </small>
            </div>
            <button
              className="eco-button"
              disabled={!selected || facility.status !== "OPEN" || busy}
            >
              {busy ? "Confirming…" : "Confirm & pay with demo wallet"}
            </button>
            <Hint>Mock payment only. No card details or real funds.</Hint>
          </form>
        </Panel>
      </div>
      <Panel title="Facility information">
        <div className="parking-two-column">
          <div>
            <p>
              <strong>Provider:</strong> {provider?.company}
            </p>
            <p>
              <strong>Distance:</strong> {facility.distanceKm} km (demo)
            </p>
            <p>
              <strong>Rules:</strong> {facility.rules}
            </p>
          </div>
          <div>
            <p>
              <strong>Entrance:</strong> {facility.entrance}
            </p>
            <p>
              <strong>Exit:</strong> {facility.exit}
            </p>
            <p>
              Outdoor demo navigation begins after booking; the custom map guides you from the
              entrance to your space.
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}
