import { useEffect, useState, type FormEvent } from "react";
import { useParking } from "@/lib/parking/useParking";
import { createLayout } from "@/lib/parking/data";
import { uid, availableSpaces } from "@/lib/parking/service";
import { DEFAULT_PRICING, money } from "@/lib/parking/billing";
import type { Facility, Provider } from "@/lib/parking/types";
import { PageTitle, Panel, Field, Status, Hint } from "./ui";
export function FacilityManager({
  operations = false,
  register = false,
  pricingOnly = false,
  facilityId,
}: {
  operations?: boolean;
  register?: boolean;
  pricingOnly?: boolean;
  facilityId?: string;
}) {
  const { state, run } = useParking();
  const own = state.facilities.filter(
    (f) => operations || f.providerId === state.currentProviderId,
  );
  const fresh = (): Facility => ({
    id: uid("facility"),
    providerId: state.currentProviderId,
    name: "",
    address: "",
    lat: 6.837,
    lng: 80.091,
    open: "06:00",
    close: "23:00",
    status: "OPEN",
    distanceKm: 1,
    geofenceRadius: 100,
    pricing: { ...DEFAULT_PRICING },
    rules: "Keep lanes clear. Park only in your reserved space.",
    entrance: "Main entrance",
    exit: "East exit",
    ...createLayout(),
  });
  const [draft, setDraft] = useState<Facility>(() =>
    pricingOnly && own[0] ? structuredClone(own[0]) : fresh(),
  );
  const [count, setCount] = useState(5);
  const [editing, setEditing] = useState(pricingOnly);
  useEffect(() => {
    if (!facilityId) return;
    const facility = state.facilities.find(
      (f) => f.id === facilityId && (operations || f.providerId === state.currentProviderId),
    );
    if (facility) {
      setDraft(structuredClone(facility));
      setEditing(true);
    }
  }, [facilityId, operations, state.currentProviderId, state.facilities]);
  const [provider, setProvider] = useState<Provider>(() => ({
    id: uid("provider"),
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  }));
  function change<K extends keyof Facility>(key: K, value: Facility[K]) {
    setDraft({ ...draft, [key]: value });
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const facility = editing ? draft : { ...draft, ...createLayout(count) };
    const ok = await run(
      register
        ? {
            type: "PROVIDER_REGISTER",
            provider,
            facility: { ...facility, providerId: provider.id },
          }
        : { type: "FACILITY_SAVE", facility },
      register ? "Demo provider registered" : "Facility saved",
    );
    if (ok) {
      if (register) window.location.assign("/provider");
      else {
        setDraft(fresh());
        setEditing(false);
      }
    }
  }
  return (
    <>
      <PageTitle
        title={register ? "Join SPM ECO" : pricingOnly ? "Facility Pricing" : "Parking Facilities"}
        description={
          register
            ? "Register a demo parking provider and configure its first facility."
            : "Configure facility information, hours and pricing. Each facility has its own editable map."
        }
      />
      <div className="parking-two-column">
        {!register && (
          <Panel title="Facilities">
            {own.map((f) => (
              <div className="parking-list-row" key={f.id}>
                <div>
                  <h3>{f.name}</h3>
                  <a href={`${operations ? "/parking-admin" : "/provider"}/facilities/${f.id}`}>
                    Facility details →
                  </a>
                  <p>{f.address}</p>
                  <p>
                    {availableSpaces(f)}/{f.slots.length} available · {money(f.pricing.firstHour)}
                  </p>
                  <Status value={f.status} />
                </div>
                <div className="parking-row-actions">
                  <button
                    onClick={() => {
                      setDraft(structuredClone(f));
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <a href={`${operations ? "/parking-admin" : "/provider"}/map?facility=${f.id}`}>
                    Map
                  </a>
                  <a href={`/app/parking/${f.id}`}>Preview</a>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setDraft(fresh());
                setEditing(false);
              }}
            >
              Add parking facility
            </button>
          </Panel>
        )}
        <Panel
          title={
            register
              ? "Provider & facility details"
              : editing
                ? `Edit ${draft.name}`
                : "Add facility"
          }
        >
          <form className="parking-form" onSubmit={(e) => void save(e)}>
            {register && (
              <>
                <Field label="Provider name">
                  <input
                    required
                    value={provider.name}
                    onChange={(e) => setProvider({ ...provider, name: e.target.value })}
                  />
                </Field>
                <Field label="Company name">
                  <input
                    required
                    value={provider.company}
                    onChange={(e) => setProvider({ ...provider, company: e.target.value })}
                  />
                </Field>
                <Field label="Contact email">
                  <input
                    type="email"
                    required
                    value={provider.email}
                    onChange={(e) => setProvider({ ...provider, email: e.target.value })}
                  />
                </Field>
                <Field label="Contact phone">
                  <input
                    required
                    value={provider.phone}
                    onChange={(e) => setProvider({ ...provider, phone: e.target.value })}
                  />
                </Field>
              </>
            )}
            <Field label="Facility name">
              <input required value={draft.name} onChange={(e) => change("name", e.target.value)} />
            </Field>
            <Field label="Address">
              <input
                required
                value={draft.address}
                onChange={(e) => change("address", e.target.value)}
              />
            </Field>
            {operations && (
              <Field label="Provider">
                <select
                  value={draft.providerId}
                  onChange={(e) => change("providerId", e.target.value)}
                >
                  {state.providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.company}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <div className="parking-form-pair">
              <Field label="Latitude">
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={draft.lat}
                  onChange={(e) => change("lat", Number(e.target.value))}
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={draft.lng}
                  onChange={(e) => change("lng", Number(e.target.value))}
                />
              </Field>
            </div>
            <div className="parking-form-pair">
              <Field label="Opening time">
                <input
                  type="time"
                  required
                  value={draft.open}
                  onChange={(e) => change("open", e.target.value)}
                />
              </Field>
              <Field label="Closing time">
                <input
                  type="time"
                  required
                  value={draft.close}
                  onChange={(e) => change("close", e.target.value)}
                />
              </Field>
            </div>
            <div className="parking-form-pair">
              <Field label="First-hour price">
                <input
                  type="number"
                  min="0"
                  step=".01"
                  required
                  value={draft.pricing.firstHour}
                  onChange={(e) =>
                    change("pricing", { ...draft.pricing, firstHour: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Additional started hour">
                <input
                  type="number"
                  min="0"
                  step=".01"
                  required
                  value={draft.pricing.additionalHour}
                  onChange={(e) =>
                    change("pricing", { ...draft.pricing, additionalHour: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            {!editing && (
              <Field label="Total spaces (prototype: 1–10)">
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </Field>
            )}
            <Field label="Entrance information">
              <input
                required
                value={draft.entrance}
                onChange={(e) => change("entrance", e.target.value)}
              />
            </Field>
            <Field label="Exit information">
              <input required value={draft.exit} onChange={(e) => change("exit", e.target.value)} />
            </Field>
            <Field label="Parking rules">
              <textarea value={draft.rules} onChange={(e) => change("rules", e.target.value)} />
            </Field>
            <Field label="Facility status">
              <select
                value={draft.status}
                onChange={(e) => change("status", e.target.value as Facility["status"])}
              >
                <option>OPEN</option>
                <option>CLOSED</option>
              </select>
            </Field>
            <button className="eco-button">
              {register ? "Register demo provider" : "Save facility"}
            </button>
            <Hint>
              Facility registration is simulated. Rates apply to new bookings; existing bookings
              keep their quoted prices. Configure the new layout in Map Editor.
            </Hint>
          </form>
        </Panel>
      </div>
    </>
  );
}
