import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Smartphone,
  LayoutDashboard,
  Database,
  Server,
  MapPin,
  Languages,
  Sparkles,
  Globe2,
} from "lucide-react";
import { Container, SectionHeading, Reveal } from "./primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  AI_FEATURES,
  DRIVER_JOURNEY,
  FAQ,
  LOCAL_CONTEXT,
  PLATFORM_FEATURES,
  SECURITY_POINTS,
  localize,
  text,
  type ReportText,
} from "@/lib/site/report-content";

function useCopy() {
  const { lang } = useLanguage();
  return (en: string, si: string) => localize(text(en, si), lang);
}

function TextCards({ items }: { items: readonly { title: ReportText; body: ReportText }[] }) {
  const { lang } = useLanguage();
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <Reveal key={item.title.en} delay={(index % 3) * 50} className="spm-report-card">
          <span className="spm-report-number">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="mt-4 text-lg font-bold leading-snug">{localize(item.title, lang)}</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {localize(item.body, lang)}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

export function EcosystemOverview() {
  const c = useCopy();
  const cards = [
    {
      icon: Smartphone,
      name: c("For drivers", "රියදුරන් සඳහා"),
      detail: c("One mobile journey", "එකම mobile journey එකක්"),
      body: c(
        "A driver-only Flutter app for nearby parking, reservations, QR access, navigation, wallet, receipts and reminders.",
        "ළඟම parking, reservations, QR access, navigation, wallet, receipts සහ reminders සඳහා Flutter driver app එකක්.",
      ),
    },
    {
      icon: LayoutDashboard,
      name: c("For operators", "Operators සඳහා"),
      detail: c("One operational view", "එකම මෙහෙයුම් දැක්මක්"),
      body: c(
        "A separate Admin Web for facilities, bays, bookings, maps, tariffs, equipment health and operational reports.",
        "Facilities, ඉඩ, bookings, maps, ගාස්තු, equipment health සහ reports සඳහා වෙනම Admin Web එකක්.",
      ),
    },
    {
      icon: Server,
      name: c("Connected by one backend", "එකම backend එකකින් සම්බන්ධයි"),
      detail: c("One source of truth", "එකම විශ්වාසදායක data source එකක්"),
      body: c(
        "Express services and PostgreSQL keep driver requests and admin changes consistent, with REST APIs and Socket.IO events.",
        "REST APIs සහ Socket.IO events සමඟ Express/PostgreSQL මඟින් driver requests සහ admin changes එකම data මත තබයි.",
      ),
    },
  ];
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("The SPM ecosystem", "SPM ecosystem එක")}
            title={c("More than a place to park.", "Parking ඉඩකට වඩා වැඩි දෙයක්.")}
            subtitle={c(
              "SPM ECO brings the driver, parking facility and operator into one connected experience — from the first search to the final receipt.",
              "පළමු සෙවීමේ සිට අවසාන receipt එක දක්වා driver, parking facility සහ operator එකම අත්දැකීමකට සම්බන්ධ කරයි.",
            )}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {cards.map(({ icon: Icon, name, detail, body }) => (
            <Reveal key={name} className="spm-report-card">
              <span className="spm-report-icon">
                <Icon size={25} />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
                {name}
              </p>
              <h3 className="mt-3 text-2xl font-bold">{detail}</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{body}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/features" className="eco-button">
            {c("Explore all capabilities", "හැකියාවන් සියල්ල බලන්න")}
            <ArrowRight size={17} />
          </a>
          <a href="/technology" className="eco-button eco-button-outline">
            {c("See the architecture", "Architecture එක බලන්න")}
          </a>
        </div>
      </Container>
    </section>
  );
}

export function SriLankaSection() {
  const c = useCopy();
  return (
    <section id="sri-lanka" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Sri Lanka, in focus", "ශ්‍රී ලංකාව සඳහා")}
            title={c("Built around the way we travel.", "අප ගමන් කරන විදිහට ගැලපෙන සැලැස්මක්.")}
            subtitle={c(
              "Local language, understandable pricing and guidance through busy facilities — a practical introduction to smarter parking for Sri Lanka.",
              "දේශීය භාෂාව, පැහැදිලි මිල සහ කාර්යබහුල facilities තුළ මඟ පෙන්වීම සමඟ ශ්‍රී ලංකාවට ගැලපෙන smart parking හැඳින්වීමක්.",
            )}
          />
        </Reveal>
        <div className="spm-local-strip mt-9">
          <span>
            <MapPin size={18} />
            {c("Local facility use cases", "දේශීය facility use cases")}
          </span>
          <span>
            <Languages size={18} />
            {c("Sinhala • English • Singlish", "සිංහල • English • Singlish")}
          </span>
          <span>
            <Globe2 size={18} />
            {c("A facility-first pilot approach", "Facility එකකින් ආරම්භ වන pilot එකක්")}
          </span>
        </div>
        <TextCards items={LOCAL_CONTEXT} />
      </Container>
    </section>
  );
}

export function ReportCapabilities() {
  const c = useCopy();
  return (
    <section id="platform-capabilities" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Platform capabilities", "Platform හැකියාවන්")}
            title={c("The complete parking ecosystem.", "සම්පූර්ණ parking ecosystem එක.")}
            subtitle={c(
              "The documented Flutter, Admin Web and backend project, explained feature by feature. Try the separate browser demo to explore the journey.",
              "වාර්තාවේ Flutter, Admin Web සහ backend ව්‍යාපෘතියේ එක් එක් feature ගැන විස්තර. Journey එක බලන්න වෙනම browser demo එක භාවිතා කරන්න.",
            )}
          />
        </Reveal>
        <TextCards items={PLATFORM_FEATURES} />
      </Container>
    </section>
  );
}

export function OperatorOverview() {
  const c = useCopy();
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Admin & operator web", "Admin සහ operator web")}
            title={c("A clearer picture of every facility.", "සෑම facility එකකම පැහැදිලි දැක්මක්.")}
            subtitle={c(
              "The documented Admin Web manages operational records, navigation maps, tariffs and reports through role-protected backend services. Below it, the browser preview shows the separate demonstration dataset.",
              "වාර්තාවේ Admin Web එක role-protected backend services හරහා records, maps, ගාස්තු සහ reports කළමනාකරණය කරයි. පහත browser preview එක වෙනම demo dataset එක පෙන්වයි.",
            )}
          />
        </Reveal>
        <TextCards items={[PLATFORM_FEATURES[8], PLATFORM_FEATURES[9], PLATFORM_FEATURES[10]]} />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {c(
            "Tariff changes need approval. The copilot uses safe aggregations, and financial results come from the authoritative backend.",
            "ගාස්තු වෙනස්කම් සඳහා approval අවශ්‍යය. Copilot safe aggregations භාවිතා කරයි. Financial results authoritative backend එකෙන් ලබාගනී.",
          )}
        </p>
      </Container>
    </section>
  );
}

export function ReportWorkflow() {
  const c = useCopy();
  const { lang } = useLanguage();
  return (
    <section id="driver-journey" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("From search to receipt", "සෙවීමේ සිට receipt එක දක්වා")}
            title={c("A smoother journey, step by step.", "පියවරෙන් පියවර පහසු ගමනක්.")}
            subtitle={c(
              "The driver sees a simple journey. Behind each step, the backend checks the booking, vehicle, parking state and payment.",
              "Driver ට සරල journey එකක් පෙනේ. සෑම පියවරක් පිටුපසම backend එක booking, vehicle, parking state සහ payments පරීක්ෂා කරයි.",
            )}
          />
        </Reveal>
        <ol className="spm-journey-list mt-12">
          {DRIVER_JOURNEY.map((step, i) => (
            <Reveal as="li" key={step.title.en} className="spm-journey-step">
              <span className="spm-step-dot">{i + 1}</span>
              <div>
                <h3 className="text-xl font-bold">{localize(step.title, lang)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {localize(step.body, lang)}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <a href="/app/demo" className="eco-button">
            {c("Try the browser demonstration", "Browser demonstration එක බලන්න")}
            <ArrowRight size={17} />
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            {c(
              "Simulated payments and verification. Separate from the report's Flutter/backend deployment.",
              "Simulated payments සහ verification. වාර්තාවේ Flutter/backend deployment එකෙන් වෙනම demo එකකි.",
            )}
          </p>
        </div>
      </Container>
    </section>
  );
}

export function AssistantExplanation() {
  const c = useCopy();
  const [selected, setSelected] = useState(0);
  const samples = [
    "Find cheap EV parking tomorrow morning",
    "හෙට උදේ EV charging තියෙන අඩු මිල parking එකක් සොයන්න",
    "mata tomorrow morning EV charging thiyena cheap parking ekak one",
  ];
  return (
    <section id="assistant" className="py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow={c("Speak your way", "ඔබේ භාෂාවෙන් විමසන්න")}
              title={c(
                "An assistant that understands the request.",
                "ඉල්ලීම හඳුනාගන්නා සහායකයෙක්.",
              )}
              subtitle={c(
                "The documented NLP baseline recognises parking intents and details across English, Sinhala and Singlish. It separates understanding a request from actually executing an action.",
                "වාර්තාවේ NLP baseline එක English, Sinhala සහ Singlish parking intents සහ විස්තර හඳුනාගනී. ඉල්ලීම තේරුම් ගැනීම සහ ක්‍රියාත්මක කිරීම වෙන වෙනම සිදු වේ.",
              )}
            />
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {c(
                "Supported topics include nearby parking, availability, prices, booking and cancellation, Find My Car, navigation, wallet, receipts, EV charging, eco points, history, emergency and help. Entities include facility, bay, date, time, vehicle, price preference, distance, duration and booking reference.",
                "ළඟම parking, availability, මිල, booking/cancellation, Find My Car, navigation, wallet, receipts, EV charging, eco points, history, emergency සහ help ගැන විමසිය හැක. Facility, ඉඩ, දිනය, වේලාව, වාහනය, මිල, දුර, කාලය සහ booking reference entities හඳුනාගනී.",
              )}
            </p>
          </Reveal>
          <Reveal className="spm-assistant-example">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan">
              <Sparkles size={17} />
              {c("Illustrative request breakdown", "උදාහරණ ඉල්ලීමක් විග්‍රහ කිරීම")}
            </div>
            <div
              className="mt-6 flex flex-wrap gap-2"
              role="group"
              aria-label={c("Example language", "උදාහරණ භාෂාව")}
            >
              {["English", "සිංහල", "Singlish"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setSelected(i)}
                  aria-pressed={selected === i}
                  className={selected === i ? "spm-example-selected" : ""}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-6 text-xl leading-relaxed" lang={selected === 1 ? "si" : "en"}>
              “{samples[selected]}”
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
              {[
                [c("Intent", "Intent"), "FIND_PARKING"],
                [c("When", "කවදාද"), c("Tomorrow morning", "හෙට උදේ")],
                [c("Vehicle need", "වාහන අවශ්‍යතාව"), c("EV charging", "EV charging")],
                [c("Price preference", "මිල කැමැත්ත"), c("Lower cost", "අඩු මිල")],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-white/55">{key}</dt>
                  <dd className="mt-1 text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-xs leading-6 text-white/60">
              {c(
                "An explanatory example, not a live assistant response. Availability is checked against backend data; a booking still needs confirmation.",
                "මෙය පැහැදිලි කිරීමේ උදාහරණයක් වන අතර live assistant response එකක් නොවේ. Availability backend data වලින් පරීක්ෂා කරයි; booking සඳහා confirmation තවම අවශ්‍යය.",
              )}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function AIStatus({ compact = false }: { compact?: boolean }) {
  const c = useCopy();
  const { lang } = useLanguage();
  return (
    <section id="ai-status" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Transparent intelligence", "පැහැදිලි AI status")}
            title={c(
              "Useful today. Ready to learn tomorrow.",
              "අද ප්‍රයෝජනවත්. හෙට ඉගෙනීමට සූදානම්.",
            )}
            subtitle={c(
              "The supplied technical audit separates working deterministic baselines from ML-ready architecture. No trained-model performance is claimed.",
              "ලබාදුන් technical audit එක working deterministic baselines සහ ML-ready architecture වෙන් කරයි. Trained-model performance සඳහන් නොකරයි.",
            )}
          />
        </Reveal>
        <div className="spm-status-summary mt-10">
          {[
            ["10", c("Baseline systems", "Baseline systems")],
            ["2", c("ML-ready vision pipelines", "ML-ready vision pipelines")],
            ["0", c("Real trained models in the audit", "Audit එකේ real trained models")],
          ].map(([number, label]) => (
            <div key={label}>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        {compact ? (
          <div className="mt-8 text-center">
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
              {c(
                "Recommendations, multilingual intent recognition, prediction and reporting use explainable rules or data aggregation. Vision pipelines need labelled data and validation before deployment.",
                "Recommendations, බහු භාෂා intents, prediction සහ reporting සඳහා explainable rules හෝ data aggregation භාවිතා වේ. Vision pipelines සඳහා labelled data සහ validation අවශ්‍යය.",
              )}
            </p>
            <a
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              href="/technology#ai-status"
            >
              {c("Explore all 12 intelligence features", "Intelligence features 12ම බලන්න")}
              <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {AI_FEATURES.map((feature) => (
              <Reveal key={feature.name.en} className="spm-report-card">
                <span
                  className={`spm-model-badge ${feature.status === "ML_READY" ? "spm-model-ready" : ""}`}
                >
                  {feature.status === "ML_READY"
                    ? c("ML-ready architecture", "ML-ready architecture")
                    : c("Rule / data baseline", "Rule / data baseline")}
                </span>
                <h3 className="mt-4 text-lg font-bold">{localize(feature.name, lang)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {localize(feature.detail, lang)}
                </p>
              </Reveal>
            ))}
          </div>
        )}
        {!compact && (
          <p className="mt-8 text-sm leading-7 text-muted-foreground">
            {c(
              "An auditable model registry records each model's name, version, type, training status, dataset, training and evaluation methods, genuine metrics and timestamps. Statuses distinguish REAL_TRAINED_MODEL, BASELINE, ML_READY and NOT_IMPLEMENTED; fabricated performance metrics are excluded.",
              "Model registry එකේ model නම, version, type, training status, dataset, training හා evaluation methods, සැබෑ metrics සහ timestamps සටහන් කරයි. REAL_TRAINED_MODEL, BASELINE, ML_READY සහ NOT_IMPLEMENTED වෙන වෙනම දක්වයි; නිර්මාණය කළ performance metrics භාවිතා නොකරයි.",
            )}
          </p>
        )}
      </Container>
    </section>
  );
}

export function ArchitectureSection() {
  const c = useCopy();
  return (
    <section id="architecture" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Under the hood", "System එක ඇතුළත")}
            title={c("Two clients. One trusted backend.", "Clients දෙකක්. එකම backend එකක්.")}
            subtitle={c(
              "The report's architecture keeps business rules and financial state on the server. Clients display and request changes; they do not decide the database state themselves.",
              "වාර්තාවේ architecture එක business rules සහ financial state server එකේ තබයි. Clients data පෙන්වා වෙනස්කම් ඉල්ලයි; තමන්ම database state තීරණය නොකරයි.",
            )}
          />
        </Reveal>
        <Reveal className="spm-architecture mt-12">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="spm-architecture-client">
              <Smartphone />
              <strong>Flutter Driver App</strong>
              <p>
                {c(
                  "Discovery, booking, wallet, navigation",
                  "Discovery, booking, wallet, navigation",
                )}
              </p>
            </div>
            <div className="spm-architecture-client">
              <LayoutDashboard />
              <strong>Admin Web</strong>
              <p>{c("Facilities, maps, tariffs, reports", "Facilities, maps, ගාස්තු, reports")}</p>
            </div>
          </div>
          <div className="spm-architecture-arrow">
            <ArrowDown size={21} />
            <span>HTTPS REST API • Socket.IO</span>
          </div>
          <div className="spm-architecture-backend">
            <Server size={28} />
            <div>
              <strong>Node.js / Express</strong>
              <p>
                {c(
                  "JWT + RBAC → controllers/services → validated business operations",
                  "JWT + RBAC → controllers/services → validated business operations",
                )}
              </p>
            </div>
          </div>
          <div className="spm-architecture-arrow">
            <ArrowDown size={21} />
            <span>Prisma ORM</span>
          </div>
          <div className="spm-architecture-database">
            <Database size={27} />
            <div>
              <strong>PostgreSQL</strong>
              <p>
                {c(
                  "Facilities • Bays • Bookings • Sessions • Wallets • Events",
                  "Facilities • ඉඩ • Bookings • Sessions • Wallets • Events",
                )}
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
            {c(
              "Responses and authorised events travel back to the clients. AI tools use approved backend operations, with no arbitrary SQL or direct client database access.",
              "Responses සහ authorised events නැවත clients වෙත යයි. AI tools approved backend operations භාවිතා කරයි; arbitrary SQL හෝ direct client database access නොමැත.",
            )}
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="spm-report-card">
            <h3 className="font-bold">
              {c("What a driver request does", "Driver request එකේ ගමන")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Flutter → HTTPS API / Socket.IO → Express → service logic → Prisma → PostgreSQL →
              response / event → Flutter.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {c(
                "Admin requests pass authenticated role middleware before services access the same database. An AI request returns a structured result from its baseline/tool layer and authoritative data.",
                "Admin requests role middleware හරහා ගොස් එකම database එක භාවිතා කරයි. AI request එක baseline/tool layer සහ authoritative data මඟින් structured result එකක් ලබාදෙයි.",
              )}
            </p>
          </div>
          <div className="spm-report-card">
            <h3 className="font-bold">
              {c("This introduction website", "මෙම introduction website එක")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {c(
                "This site uses React, TypeScript and TanStack Start, with Firebase/Firestore for its website CMS. Its browser parking demo uses a separate simulated dataset. The Flutter, Express and PostgreSQL architecture above is the ecosystem described in the supplied report.",
                "මෙම site එක React, TypeScript සහ TanStack Start භාවිතා කරයි. Website CMS සඳහා Firebase/Firestore ඇත. Browser parking demo එක වෙනම simulated dataset එකකි. ඉහත Flutter/Express/PostgreSQL architecture ලබාදුන් වාර්තාවේ ecosystem එක විස්තර කරයි.",
              )}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ReportSecurity() {
  const c = useCopy();
  return (
    <section id="trust" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Trust & control", "විශ්වාසය සහ පාලනය")}
            title={c("Intelligence with clear boundaries.", "පැහැදිලි සීමා සහිත intelligence.")}
            subtitle={c(
              "Access, payments and sensitive actions are enforced by the backend — with human approval where it matters.",
              "Access, payments සහ වැදගත් ක්‍රියා backend එකෙන් පරීක්ෂා කරයි. අවශ්‍ය තැන්වල human approval ඇත.",
            )}
          />
        </Reveal>
        <TextCards items={SECURITY_POINTS} />
      </Container>
    </section>
  );
}

export function ProjectReadiness() {
  const c = useCopy();
  const results = [
    ["41 / 41", c("Backend tests, as reported", "වාර්තාවේ backend tests")],
    ["29 / 29", c("Flutter tests, as reported", "වාර්තාවේ Flutter tests")],
    ["PASS", c("Admin Web production build", "Admin Web production build")],
    ["~58.3 MB", c("Android release APK, as reported", "වාර්තාවේ Android release APK")],
  ];
  const steps = [
    [
      c("Connect production services", "Production services සම්බන්ධ කරන්න"),
      c(
        "The target is Vercel for Admin Web, Render for the Express backend, Neon for PostgreSQL and an Android APK using the production API. Replace localhost, apply Prisma migrations and configure HTTPS, WSS, CORS and persistent file storage.",
        "Target එක Admin Web සඳහා Vercel, Express backend සඳහා Render, PostgreSQL සඳහා Neon සහ production API භාවිතා කරන Android APK එකකි. Localhost වෙනස් කර Prisma migrations, HTTPS/WSS, CORS සහ persistent storage සකස් කරන්න.",
      ),
    ],
    [
      c("Verify on real devices & cameras", "සැබෑ devices/cameras මත පරීක්ෂා කරන්න"),
      c(
        "The report did not connect physical Android hardware. Fingerprint, GPS, device-specific behaviour and push delivery need real-device checks; camera and gate paths need field verification.",
        "වාර්තාවේ physical Android hardware සම්බන්ධ නොවීය. Fingerprint, GPS, device-specific behavior සහ push delivery සැබෑ device මතත් camera/gate paths field එකේත් පරීක්ෂා කළ යුතුය.",
      ),
    ],
    [
      c("Prove two-way synchronisation", "දෙපැත්තටම synchronisation තහවුරු කරන්න"),
      c(
        "An admin changes a bay state and Flutter sees the change. A driver books in Flutter and Admin Web sees the same booking. Verify entry, exit, financial reconciliation and receipts against one authoritative record.",
        "Admin bay state වෙනස් කළ විට Flutter වෙත පෙනිය යුතුය. Flutter booking එක Admin Web වෙතත් පෙනිය යුතුය. Entry/exit, payments සහ receipts එකම record එකට ගැලපිය යුතුය.",
      ),
    ],
    [
      c("Train the first real occupancy model", "පළමු සැබෑ occupancy model train කරන්න"),
      c(
        "Inspect real historical occupancy records first. Engineer time, facility, booking and session features, split chronologically and evaluate on unseen data using genuine MAE, RMSE and R². Label synthetic development data explicitly, save the model artifact and retain the baseline fallback.",
        "පළමුව සැබෑ historical occupancy records පරීක්ෂා කරන්න. Time/facility/booking/session features සකස් කර chronological split සහ unseen-data MAE/RMSE/R² මැනීම කරන්න. Synthetic data පැහැදිලිව label කර model artifact ගබඩා කර baseline fallback තබන්න.",
      ),
    ],
  ];
  return (
    <section id="readiness" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("Evidence & next steps", "සාක්ෂි සහ ඊළඟ පියවර")}
            title={c("A foundation with a clear path forward.", "පැහැදිලි ඉදිරි මඟක් සහිත පදනමක්.")}
            subtitle={c(
              "Verification below is recorded in the supplied technical report, rather than a new test of the Flutter/backend project performed by this website.",
              "පහත verification ලබාදුන් technical report එකෙන් උපුටාගත් අතර, මෙම website එකෙන් අලුතින් කළ Flutter/backend tests නොවේ.",
            )}
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {results.map(([value, label]) => (
            <div className="spm-report-card" key={label}>
              <strong className="text-3xl text-primary">{value}</strong>
              <p className="mt-3 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {c(
            "The report also records zero backend TypeScript errors and no Flutter static-analysis issues.",
            "Backend TypeScript errors 0ක් සහ Flutter static-analysis issues නොමැති බවත් වාර්තාව සඳහන් කරයි.",
          )}
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map(([title, body], i) => (
            <li key={title} className="spm-report-card">
              <span className="spm-report-number">0{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function ProjectFAQ() {
  const c = useCopy();
  const { lang } = useLanguage();
  return (
    <section id="questions" className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={c("A few helpful answers", "වැදගත් ප්‍රශ්න කිහිපයක්")}
            title={c(
              "Understand the project before you explore.",
              "Explore කිරීමට පෙර ව්‍යාපෘතිය හඳුනාගන්න.",
            )}
          />
        </Reveal>
        <div className="mx-auto mt-10 max-w-4xl space-y-3">
          {FAQ.map((item) => (
            <details className="spm-report-faq" key={item.title.en}>
              <summary>{localize(item.title, lang)}</summary>
              <p>{localize(item.body, lang)}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
