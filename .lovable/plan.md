# SPM ECO Admin — Firebase Hybrid Authentication

## Reality check (what this stack allows)
This app runs on the **Cloudflare Workers edge runtime**, where the **Firebase Admin SDK cannot run**. So privileged operations — setting Custom Claims, creating/disabling admins, revoking sessions, minting Firebase session cookies — **cannot live in this app**. They run in a small **Firebase Cloud Function** you deploy separately. Everything else (login, token verification, route protection, our own session cookie, audit logs) runs here.

This is a hybrid, not the single-app Workers build the original brief described. The `NEXT_PUBLIC_*`, `middleware.ts`, and `src/app/...` conventions in the brief are Next.js and don't apply — this is TanStack Start (`src/routes/...`).

## What YOU set up in Firebase first (I can't do these)
1. Create a Firebase project (do a `-dev` and `-prod` pair if you want separate envs).
2. Enable **Authentication → Email/Password**.
3. Register a **Web App**, copy the client config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
4. Create **Firestore** (production mode).
5. Generate a **service account** key (for the Cloud Function + our edge audit writes).
6. Enable **App Check** (reCAPTCHA v3 provider) and copy the site key.
7. After I ship the Cloud Function code, deploy it and run the one-time super-admin setup script.

I'll then request these as secrets (never committed):
- Client-safe (prefixed `VITE_`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_APPCHECK_SITE_KEY`
- Server-only: `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_EMAIL`, `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`, `SESSION_SIGNING_SECRET` (generated)

## What I build in this app

### 1. Firebase client + App Check
- `src/lib/firebase/client.ts` — initialize Firebase once, export `auth`. Persistence set from the "Remember this device" choice (local vs session).
- App Check initialized with the reCAPTCHA site key.

### 2. Auth pages (premium SPM ECO design)
- `/admin/login` — split layout: left navy-gradient brand panel (logo, "Intelligent Parking Administration", supporting copy, parking visual); right white card (Welcome Back, email, password with show/hide, Remember this device, Forgot Password link, Secure Sign In). Footer: "Authorized administrators only. All administrative activities are securely recorded." **No sign-up option.**
- `/admin/forgot-password` — email field, neutral success message that never reveals whether an account exists.
- Email-verification gate: if signed in but unverified, block dashboard, show notice, allow resend + sign out.
- Generic error messages only (invalid credentials, disabled, unverified, unauthorized, too many attempts, network error).

### 3. Edge token verification + session (Workers-safe, no Admin SDK)
- `src/lib/firebase/verify.server.ts` — verify Firebase ID tokens with `jose` against Google's public JWKS, checking issuer/audience/expiry.
- Server route `/api/admin/session` — receives the ID token, verifies it, reads Custom Claims (`admin`, `role`), confirms role is approved, then sets a signed **HttpOnly, Secure, SameSite** session cookie (signed with `SESSION_SIGNING_SECRET`). Writes a login audit log.
- `/api/admin/logout` — clears the cookie, writes a logout audit log.
- If verified but no approved admin claim: reject, client signs the user out, shows "You are not authorized to access this administration panel."

### 4. Route protection
- `beforeLoad` on the `/admin` layout validates the session cookie server-side and redirects unauthenticated users to `/admin/login`. Existing admin sub-routes move under this guard. Role-based gating (e.g. `/admin/users` = super_admin only) via `src/lib/firebase/permissions.ts`.
- Redirect after login → `/admin/dashboard` (I rename `admin.index` → dashboard route).

### 5. Firestore data + rules
- `admins/{uid}` profile docs and `auditLogs` collection as specified.
- `firestore.rules` file: deny-by-default, admin-only reads, super_admin-only profile writes, role-scoped content/inquiry/analytics access, public contact-form create-only. (You deploy the rules.)

### 6. Privileged operations (separate Cloud Function — I provide the code, you deploy)
- `functions/` folder with an Admin-SDK Cloud Function exposing protected callable endpoints for: create admin, set/change role (Custom Claims), enable/disable/suspend, revoke sessions, send reset email. Guarded so only a `super_admin` caller can invoke.
- `scripts/setup-super-admin.ts` — one-time Node script (run locally) to set the first super_admin's claims + create their `admins/{uid}` doc.
- `SETUP.md` — documented initial-super-admin process.

### 7. Cleanup
- Remove Supabase-based admin auth (`src/lib/admin/auth.tsx` provider, Supabase `/auth` + `/reset-password` for admin). Public site + existing Supabase-backed analytics/inquiries/CMS data stay unless you want those moved to Firestore too (out of scope here).

## Boundaries / trade-offs to confirm
- **Two places to deploy:** this app (auto) **and** a Firebase Cloud Function (you deploy) for anything privileged. Admin user-management in `/admin/users` calls that function; it won't work until the function is live.
- **App Check + rate limiting:** App Check protects Firebase resources; true server rate limiting isn't a primitive on this backend — I can add an ad-hoc limit on the session endpoint if you want.
- **Existing admin data** (inquiries, analytics, CMS) currently lives in Lovable Cloud. This plan changes only *authentication/authorization*; it does not migrate that data to Firestore unless you ask.

## Technical notes
- ID tokens verified with `jose` (`jwtVerify` + `createRemoteJWKSet` against `https://www.googleapis.com/service_accounts/v1/jwks/securetoken@system.gserviceaccount.com`), audience = project id, issuer = `https://securetoken.google.com/<projectId>`.
- Our own signed session cookie (HMAC via `jose`) avoids needing Admin-SDK session cookies on the edge. Cookie carries uid + role + verified-at; re-checked in `beforeLoad`.
- Server-side Firestore writes (audit logs) use the Firestore REST API authenticated with a short-lived service-account JWT — Workers-safe, no Admin SDK.
- Secrets read only inside server handlers; `VITE_` values are the only client-exposed config.

Once you've created the Firebase project and have the client config + service account ready, tell me and I'll request the secrets and start building.
