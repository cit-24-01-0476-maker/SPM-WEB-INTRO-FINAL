import { ParkingPhoto } from "./ParkingPhoto";
import { Container, SectionHeading } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
/** Retains the existing section entry point while replacing obsolete equipment claims. */
export function Hardware() {
  const { tt, lang } = useLanguage();
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
              subtitle={
                lang === "si"
                  ? "Camera image එකේ සිට vehicle/booking matching දක්වා ANPR සැලැස්මත් QR විකල්ප මාර්ගයත් parking journey එකට සහාය වේ."
                  : "The report describes an ANPR path from camera input to vehicle and booking matching, with QR as an alternative verification path."
              }
            />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {lang === "si"
                ? "Camera → plate detection → OCR → validation → vehicle match → booking/session match. සැබෑ cameras, දේශීය අංක තහඩු, ආලෝක තත්ත්ව සහ equipment integration පරීක්ෂා කළ යුතුය."
                : "Camera → plate detection → OCR → validation → vehicle match → booking/session match. Unknown vehicles, expired bookings and duplicate entry/exit situations are checked against operational records. Real cameras, local plates, lighting conditions and equipment integration need validation."}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {lang === "si"
                ? "Gate image එක concept illustration එකකි. මෙම browser demo එක ANPR/QR verification simulate කරයි; physical gate equipment පාලනය නොකරයි."
                : "Gate imagery is a concept illustration. The separate browser demo simulates ANPR/QR verification and does not control physical gate equipment."}
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
