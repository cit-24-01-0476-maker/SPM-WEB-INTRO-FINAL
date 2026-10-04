import { ArrowRight } from "lucide-react";
import { Container } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
export function ParkingCta() {
  const { tt } = useLanguage();
  return (
    <section className="eco-cta">
      <Container>
        <div className="eco-cta-inner">
          <div>
            <p className="eco-eyebrow">{tt("A better way to park")}</p>
            <h2>{tt("Ready to make parking simpler?")}</h2>
            <p>{tt("Let's find the right smart parking solution for your facility.")}</p>
          </div>
          <a href="/contact" className="eco-button">
            {tt("Request Demo")}
            <ArrowRight size={18} />
          </a>
        </div>
      </Container>
    </section>
  );
}
