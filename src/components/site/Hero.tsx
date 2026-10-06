import { CalendarCheck, MapPin, QrCode, BarChart3, Navigation, Play } from "lucide-react";
import { HeroMotion } from "./HeroMotion";
import { Container } from "./primitives";
import { ParkingPhoto } from "./ParkingPhoto";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { AppDownloadButton } from "./AppDownload";
import { DEFAULT_HERO } from "@/lib/cms/model";

const CAPABILITIES = [
  { icon: CalendarCheck, title: "Driver mobile app", detail: "Discovery, booking and receipts" },
  { icon: MapPin, title: "Exact-bay navigation", detail: "From the road to your space" },
  { icon: QrCode, title: "Sinhala & Singlish", detail: "Familiar language, clear requests" },
  { icon: BarChart3, title: "Operator intelligence", detail: "Facilities, reports and control" },
];

export function Hero() {
  const { lang, tt } = useLanguage();
  const { hero } = usePublicSettings();
  // Migrate the previous built-in copy while honoring subsequently published CMS edits.
  const headline =
    hero.headline === "Intelligent Parking. Seamless Mobility."
      ? DEFAULT_HERO.headline
      : hero.headline;
  const eyebrow = ["AI-Powered Smart Parking Ecosystem", "SMART PARKING. BETTER CITIES."].includes(
    hero.eyebrow,
  )
    ? DEFAULT_HERO.eyebrow
    : hero.eyebrow;
  const secondaryLabel = ["Explore the Platform", "Find Parking"].includes(hero.secondaryCtaLabel)
    ? DEFAULT_HERO.secondaryCtaLabel
    : hero.secondaryCtaLabel;
  const secondaryLink = ["Explore the Platform", "Find Parking"].includes(hero.secondaryCtaLabel)
    ? DEFAULT_HERO.secondaryCtaLink
    : hero.secondaryCtaLink;
  const trust =
    hero.trustStatement.startsWith("Built for modern parking facilities,") ||
    hero.trustStatement === "University prototype · Simulated payments, location and verification"
      ? DEFAULT_HERO.trustStatement
      : hero.trustStatement;
  return (
    <>
      <section id="home" className="eco-hero">
        <HeroMotion />
        <Container className="eco-hero-grid">
          <div className="eco-hero-copy">
            <p className="eco-eyebrow">
              {eyebrow !== DEFAULT_HERO.eyebrow
                ? tt(eyebrow)
                : lang === "si"
                  ? "ශ්‍රී ලංකාව සඳහා SMART PARKING"
                  : DEFAULT_HERO.eyebrow}
            </p>
            <h1>
              {headline !== DEFAULT_HERO.headline ? (
                tt(headline)
              ) : lang === "si" ? (
                <>
                  සොයන්න. මඟ සොයාගන්න.
                  <br />
                  පහසුවෙන් නවත්වන්න.
                </>
              ) : (
                <>
                  Find. Navigate.
                  <br />
                  Park Smarter.
                </>
              )}
            </h1>
            <p className="eco-hero-description">
              {lang === "si"
                ? "SPM ECO app එකෙන් ළඟම parking සොයන්න, ඔබේ slot එක book කරන්න සහ ඔබේ parking ඉඩට navigate කරන්න. Android APK එක මෙතැනින් බාගන්න පුළුවන්—booking කරන්නේ mobile app එක තුළින්."
                : "Find nearby parking, book your slot and navigate to your space with the SPM ECO mobile app. Use the download section below to get the Android APK—parking bookings happen inside the app."}
            </p>
            <div className="eco-actions">
              <AppDownloadButton />
              <a className="eco-button eco-button-outline" href={secondaryLink}>
                <Navigation size={17} />
                {tt(secondaryLabel)}
              </a>
            </div>
            <p className="eco-hero-note">{tt(trust)}</p>
            <button
              className="spm-replay-intro"
              onClick={() => window.dispatchEvent(new Event("spm:replay-intro"))}
            >
              <Play size={13} fill="currentColor" />
              {lang === "si" ? "SPM ECO හැඳින්වීම බලන්න" : "Watch the SPM ECO intro"}
            </button>
          </div>
          <div className="eco-hero-art">
            {hero.mediaType === "video" && hero.backgroundVideo ? (
              <video
                src={hero.backgroundVideo}
                poster={hero.posterImage || undefined}
                autoPlay={hero.autoplay}
                loop={hero.loop}
                muted={hero.muted}
                controls
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: hero.objectPosition,
                }}
              />
            ) : hero.backgroundImage ? (
              <img
                src={hero.backgroundImage}
                alt={tt("SPM ECO platform concept")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: hero.objectPosition,
                }}
              />
            ) : (
              <ParkingPhoto />
            )}
            <div className="eco-visual-route" aria-hidden="true">
              <span>
                <MapPin size={16} />
                {tt("Find Parking")}
              </span>
              <i />
              <span>
                <CalendarCheck size={16} />
                {tt("Real-time booking")}
              </span>
              <i />
              <span>
                <Navigation size={16} />
                {tt("Custom navigation")}
              </span>
            </div>
            <span className="eco-art-caption">{tt("SPM ECO platform concept")}</span>
          </div>
        </Container>
      </section>
      <div className="eco-capabilities">
        <Container>
          <div className="eco-capability-grid">
            {CAPABILITIES.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="eco-capability">
                <span className="eco-icon">
                  <Icon size={23} />
                </span>
                <div>
                  <h3>{tt(title)}</h3>
                  <p>{tt(detail)}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
