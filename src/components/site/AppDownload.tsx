import { Download, Smartphone, Search, CalendarCheck, Navigation, ArrowRight } from "lucide-react";
import { Container } from "./primitives";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { apkUrl, resolveApkRelease } from "@/lib/apk";
import { formatBytes } from "@/lib/media/types";
export function AppDownloadButton({ className = "eco-button" }: { className?: string }) {
  const { site: storedSite } = usePublicSettings();
  const site = resolveApkRelease(storedSite);
  const { lang } = useLanguage();
  const available = site.apkDownloadEnabled && apkUrl(site.apkUrl || "");
  return available ? (
    <a className={className} href={available} download={site.apkFileName || "SPM-ECO.apk"}>
      <Download size={18} />
      {lang === "si" ? "Android APK බාගන්න" : "Download Android APK"}
    </a>
  ) : (
    <a className={className} href="#download-app">
      <Smartphone size={18} />
      {lang === "si" ? "App එක ළඟදීම" : "App coming soon"}
    </a>
  );
}
export function AppDownload() {
  const { site: storedSite } = usePublicSettings();
  const site = resolveApkRelease(storedSite);
  const { lang } = useLanguage();
  const si = lang === "si";
  const available = site.apkDownloadEnabled && apkUrl(site.apkUrl || "");
  return (
    <section id="download-app" className="py-24 scroll-mt-28 bg-secondary/40">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="eco-eyebrow">SPM ECO · ANDROID APP</p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
              {si ? "Parking එක ඔබේ phone එකෙන්ම." : "Your parking journey, in your pocket."}
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {si
                ? "SPM ECO mobile app එකෙන් parking සොයන්න, ඔබට ගැළපෙන slot එක book කරන්න සහ එතැනට navigate කරන්න. මේ website එකෙන් app එක හඳුනාගෙන Android APK එක බාගන්න පුළුවන්. Parking bookings කරන්නේ app එක තුළින්."
                : "Find parking, book your slot and navigate to it with the SPM ECO mobile app. This website introduces the product and provides its Android APK when released. Parking bookings happen inside the app."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              {available ? (
                <AppDownloadButton />
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-3 font-semibold">
                  <Smartphone size={20} />
                  {si ? "Android APK එක ළඟදීම" : "Android APK coming soon"}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {available
                ? [
                    site.apkVersion && `Version ${site.apkVersion}`,
                    site.apkFileSize > 0 && formatBytes(site.apkFileSize),
                    "Android APK",
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : si
                  ? "APK එක තවම නිකුත් කර නැත. නිකුත් කළ පසු මෙතැනින් බාගත කළ හැක."
                  : "The APK has not been released yet. The download will appear here when it is published."}
            </p>
            {available && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {si
                  ? "Android phone එකෙන් APK එක බාගන්න, file එක විවෘත කර phone එකේ installation උපදෙස් අනුගමනය කරන්න."
                  : "Download the APK on your Android phone, open the file and follow your phone’s installation instructions."}
              </p>
            )}
          </div>
          <div className="rounded-3xl border bg-background p-6 sm:p-9 shadow-card">
            <div className="mb-7 flex items-center gap-3">
              <span className="rounded-xl bg-primary/10 p-3 text-primary">
                <Smartphone size={27} />
              </span>
              <div>
                <p className="text-xl font-bold">SPM ECO</p>
                <p className="text-sm text-muted-foreground">
                  {si ? "ඔබේ smart parking app එක" : "Your smart parking app"}
                </p>
              </div>
            </div>
            {[
              {
                icon: Search,
                title: si ? "01 · Parking සොයන්න" : "01 · Find parking",
                body: si
                  ? "ළඟම facilities, ඉතිරි ඉඩ සහ ගාස්තු බලන්න."
                  : "Explore nearby facilities, available spaces and prices.",
              },
              {
                icon: CalendarCheck,
                title: si ? "02 · Slot එක book කරන්න" : "02 · Book your slot",
                body: si
                  ? "App එකෙන් facility, slot සහ ඔබේ වාහනය තෝරා booking එක තහවුරු කරන්න."
                  : "Choose your facility, bay and vehicle, then confirm your booking in the app.",
              },
              {
                icon: Navigation,
                title: si ? "03 · Navigate කර park කරන්න" : "03 · Navigate and park",
                body: si
                  ? "Facility එකට සහ ඔබේ නිශ්චිත ඉඩට මඟ පෙන්වීම ලබාගන්න."
                  : "Follow guidance to the facility and your reserved parking bay.",
              },
            ].map((step) => (
              <div key={step.title} className="flex gap-4 border-t py-5">
                <step.icon size={22} className="mt-1 shrink-0 text-primary" />
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
            <a
              className="inline-flex gap-2 items-center text-sm font-semibold text-primary"
              href="/features"
            >
              {si ? "App විශේෂාංග බලන්න" : "Explore app features"}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
