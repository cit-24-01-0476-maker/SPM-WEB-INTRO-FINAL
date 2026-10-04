import { Container, SectionHeading } from "./primitives";
import { ParkingPhoto } from "./ParkingPhoto";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useParking } from "@/lib/parking/useParking";
import { metrics, availableSpaces } from "@/lib/parking/service";
import { money } from "@/lib/parking/billing";
import { Stat } from "@/components/parking/ui";
export function Dashboard() {
  const { tt } = useLanguage();
  const { state } = useParking();
  const m = metrics(state, state.currentProviderId);
  return (
    <section id="dashboard" className="py-24">
      <Container>
        <SectionHeading
          eyebrow={tt("Provider dashboard preview")}
          title={tt("Your facilities. One clear view.")}
          subtitle={tt(
            "A preview of the interactive provider portal, connected to the same demo bookings, spaces and completed parking revenue.",
          )}
        />
        <p className="my-6 text-center text-xs text-muted-foreground">
          {tt("Shared demo dataset · Simulation, not live operational data")}
        </p>
        <div className="parking-stats-grid">
          <Stat label="Total spaces" value={m.total} />
          <Stat label="Available" value={m.available} />
          <Stat label="Reserved" value={m.reserved} />
          <Stat label="Occupied" value={m.occupied} />
          <Stat label="Active sessions" value={m.activeSessions} />
          <Stat label="Gross parking revenue" value={money(m.gross)} />
          <Stat label="SPM ECO commission" value={money(m.commission)} />
          <Stat label="Provider net revenue" value={money(m.net)} />
        </div>
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          <ParkingPhoto scene="dashboard" className="rounded-2xl" />
          <div>
            <h3 className="text-2xl font-bold">{tt("Follow every parking journey")}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tt(
                "Reservations update availability. Parking arrival updates occupancy. Completed sessions update revenue, commission and reports.",
              )}
            </p>
            {state.facilities
              .filter((f) => f.providerId === state.currentProviderId)
              .map((f) => (
                <div className="parking-list-row" key={f.id}>
                  <span>{f.name}</span>
                  <strong>
                    {availableSpaces(f)} / {f.slots.length} {tt("available")}
                  </strong>
                </div>
              ))}
            <a href="/provider" className="eco-button mt-6">
              {tt("Open Interactive Dashboard Demo")} →
            </a>
            <p className="mt-5 text-xs text-muted-foreground">
              {tt(
                "Providers can join the demo platform and configure their facilities. The default commission is 10% of completed parking charges.",
              )}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
