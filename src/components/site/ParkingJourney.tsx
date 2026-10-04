import { ArrowRight, MapPin, Car, BarChart3 } from "lucide-react";
import { Container, SectionHeading } from "./primitives";
import { ParkingPhoto } from "./ParkingPhoto";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const STEPS = [
  {
    scene: "mobile",
    icon: MapPin,
    title: "Find & reserve",
    text: "View live availability, choose your space and reserve in seconds.",
    href: "/app/parking",
  },
  {
    scene: "gate",
    icon: Car,
    title: "Navigate & park",
    text: "Follow the route to your facility, then navigate to your exact reserved space.",
    href: "/app/navigation",
  },
  {
    scene: "dashboard",
    icon: BarChart3,
    title: "Manage & grow",
    text: "Monitor operations, simplify payments and make smarter decisions.",
    href: "/provider",
  },
] as const;

export function ParkingJourney() {
  const { tt } = useLanguage();
  return (
    <section className="eco-journey">
      <Container>
        <SectionHeading
          eyebrow={tt("The solution")}
          title={tt("One platform. Every parking touchpoint.")}
          subtitle={tt(
            "From finding a space to entering, paying and managing operations, SPM ECO brings it all together.",
          )}
        />
        <div className="eco-journey-grid">
          {STEPS.map(({ scene, icon: Icon, title, text, href }) => (
            <a key={scene} href={href} className="eco-journey-card">
              <ParkingPhoto scene={scene} />
              <div className="eco-journey-content">
                <span className="eco-icon">
                  <Icon size={22} />
                </span>
                <h3>{tt(title)}</h3>
                <p>{tt(text)}</p>
                <ArrowRight size={22} className="eco-card-arrow" />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
