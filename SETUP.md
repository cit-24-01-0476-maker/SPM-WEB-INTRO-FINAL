# SPM ECO System — Admin Authentication (Firebase)

Admin authentication uses **Firebase Authentication** (email/password) plus a
**Firestore `admins/{uid}` profile** for authorization. This phase is
client-side; it is structured so that the Firebase Admin SDK, Custom Claims and
secure server session cookies can be layered on later.

> This project runs on **TanStack Start (Vite)**, not Next.js. Client env vars
> therefore use the `VITE_` prefix (Vite does not expose `NEXT_PUBLIC_` to the
> browser), and pages live under `src/routes/`, not `src/app/`.

## Firebase project & configuration

The active Firebase project is **`spm-eco-system`**
(`authDomain: spm-eco-system.firebaseapp.com`). The publishable Firebase web
config is embedded directly in `src/lib/firebase/client.ts` (these values are
safe for the browser — security is enforced by Firebase Auth + Firestore rules,
not by hiding them). Firebase is initialized exactly once via
`getApps()/getApp()/initializeApp()` and exports `firebaseApp`, `firebaseAuth`,
and `firestore`.

Never place Firebase Admin **service-account JSON**, private keys, or admin
passwords in any frontend file or in Git.

## Important: Auth users and admin docs are separate

- A Firestore `admins/{uid}` document **alone does not** create a Firebase
  Authentication user.
- A Firebase Authentication user **alone does not** grant admin access without a
  matching `admins/{uid}` document.

Both must exist, keyed by the **same** Firebase Auth UID.

## Firestore admin profile

Collection: `admins`, document ID = the Firebase Auth user UID.

```json
{
  "uid": "FIREBASE_AUTH_USER_UID",
  "displayName": "SPM ECO Administrator",
  "email": "admin@example.com",
  "role": "super_admin",
  "status": "active"
}
```

Roles: `super_admin`, `content_editor`, `analytics_viewer`, `inquiry_manager`.
Status: `active`, `disabled`, `suspended`. Access is granted only when the
document exists, `status == "active"`, and `role` is an approved role.

## Create the first administrator (Firebase Console)

1. Open the **`spm-eco-system`** Firebase project.
2. Go to **Authentication**.
3. Go to **Sign-in method** and **enable Email/Password**.
4. Go to **Authentication → Users**.
5. Create the administrator user (or reset its password).
6. Copy the **exact Firebase UID**.
7. Go to **Firestore Database**.
8. Create the collection **`admins`**.
9. Create a document whose **ID is the exact Authentication UID**.
10. Add fields:
    - `uid` = the exact Firebase UID
    - `displayName` = administrator name
    - `email` = the same Authentication email
    - `role` = `super_admin`
    - `status` = `active`
    - `createdAt` = timestamp
    - `lastLoginAt` = null
11. Publish the Firestore security rules.
12. Visit **`/admin/login`** and sign in with the same Firebase email/password.

There is **no public administrator registration page**, and admins are never
created from the browser.

## Publish the security rules

Copy `firestore.rules` into **Firebase Console → Firestore Database → Rules**
and publish. The rules deny everything by default and grant admin access only to
active administrators.

## What's implemented

- `/admin/login` — Firebase email/password sign-in (no sign-up, no social login).
- Firestore admin-profile validation (exists + active + approved role); invalid
  Firebase users are signed out immediately.
- `/admin/forgot-password` — Firebase password reset (neutral response).
- Protected `/admin/*` routes with a full-screen loading gate and role-based
  navigation + page blocking.
- Secure logout that clears state and returns to `/admin/login`.

## Security note

This phase authorizes via Firestore admin documents on the client. It is **not**
the final server-side enterprise authorization. A later phase can add the
Firebase Admin SDK, Custom Claims and HttpOnly server session cookies for
server-verified authorization.

---

## Production deployment (GitHub + Vercel)

This project is a **TanStack Start (Vite)** app. It is **not** a Next.js app and
must not be configured as one. Do not add SPA `_redirects`/`rewrites` that route
everything to `index.html` — that breaks server routes.

### 1. Firebase Console
1. **Authentication → Sign-in method** → enable **Email/Password**.
2. **Authentication → Settings → Authorized domains** → add:
   - `localhost`
   - your Vercel production domain (e.g. `your-app.vercel.app`)
   - any custom domain
3. Create the admin **Authentication user** (email + password).
4. Create a matching Firestore document `admins/{exactUid}` with:
   ```
   role:   super_admin
   status: active
   ```
   (The UID must exactly match the Authentication user's UID.)
5. **Publish `firestore.rules`** from this repo in
   Firestore Database → Rules → Publish. The app cannot read/write settings
   until these rules are live.

### 2. Vercel environment variables
Add every `VITE_FIREBASE_*` value from `.env.example` under
**Vercel → Project → Settings → Environment Variables**, applied to
**Development**, **Preview**, and **Production**. Redeploy after any change —
Vercel bakes `VITE_*` values at build time.

Google Drive server variables (optional) are set the same way but **without**
the `VITE_` prefix so they never reach the browser.

### Google Drive media uploads (optional)

The Media Library (`/admin/media`) works fully in **URL mode** with no setup.
To enable **drag-and-drop uploads** into the shared Google Drive folder:

1. Create a Google Cloud project and enable the **Google Drive API**.
2. Create a **service account** and generate a **JSON key**.
3. Share this Drive folder with the service account email as **Editor**:
   `https://drive.google.com/drive/folders/1rEUGF1kkf4j8DfZJEmj0XzrasjCk-UKd`
4. Set these **server-only** environment variables (no `VITE_` prefix), in
   both local `.env` and Vercel:

   ```
   GOOGLE_DRIVE_FOLDER_ID=1rEUGF1kkf4j8DfZJEmj0XzrasjCk-UKd
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account>@<project>.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
   ```

   (Keep the literal `\n` sequences in the private key; the server restores
   real newlines.) OAuth (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` /
   `GOOGLE_REFRESH_TOKEN` + `GOOGLE_DRIVE_FOLDER_ID`) is also supported.

The server auto-creates `SPM-ECO-Media/<Category>/` subfolders on first upload
and reuses them afterwards. Until credentials are present, the Media Library
shows **Google Drive: Not configured** and upload is disabled — never an error
loop.


### 3. Verify after deploy (incognito)
- Admin login works at `/admin/login`.
- Direct refresh works on `/admin/login` and protected admin routes.
- Save Draft and Publish succeed as a `super_admin`.
- Public homepage loads with no settings error and reflects published design.
- Logout blocks protected routes (browser Back does not restore them).

### Build commands
- Install: `npm install` (or `npm ci`)
- Build: `npm run build`
- Lint: `npm run lint`

> There is no `typecheck` script; type errors surface during `npm run build`.

### Vercel build target (important)

By default this project's build produces a **Cloudflare Workers** output
(Lovable's managed Vite/Nitro config). To deploy on **Vercel**, tell Nitro to
use the Vercel preset at build time by adding an environment variable in
**Vercel → Settings → Environment Variables** (all environments):

```
NITRO_PRESET=vercel
```

Then set **Build Command** to `npm run build` and leave the **Output Directory**
empty (Nitro's Vercel preset writes the standard `.vercel/output`). Do **not**
add SPA rewrites or a `vercel.json` that routes everything to `index.html` —
that breaks the app's server routes. Redeploy after changing env vars.

---

## Live Visitor Analytics (Firebase Realtime Database)

Real-time presence on `/admin/live-visitors` uses the Firebase **Realtime
Database** (separate from Firestore). Historical analytics and the public site
work without it — only live presence requires this setup.

1. **Enable Realtime Database** — Firebase Console → Build → Realtime Database →
   Create Database (choose a region, start in *locked mode*).
2. **Copy the Database URL** — e.g.
   `https://<project>-default-rtdb.firebaseio.com`.
3. **Add `VITE_FIREBASE_DATABASE_URL`** to Vercel (Development, Preview,
   Production) with that URL, and to your local `.env`.
4. **Publish `database.rules.json`** — Firebase Console → Realtime Database →
   Rules → paste the contents of `database.rules.json` → Publish. These rules
   let anonymous visitors write only their own presence node and restrict
   reads to authenticated admins.
5. **Publish `firestore.rules`** — Firestore → Rules → paste `firestore.rules`.
6. **Authorized Domains** — Authentication → Settings → add your Vercel
   production and preview domains.
7. **App Check (optional, start in monitoring)** — set
   `VITE_FIREBASE_APPCHECK_SITE_KEY` (reCAPTCHA v3). Keep App Check in
   *monitoring* mode until you confirm traffic passes, then enforce.
8. **Add `ANALYTICS_HASH_SALT`** (server-only, no `VITE_` prefix) to Vercel for
   salted visitor hashing in `/api/public/visitor-context`.
9. **Redeploy** after any environment-variable change.

### Verifying live presence

1. Open the public site in an incognito window.
2. In `/admin/live-visitors` confirm one visitor appears.
3. Navigate to another public page — the **Current Page** updates.
4. Start the contact form — the row shows **Form started**; submit it — it shows
   **Converted**.
5. Close the incognito tab — the visitor disappears within ~90 seconds (or
   instantly via `onDisconnect`).

Approximate country/region/city come from Vercel edge headers
(`x-vercel-ip-*`) and are only available on the deployed Vercel site, not on
`localhost`. Location is estimated from network information and may not be exact.
Raw IP addresses are never stored or shown.
