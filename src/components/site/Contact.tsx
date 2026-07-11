import { useMemo, useState, type FormEvent } from "react";
import { Mail, Phone, MessageCircle, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Container, SectionHeading, Reveal } from "./primitives";
import { CmsButton } from "./CmsButton";
import { trackEvent } from "@/lib/analytics";
import { usePublicSettings } from "@/lib/cms/PublicSettings";
import { contactWhatsappLink, telLink, visibleContacts, type ContactPerson } from "@/lib/cms/model";
import { submitInquiry, mapInquiryError } from "@/lib/cms/inquiries";

const FACILITY_TYPES = [
  "Shopping Mall",
  "Office Building",
  "Hospital",
  "Hotel",
  "Apartment",
  "University",
  "Factory",
  "Retail Chain",
  "Public Parking",
  "Other",
];

const CONTACT_METHODS = ["WhatsApp", "Phone Call", "Email"];

const COOLDOWN_MS = 20_000;

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-xs font-medium text-red-500">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const inputCls =
  "rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

function statusDot(status: ContactPerson["availabilityStatus"]) {
  return status === "available"
    ? "bg-emerald-500"
    : status === "busy"
      ? "bg-amber-500"
      : "bg-muted-foreground";
}

function ContactCard({ c }: { c: ContactPerson }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-center gap-4">
        {c.profileImage ? (
          <img
            src={c.profileImage}
            alt={`${c.name} — ${c.role}`}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-bold text-white"
            style={{ background: c.accentColor }}
            aria-hidden="true"
          >
            {c.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-foreground">{c.name}</p>
          <p className="truncate text-sm text-muted-foreground">{c.role}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${statusDot(c.availabilityStatus)}`} />
            {c.availabilityText || c.availabilityStatus}
          </p>
        </div>
      </div>
      {c.phoneDisplay ? (
        <p className="text-sm font-semibold text-foreground">{c.phoneDisplay}</p>
      ) : null}
      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        {c.callEnabled && c.phoneRaw ? (
          <a
            href={telLink(c.phoneRaw)}
            aria-label={`Call ${c.name}`}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
          >
            <Phone className="h-4 w-4" /> Call {c.name}
          </a>
        ) : null}
        {c.whatsappEnabled && c.whatsappNumber ? (
          <a
            href={contactWhatsappLink(c)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat with ${c.name} on WhatsApp`}
            onClick={() => void trackEvent("whatsapp_click", { contact: c.id })}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-transform hover:brightness-110 active:scale-95"
            style={{ background: "#25D366" }}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        ) : null}
        {c.emailEnabled && c.email ? (
          <a
            href={`mailto:${c.email}`}
            aria-label={`Email ${c.name}`}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70 sm:flex-none"
          >
            <Mail className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

type Errors = Record<string, string>;

export function Contact() {
  const { contact } = usePublicSettings();
  const cards = useMemo(() => visibleContacts(contact.contacts), [contact.contacts]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [reference, setReference] = useState<string | null>(null);
  const [lastSubmit, setLastSubmit] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // Honeypot — bots fill hidden fields.
    if (String(fd.get("company_website") ?? "").trim() !== "") return;

    // Cooldown / duplicate protection.
    if (Date.now() - lastSubmit < COOLDOWN_MS) {
      toast.message("Please wait a moment before submitting again.");
      return;
    }

    const val = (k: string) => String(fd.get(k) ?? "").trim();
    const num = (k: string) => {
      const v = fd.get(k);
      return v && String(v).trim() !== "" ? Number(v) : null;
    };

    const next: Errors = {};
    const fullName = val("fullName");
    const email = val("email");
    const phone = val("phone");
    const facilityType = val("facilityType");
    const message = val("message");
    const consent = fd.get("privacyConsent") === "on";
    const capacity = num("parkingCapacity");
    const locations = num("numberOfLocations");

    if (!fullName) next.fullName = "Please enter your full name.";
    if (!/.+@.+\..+/.test(email)) next.email = "Please enter a valid business email.";
    if (!phone) next.phone = "Please enter a phone or WhatsApp number.";
    if (!facilityType) next.facilityType = "Please select a facility type.";
    if (!message) next.message = "Please tell us about your requirement.";
    if (!consent) next.privacyConsent = "Please accept the privacy consent to continue.";
    if (capacity !== null && capacity < 0) next.parkingCapacity = "Capacity cannot be negative.";
    if (locations !== null && locations < 1) next.numberOfLocations = "Must be at least 1.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setSubmitting(true);
    void trackEvent("contact_form_submitted", { page: window.location.pathname });

    const preferredId = val("preferredContactId") || null;
    const preferred = cards.find((c) => c.id === preferredId) ?? null;

    try {
      const id = await submitInquiry({
        fullName,
        organization: val("organization"),
        email,
        phone,
        facilityType,
        parkingCapacity: capacity,
        numberOfLocations: locations,
        preferredContactId: preferredId,
        preferredContactName: preferred?.name ?? (preferredId === "none" ? "No Preference" : null),
        preferredContactMethod: val("preferredContactMethod") || "WhatsApp",
        projectRequirement: val("projectRequirement"),
        message,
        privacyConsent: consent,
        sourcePage: window.location.pathname,
        sourceUrl: window.location.href,
        referrer: document.referrer || "",
      });

      setLastSubmit(Date.now());
      setReference(id);
      formEl.reset();
      setErrors({});

      // Best-effort email notification. A failure here must NOT discard the saved inquiry.
      let emailOk = true;
      try {
        const notify = contact.notifications;
        const res = await fetch("/api/public/contact-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: id,
            fullName,
            organization: val("organization"),
            email,
            phone,
            facilityType,
            parkingCapacity: capacity,
            numberOfLocations: locations,
            preferredContactName: preferred?.name ?? null,
            preferredContactMethod: val("preferredContactMethod"),
            projectRequirement: val("projectRequirement"),
            message,
            sourcePage: window.location.pathname,
            subjectTemplate: notify?.subjectTemplate,
            recipients: notify?.enabled
              ? [notify.recipientEmails, notify.ccEmails]
                  .filter(Boolean)
                  .join(",")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          }),
        });
        const data = (await res.json()) as { sent?: boolean };
        emailOk = Boolean(data.sent);
      } catch {
        emailOk = false;
      }

      toast.success("Inquiry submitted", {
        description: emailOk
          ? "Thank you. Our team will contact you shortly."
          : "Your inquiry was saved. Email notification is temporarily unavailable, but we've received it.",
      });
    } catch (err) {
      toast.error("Could not submit inquiry", { description: mapInquiryError(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-secondary/60 py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={contact.sectionEyebrow || "Contact"}
            title={contact.sectionHeading}
            subtitle={contact.sectionDescription}
          />
        </Reveal>

        {cards.length > 0 ? (
          <Reveal className="mt-12">
            <div className="grid gap-5 sm:grid-cols-2">
              {cards.map((c) => (
                <ContactCard key={c.id} c={c} />
              ))}
            </div>
          </Reveal>
        ) : null}

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <Reveal className="flex flex-col gap-4">
            {[
              { icon: Mail, label: "Email", value: contact.primaryEmail },
              { icon: Phone, label: "Phone", value: contact.primaryPhone },
            ]
              .filter((c) => c.value)
              .map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="break-words text-sm font-semibold text-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            <div className="rounded-2xl bg-gradient-navy p-5 text-white shadow-glow">
              <p className="text-sm font-semibold">Software + Hardware Ecosystem</p>
              <p className="mt-1 text-xs text-white/70">
                We tailor the mobile app, ANPR gates, pricing rules, and dashboard to your facility.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {reference ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-card">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <h3 className="text-xl font-bold text-foreground">Thank you</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Your inquiry has been submitted successfully. Our team will contact you shortly.
                </p>
                <p className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
                  Inquiry Reference: <span className="font-mono">{reference}</span>
                </p>
                <button
                  onClick={() => setReference(null)}
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
              >
                {/* Honeypot — visually hidden, ignored by real users */}
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" htmlFor="fullName" required error={errors.fullName}>
                    <input
                      id="fullName"
                      name="fullName"
                      className={inputCls}
                      placeholder="Your full name"
                      maxLength={200}
                    />
                  </Field>
                  <Field label="Organization" htmlFor="organization">
                    <input
                      id="organization"
                      name="organization"
                      className={inputCls}
                      placeholder="Company / facility name"
                      maxLength={200}
                    />
                  </Field>
                  <Field label="Business Email" htmlFor="email" required error={errors.email}>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className={inputCls}
                      placeholder="you@company.com"
                      maxLength={200}
                    />
                  </Field>
                  <Field label="Phone / WhatsApp" htmlFor="phone" required error={errors.phone}>
                    <input
                      id="phone"
                      name="phone"
                      className={inputCls}
                      placeholder="+94 7X XXX XXXX"
                      maxLength={60}
                    />
                  </Field>
                  <Field
                    label="Facility Type"
                    htmlFor="facilityType"
                    required
                    error={errors.facilityType}
                  >
                    <select
                      id="facilityType"
                      name="facilityType"
                      className={inputCls}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      {FACILITY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Estimated Parking Capacity"
                    htmlFor="parkingCapacity"
                    error={errors.parkingCapacity}
                  >
                    <input
                      id="parkingCapacity"
                      type="number"
                      min="0"
                      name="parkingCapacity"
                      className={inputCls}
                      placeholder="e.g. 200"
                    />
                  </Field>
                  <Field
                    label="Number of Locations"
                    htmlFor="numberOfLocations"
                    error={errors.numberOfLocations}
                  >
                    <input
                      id="numberOfLocations"
                      type="number"
                      min="1"
                      name="numberOfLocations"
                      className={inputCls}
                      placeholder="e.g. 1"
                    />
                  </Field>
                  <Field label="Preferred Contact Person" htmlFor="preferredContactId">
                    <select
                      id="preferredContactId"
                      name="preferredContactId"
                      className={inputCls}
                      defaultValue="none"
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.role}
                        </option>
                      ))}
                      <option value="none">No Preference</option>
                    </select>
                  </Field>
                  <Field label="Preferred Contact Method" htmlFor="preferredContactMethod">
                    <select
                      id="preferredContactMethod"
                      name="preferredContactMethod"
                      className={inputCls}
                      defaultValue="WhatsApp"
                    >
                      {CONTACT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Project Requirement" htmlFor="projectRequirement">
                    <input
                      id="projectRequirement"
                      name="projectRequirement"
                      className={inputCls}
                      placeholder="e.g. ANPR + booking"
                      maxLength={400}
                    />
                  </Field>
                </div>

                <Field label="Message" htmlFor="message" required error={errors.message}>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className={inputCls}
                    placeholder="Tell us about your parking facility and what you'd like to improve."
                    maxLength={5000}
                  />
                </Field>

                <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                  />
                  <span>
                    {contact.privacyText}
                    {errors.privacyConsent ? (
                      <span role="alert" className="block font-medium text-red-500">
                        {errors.privacyConsent}
                      </span>
                    ) : null}
                  </span>
                </label>

                <CmsButton
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="mt-1 w-full sm:w-auto"
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Inquiry
                    </>
                  )}
                </CmsButton>
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> Your details are stored securely and never
                  shared.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
