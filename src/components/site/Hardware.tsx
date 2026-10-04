import { ParkingPhoto } from "./ParkingPhoto";
import { Container, SectionHeading } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
/** Retains the existing section entry point while replacing obsolete equipment claims. */
export function Hardware() {
  const { tt } = useLanguage();
  return (
    <section id="verification" className="py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ParkingPhoto scene="gate" className="rounded-2xl" />
          <div>
            <SectionHeading
              align="left"
              eyebrow={tt("Entry & exit verification")}
              title={tt("Verification supports the journey")}
              subtitle={tt(
                "ANPR and QR are supporting verification steps. This web prototype simulates plate detection, booking matching and approval.",
              )}
            />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {tt(
                "Plate image → detection → OCR → normalization → booking match → result. A future vision service may use YOLO and EasyOCR or PaddleOCR. The current demo does not run a live vision model.",
              )}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tt(
                "Gate photography is an illustration of the arrival experience. The software prototype does not control physical access equipment.",
              )}
            </p>
            <a href="/app/demo" className="eco-button mt-6">
              {tt("Try the verification demo")} →
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
