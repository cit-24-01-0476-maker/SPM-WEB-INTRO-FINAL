import { useEffect, useState } from "react";
import { ScanLine, QrCode, Navigation, MapPin } from "lucide-react";
import { useParking } from "@/lib/parking/useParking";
import { activeBooking } from "@/lib/parking/service";
import {
  BrowserGPSLocationProvider,
  calculateRouteDistance,
  distanceToFacility,
  getGeofenceState,
  getCurrentInstruction,
} from "@/lib/parking/navigation";
import { ParkingMap } from "./ParkingMap";
import { PageTitle, Panel, Stat, Status, Empty, Field, Hint } from "./ui";

export function VerificationPanel({ stage }: { stage: "ENTRY" | "EXIT" }) {
  const { state, run } = useParking();
  const b = activeBooking(state)!;
  const [method, setMethod] = useState<"ANPR" | "QR">("ANPR"),
    [value, setValue] = useState(b.plate),
    [outcome, setOutcome] = useState("APPROVED"),
    [phase, setPhase] = useState("");
  const [scanning, setScanning] = useState(false);
  const latest = state.verifications.find((v) => v.bookingId === b.id && v.stage === stage);
  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setPhase(
        method === "ANPR"
          ? "Plate detected · Checking booking match…"
          : "Demo QR token read · Checking booking match…",
      );
    }, 450);
    const complete = setTimeout(() => {
      void run({
        type: "VERIFY",
        stage,
        method,
        value,
        fail: outcome === "FAILED",
        lowConfidence: outcome === "LOW_CONFIDENCE",
      }).then(() => {
        if (!cancelled) {
          setPhase("");
          setScanning(false);
        }
      });
    }, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(complete);
    };
  }, [scanning, method, value, outcome, run, stage]);
  return (
    <Panel title={`${stage === "ENTRY" ? "Entry" : "Exit"} verification`}>
      <Hint>
        Simulated ANPR / QR verification. No camera, trained vision model or physical access control
        is connected.
      </Hint>
      <div className="parking-method-tabs">
        <button
          className={method === "ANPR" ? "active" : ""}
          disabled={scanning}
          onClick={() => {
            setMethod("ANPR");
            setValue(b.plate);
          }}
        >
          <ScanLine size={18} />
          ANPR demo
        </button>
        <button
          className={method === "QR" ? "active" : ""}
          disabled={scanning}
          onClick={() => {
            setMethod("QR");
            setValue(b.qrToken);
          }}
        >
          <QrCode size={18} />
          QR fallback
        </button>
      </div>
      <form
        className="parking-form"
        onSubmit={(e) => {
          e.preventDefault();
          setPhase(method === "ANPR" ? "Scanning demo plate…" : "Reading demo QR token…");
          setScanning(true);
        }}
      >
        <Field label={method === "ANPR" ? "Detected plate" : "Demo QR token"}>
          <input value={value} onChange={(e) => setValue(e.target.value)} disabled={scanning} />
        </Field>
        <Field label="Simulation result">
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)} disabled={scanning}>
            <option>APPROVED</option>
            <option>FAILED</option>
            <option>LOW_CONFIDENCE</option>
          </select>
        </Field>
        <button className="eco-button" disabled={scanning}>
          {scanning ? "Checking…" : method === "ANPR" ? "Scan demo plate" : "Verify demo QR"}
        </button>
      </form>
      {phase && <p role="status">{phase}</p>}
      {latest && (
        <div className="parking-verification-result">
          <Status value={latest.result} />
          <p>
            {latest.result === "APPROVED"
              ? "Booking and vehicle matched. Verification approved."
              : latest.result === "LOW_CONFIDENCE"
                ? "Low confidence. Use QR fallback or retry the demo scan."
                : "Verification failed. Check the token or plate, or use QR fallback."}
          </p>
        </div>
      )}
      {stage === "EXIT" && latest?.result === "APPROVED" && (
        <a href="/app/session" className="eco-button">
          Review final bill →
        </a>
      )}
    </Panel>
  );
}
export function NavigationPage() {
  const { state, run } = useParking();
  const b = activeBooking(state);
  const nav = state.navigation;
  const [running, setRunning] = useState(false),
    [gps, setGps] = useState("Demo location is active. GPS is optional."),
    [locating, setLocating] = useState(false);
  useEffect(() => {
    if (!running || !nav || nav.progress >= 1) {
      return;
    }
    const timer = setTimeout(() => {
      void run({ type: "ADVANCE" }).then((ok) => {
        if (!ok) setRunning(false);
      });
    }, 1100);
    return () => clearTimeout(timer);
  }, [running, nav, run]);
  if (!b)
    return (
      <>
        <PageTitle
          title="Navigation"
          description="From your starting point to your parking facility, then to your exact space."
        />
        <Panel>
          <Empty
            title="No active booking"
            description="Reserve a space before starting your parking journey."
            href="/app/parking"
          />
        </Panel>
      </>
    );
  const f = state.facilities.find((f) => f.id === b.facilityId)!;
  if (!nav || nav.bookingId !== b.id)
    return (
      <Panel title="Ready to navigate">
        <p>
          {f.name} · {b.slotId}
        </p>
        {b.status === "ACTIVE" ? (
          <a className="eco-button" href="/app/session">
            Open parking session
          </a>
        ) : (
          <button
            className="eco-button"
            onClick={() =>
              void run(
                b.status === "CHECKED_IN"
                  ? { type: "SLOT_RESUME" }
                  : { type: "OUTDOOR_START", bookingId: b.id },
              )
            }
          >
            {b.status === "CHECKED_IN"
              ? "Resume reserved-space navigation"
              : "Start outdoor navigation"}
          </button>
        )}
      </Panel>
    );
  const outdoor = nav.mode === "OUTDOOR",
    exit = nav.mode === "EXIT",
    findCar = nav.mode === "FIND_CAR";
  const distance = outdoor ? f.distanceKm * 1000 : calculateRouteDistance(f.map, nav.route);
  async function locate() {
    setLocating(true);
    try {
      const point = await new BrowserGPSLocationProvider().getLocation();
      const metres = distanceToFacility(point, f);
      const geofence = getGeofenceState(metres, f.geofenceRadius, point.accuracy);
      setGps(
        point.accuracy > 100
          ? `Low accuracy (±${Math.round(point.accuracy)} m). Continue demo mode.`
          : `GPS: ${Math.round(metres)} m from facility · ${geofence.toLowerCase()}. Confirmation uses controlled demo steps, not one GPS reading.`,
      );
    } catch (error) {
      setGps(error instanceof Error ? error.message : "Location unavailable. Continue demo mode.");
    } finally {
      setLocating(false);
    }
  }
  return (
    <>
      <PageTitle
        title={
          outdoor
            ? "Navigate to parking"
            : exit
              ? "Navigate to Exit"
              : findCar
                ? "Find My Car"
                : "Navigate to your reserved space"
        }
        description={
          outdoor
            ? `Demo route to ${f.name}`
            : `Custom SPM ECO map · ${findCar ? "Demo walking route" : exit ? "Exit route" : `Destination ${b.slotId}`}`
        }
      />
      <div className="parking-stats-grid">
        <Stat label="Destination" value={outdoor ? f.name : exit ? "EXIT_01" : b.slotId} />
        <Stat label="Distance remaining" value={`${Math.ceil(distance * (1 - nav.progress))} m`} />
        <Stat label="Route progress" value={`${Math.round(nav.progress * 100)}%`} />
        <Stat
          label={outdoor ? "Geofence" : "Navigation status"}
          value={<Status value={outdoor ? nav.geofence : nav.status} />}
        />
      </div>
      <div className="parking-two-column parking-map-layout">
        <Panel className="parking-map-panel">
          {outdoor ? (
            <div className="parking-outdoor-map">
              <svg viewBox="0 0 800 400" role="img" aria-label="Simulated outdoor route to parking">
                <rect width="800" height="400" fill="#ecf3ec" />
                <path
                  d="M0 90H800 M0 270H800 M160 0V400 M490 0V400 M690 0V400"
                  stroke="#d8e5d8"
                  strokeWidth="26"
                />
                <path d="M80 310H260V185H590V85H715" fill="none" stroke="#fff" strokeWidth="16" />
                <path
                  d="M80 310H260V185H590V85H715"
                  fill="none"
                  stroke="#075a46"
                  strokeWidth="6"
                  strokeDasharray="10 7"
                />
                <circle
                  cx={80 + 635 * nav.progress}
                  cy={310 - 225 * nav.progress}
                  r="17"
                  fill="#075a46"
                  stroke="white"
                  strokeWidth="4"
                />
                <circle cx="715" cy="85" r="45" fill="#a4c8aa" opacity=".45" />
                <text x="55" y="355" fontSize="17" fill="#073c32">
                  Demo starting point
                </text>
                <text x="450" y="45" fontSize="20" fontWeight="700" fill="#073c32">
                  {f.name}
                </text>
                <text x="35" y="30" fontSize="12" fill="#69806b">
                  ILLUSTRATIVE OUTDOOR ROUTE · NOT LIVE TURN-BY-TURN DIRECTIONS
                </text>
              </svg>
              <div className="parking-outdoor-caption">
                <MapPin size={20} />
                {f.address}
                <span>
                  Estimated demo travel time:{" "}
                  {Math.max(0, Math.ceil(f.distanceKm * 3 * (1 - nav.progress)))} minutes
                </span>
              </div>
            </div>
          ) : (
            <ParkingMap facility={f} navigation={nav} />
          )}
        </Panel>
        <Panel title="Route guidance">
          <div className="parking-guidance">
            <Navigation size={28} />
            <h3>
              {outdoor
                ? nav.progress >= 1
                  ? "You have arrived at the facility"
                  : nav.progress >= 0.8
                    ? "Approaching the parking entrance"
                    : "Continue to your parking facility"
                : getCurrentInstruction(f.map, nav.route, nav.progress, exit ? "Exit" : b.slotId)}
            </h3>
            <p>
              {outdoor
                ? "Next: arrival and entry verification"
                : nav.progress < 1
                  ? getCurrentInstruction(
                      f.map,
                      nav.route,
                      Math.min(1, nav.progress + 0.2),
                      exit ? "Exit" : b.slotId,
                    )
                  : exit
                    ? "Next: verify exit and settle final payment"
                    : findCar
                      ? "Your parked vehicle is here"
                      : "Next: start your parking session"}
            </p>
          </div>
          <progress value={nav.progress} max="1" className="parking-progress" />
          <div className="eco-actions">
            <button
              className="eco-button"
              disabled={nav.progress >= 1}
              onClick={() => setRunning(!running)}
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              disabled={nav.progress >= 1}
              onClick={() => {
                setRunning(false);
                void run({ type: "ADVANCE" });
              }}
            >
              Next Step
            </button>
            <button
              onClick={() => {
                setRunning(false);
                void run({ type: "NAV_RESET" });
              }}
            >
              Reset route
            </button>
          </div>
          <Hint>
            Positioning and movement are simulated. Internal navigation follows the facility's
            editable graph using Dijkstra.
          </Hint>
          {outdoor && (
            <>
              <button disabled={locating} onClick={() => void locate()}>
                {locating ? "Checking GPS…" : "Use browser GPS (optional)"}
              </button>
              <p className="parking-hint" role="status">
                {gps}
              </p>
            </>
          )}
          {nav.progress >= 1 && !outdoor && !exit && !findCar && b.status === "CHECKED_IN" && (
            <button
              className="eco-button"
              onClick={async () => {
                if (await run({ type: "PARK" }, "Parking started"))
                  window.location.assign("/app/session");
              }}
            >
              Park at {b.slotId} & start session
            </button>
          )}
          {findCar && (
            <a className="parking-text-button" href="/app/session">
              Return to parking session →
            </a>
          )}
        </Panel>
      </div>
      {outdoor && nav.progress >= 1 && <VerificationPanel key={`entry-${b.id}`} stage="ENTRY" />}
      {exit && nav.progress >= 1 && <VerificationPanel key={`exit-${b.id}`} stage="EXIT" />}
    </>
  );
}
