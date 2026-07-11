import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side inquiry email notification (Resend).
 *
 * The inquiry itself is already saved to Firestore by the client before this is
 * called, so email is best-effort: if the provider is not configured or fails,
 * we return { sent: false } and the client keeps the successful save.
 *
 * Provider secrets live ONLY in server env vars — never in the browser or
 * Firestore:
 *   RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_NOTIFICATION_EMAILS
 */
export const Route = createFileRoute("/api/public/contact-notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (ok: boolean, extra: Record<string, unknown> = {}) =>
          new Response(JSON.stringify({ sent: ok, ...extra }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });

        try {
          const apiKey = process.env.RESEND_API_KEY;
          const fromEmail = process.env.CONTACT_FROM_EMAIL;
          const envRecipients = (process.env.CONTACT_NOTIFICATION_EMAILS ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          const body = (await request.json()) as {
            reference?: string;
            fullName?: string;
            organization?: string;
            email?: string;
            phone?: string;
            facilityType?: string;
            parkingCapacity?: number | null;
            numberOfLocations?: number | null;
            preferredContactName?: string | null;
            preferredContactMethod?: string;
            projectRequirement?: string;
            message?: string;
            sourcePage?: string;
            recipients?: string[];
            subjectTemplate?: string;
          };

          // Admin-configured recipients (from published settings) may be added,
          // but env recipients are always included so ops never miss inquiries.
          const extraRecipients = Array.isArray(body.recipients)
            ? body.recipients.map((s) => String(s).trim()).filter(Boolean)
            : [];
          const recipients = Array.from(new Set([...envRecipients, ...extraRecipients])).filter(
            (e) => /.+@.+\..+/.test(e),
          );

          if (!apiKey || !fromEmail || recipients.length === 0) {
            return json(false, { reason: "not_configured" });
          }

          const esc = (v: unknown) =>
            String(v ?? "—").replace(/[<>&]/g, (c) =>
              c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
            );

          const org = body.organization || body.fullName || "New inquiry";
          const subject = (body.subjectTemplate || "New SPM ECO Inquiry — {organization}").replace(
            "{organization}",
            org,
          );

          const rows: Array<[string, unknown]> = [
            ["Reference", body.reference],
            ["Full name", body.fullName],
            ["Organization", body.organization],
            ["Email", body.email],
            ["Phone", body.phone],
            ["Facility type", body.facilityType],
            ["Parking capacity", body.parkingCapacity],
            ["Number of locations", body.numberOfLocations],
            ["Preferred contact", body.preferredContactName],
            ["Preferred method", body.preferredContactMethod],
            ["Requirement", body.projectRequirement],
            ["Message", body.message],
            ["Source page", body.sourcePage],
            ["Submitted", new Date().toLocaleString()],
          ];

          const html = `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
              <h2 style="color:#06182c">New SPM ECO Inquiry</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                ${rows
                  .map(
                    ([k, v]) =>
                      `<tr><td style="padding:6px 10px;background:#f4f7fb;font-weight:600;width:180px">${esc(
                        k,
                      )}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${esc(
                        v,
                      )}</td></tr>`,
                  )
                  .join("")}
              </table>
              <p style="margin-top:16px">
                <a href="https://spm-eco-system.web.app/admin/inquiries"
                   style="background:#176bff;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">
                   Open in admin panel</a>
              </p>
            </div>`;

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: recipients,
              reply_to: body.email || undefined,
              subject,
              html,
            }),
          });

          if (!res.ok) {
            const detail = await res.text();
            console.error(`Resend send failed [${res.status}]: ${detail}`);
            return json(false, { reason: "provider_error" });
          }
          return json(true);
        } catch (err) {
          console.error("contact-notify error:", err);
          return json(false, { reason: "exception" });
        }
      },
    },
  },
});
