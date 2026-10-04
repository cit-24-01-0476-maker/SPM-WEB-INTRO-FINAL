import { useState, type FormEvent } from "react";
import { useParking } from "@/lib/parking/useParking";
import { defaultVehicle, driverVehicles, uid } from "@/lib/parking/service";
import { PageTitle, Panel, Field, Status, Empty, Hint } from "./ui";
import type { Vehicle } from "@/lib/parking/types";

export function DriverAuth({ mode = "login" }: { mode?: string }) {
  const { run } = useParking();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function enter(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    const ok = await run(event ? { type: "LOGIN", driver: { name, email } } : { type: "LOGIN" });
    setBusy(false);
    if (ok) window.location.assign("/app");
  }
  return (
    <>
      <PageTitle
        title={
          mode === "register"
            ? "Create a demo profile"
            : mode === "forgot-password"
              ? "Account recovery"
              : "Your smarter parking journey"
        }
        description="Find a space, book it and follow one connected journey to your exact parking slot."
      />
      <div className="parking-two-column">
        <Panel title="Welcome to the driver prototype">
          <div className="parking-welcome-art">
            <span>FIND → BOOK → NAVIGATE → PARK → EXIT</span>
            <h2>
              Find. Navigate.
              <br />
              Park Smarter.
            </h2>
            <p>
              Try the full SLTC campus journey with A05, a demo vehicle and LKR 1,500 in your
              simulated wallet.
            </p>
          </div>
          <button className="eco-button" disabled={busy} onClick={() => void enter()}>
            Enter Demo
          </button>
          <Hint>
            Demo access uses a fictional profile. Payments, location movement and verification are
            simulated. This is separate from the Website CMS login.
          </Hint>
        </Panel>
        <Panel title={mode === "register" ? "Register demo profile" : "Use a named demo profile"}>
          {mode === "forgot-password" ? (
            <>
              <p>
                Demo profiles have no passwords to reset. Re-enter your demo email to resume the
                profile saved in this browser. Secure account recovery belongs to a future
                authentication service.
              </p>
              <a className="eco-button" href="/app/login">
                Back to demo sign-in
              </a>
            </>
          ) : (
            <form onSubmit={(e) => void enter(e)} className="parking-form">
              <Field label="Your name">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <button className="eco-button" disabled={busy}>
                {busy
                  ? "Opening…"
                  : mode === "register"
                    ? "Create demo profile"
                    : "Continue with demo profile"}
              </button>
              <Hint>
                No password is requested or stored. A demo identity is not secure production
                authentication.
              </Hint>
              <div className="parking-inline-links">
                <a href="/app/register">Register</a>
                <a href="/app/forgot-password">Forgot password</a>
              </div>
            </form>
          )}
        </Panel>
      </div>
    </>
  );
}
export function VehiclesPage() {
  const { state, run } = useParking();
  const vehicles = driverVehicles(state);
  const blank = (): Omit<Vehicle, "driverId"> => ({
    id: uid("vehicle"),
    plate: "",
    type: "Car",
    colour: "White",
    nickname: "",
    isDefault: !vehicles.length,
  });
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (await run({ type: "VEHICLE_SAVE", vehicle: draft }, "Vehicle saved")) {
      setDraft(blank());
      setEditing(false);
    }
  }
  return (
    <>
      <PageTitle
        title="My Vehicles"
        description="Keep your vehicle details ready for booking and entry verification."
      />
      <div className="parking-two-column">
        <Panel title="Your cars">
          {vehicles.length ? (
            vehicles.map((v) => (
              <div className="parking-list-row" key={v.id}>
                <div>
                  <h3>{v.nickname}</h3>
                  <p>
                    {v.plate} · {v.colour} · {v.type}
                  </p>
                  {v.isDefault && <Status value="DEFAULT" />}
                </div>
                <div className="parking-row-actions">
                  <button
                    onClick={() => {
                      setDraft(v);
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      void run({ type: "VEHICLE_DEFAULT", id: v.id }, "Default vehicle updated")
                    }
                  >
                    Set default
                  </button>
                  <button
                    onClick={() =>
                      void run({ type: "VEHICLE_DELETE", id: v.id }, "Vehicle deleted")
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <Empty
              title="No vehicles yet"
              description="Add a car before booking your parking space."
            />
          )}
        </Panel>
        <Panel title={editing ? "Edit vehicle" : "Add a vehicle"}>
          <form className="parking-form" onSubmit={(e) => void save(e)}>
            <Field label="Nickname">
              <input
                required
                value={draft.nickname}
                onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
              />
            </Field>
            <Field label="Plate number">
              <input
                required
                placeholder="CAA-1234"
                value={draft.plate}
                onChange={(e) => setDraft({ ...draft, plate: e.target.value })}
              />
            </Field>
            <Field label="Colour">
              <input
                required
                value={draft.colour}
                onChange={(e) => setDraft({ ...draft, colour: e.target.value })}
              />
            </Field>
            <Field label="Vehicle type">
              <select value="Car" onChange={() => {}}>
                <option>Car</option>
              </select>
            </Field>
            <label className="parking-check">
              <input
                type="checkbox"
                checked={draft.isDefault}
                onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })}
              />
              Set as default
            </label>
            <button className="eco-button">Save vehicle</button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setDraft(blank());
                  setEditing(false);
                }}
              >
                Cancel edit
              </button>
            )}
          </form>
        </Panel>
      </div>
    </>
  );
}
export function ProfilePage() {
  const { state, run } = useParking();
  const driver = state.drivers.find((d) => d.id === state.currentDriverId)!;
  const vehicle = defaultVehicle(state);
  const [name, setName] = useState(driver.name),
    [email, setEmail] = useState(driver.email);
  return (
    <>
      <PageTitle
        title="Profile"
        description="Your browser-local demo identity. No passwords or payment credentials are stored."
      />
      <Panel title="Driver information">
        <form
          className="parking-form"
          onSubmit={(e) => {
            e.preventDefault();
            void run({ type: "PROFILE", name, email }, "Demo profile saved");
          }}
        >
          <Field label="Name">
            <input value={name} required onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input value={email} type="email" required onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <p>Default vehicle: {vehicle?.plate ?? "No vehicle selected"}</p>
          <button className="eco-button">Save profile</button>
        </form>
      </Panel>
    </>
  );
}
