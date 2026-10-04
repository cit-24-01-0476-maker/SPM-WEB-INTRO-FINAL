# SPM ECO connected parking prototype

Run `npm install` then `npm run dev -- --port 8081`. The public website is `/`; the existing Firebase-authenticated Website CMS stays at `/admin`. Parking prototype routes have separate shells and never grant CMS privileges.

| Area               | Entry            | Features                                                                                                                                             |
| ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Driver             | `/app`           | Fictional demo identity, vehicles, parking filters, SVG slot selection, reservation, wallet, navigation, verification, sessions, receipts, assistant |
| SLTC presentation  | `/app/demo`      | Start, Pause, Next Step, Reset; connected A05 journey                                                                                                |
| Provider           | `/provider`      | Provider registration, facilities, slots, graph editor, pricing, bookings, sessions, transactions, reports, settings                                 |
| Parking operations | `/parking-admin` | Shared platform overview, drivers, providers, facility and slot management, verification records, commission, CSV reports                            |

## Presentation

Open `/app/demo` and click Start Demo. It uses the same `applyAction` service as the manual app: demo driver → select A05 → pay first hour → outdoor approach → entry match → Dijkstra route to A05 → park → add 75 simulated minutes → calculated exit route → exit match → final wallet settlement. Reset asks before clearing this browser's shared prototype dataset; it does not change the CMS.

Default billing: LKR 100 for the first hour, LKR 80 per started additional hour. A 75-minute session totals LKR 180. LKR 100 is prepaid and only LKR 80 is collected at exit. Default platform commission is 10% (LKR 18) and provider net is LKR 162. The demo wallet goes from LKR 1,500 to LKR 1,320. Rates and commission are snapshotted per booking. Presentation books the next opening time if run after closing; simulated arrival can then demonstrate the complete journey immediately.

## Architecture and boundaries

- `src/lib/parking/types.ts` contains the shared typed model. Each facility owns its map, nodes, enabled/directed weighted edges, zones and slots.
- `service.ts` is the transactional domain layer. Failed actions leave previous state untouched. It guards slot conflicts, active booking edits, vehicle ownership, verification stages, wallet balance, repeated refunds/settlement and map reachability.
- `repository.ts` is one replaceable browser demo repository, subscribed through `useSyncExternalStore`. It persists one schema-versioned dataset, sends storage updates across same-origin tabs, and uses browser Web Locks where supported. It is not a production database or authorization mechanism. If storage is disabled, the current page remains usable in memory; reload persistence and cross-tab synchronization are unavailable. Browsers without Web Locks do not provide an atomic cross-tab transaction guarantee.
- `navigation.ts` implements real Dijkstra routing over editable SVG graph data. Route interpolation animates a marker along graph segments. Outdoor movement and internal position are controlled simulation. Optional browser GPS reports distance and uncertainty; it never silently authorizes entry, parking or payment. Find My Car uses a simulated pedestrian origin at the entrance.
- `billing.ts` centralizes duration, hourly rounding, outstanding balance, commission and provider net. Provider and operations reports derive from completed sessions in the same dataset. Initial manually occupied/blocked spaces are inventory examples, not fabricated driver sessions.
- Payments, ANPR and QR are explicit simulations. No real funds, credentials, camera OCR or physical access equipment is connected. QR fallback compares an opaque demo token rather than decoding a camera image or issuing a production credential.
- The assistant is a state-aware controlled response system. Recommendations, demand and duration displays use transparent demo heuristics, not a trained model or measured prediction accuracy.
- Existing English/Sinhala public translation and CMS contact/WhatsApp/settings services remain separate. Public ROI is not exposed; legacy economic configuration remains in the CMS, with obsolete sensing costs excluded.

For production, replace the repository with an authenticated server API and database transactions, implement role/tenant authorization, genuine payment reconciliation and verified camera/QR services, and validate a supported internal positioning system. Browser persistence and named fictional profiles are intentionally limited to university demonstrations.

## Verification

- `npm run test:parking`: real service tests for the complete journey, failures/retries, cancellation/expiry refunds, quote snapshots, map validation, Dijkstra directions and presentation outside opening hours.
- `npm run typecheck`: TypeScript verification.
- `npm run lint`: existing repository ESLint configuration (existing Fast Refresh advisory warnings may remain).
- `npm run build`: production client/server build.

The checkout is linked to `cit-24-01-0476-maker/SPM-WEB-INTRO-FINAL`. Its `main` branch is connected to the existing Vercel production project. Pushes trigger a deployment; verify the commit's Vercel status before treating changes as live. `vercel.json` selects the committed npm lockfile for reproducible installation. Nitro automatically selects the Vercel deployment target in Vercel builds; use `NITRO_PRESET=vercel` to verify that target locally. Local logs, screenshots, dependencies, credentials and generated build artifacts are ignored by Git.
