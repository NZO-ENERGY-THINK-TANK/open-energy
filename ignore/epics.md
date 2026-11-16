# Vite migration epics

Source of truth: `plan-for-vite.md`.

Status: TODO | IN PROGRESS | BLOCKED | DONE

These epics group the migration work. Break each epic into small tasks before implementation. Each task must specify reference paths, allowed and forbidden write paths, dependencies, shared-file ownership, exact asset/data copy paths, validation commands, and completion evidence.

## Shared rules

- Do not modify `apps/backend/**` or `old-nextjs/**`.
- Preserve finished functionality; do not complete unfinished legacy features.
- Present additional exclusions and proposed legacy bug/documentation corrections for user approval before acting.
- One integration owner owns package files, the lockfile, global styles, router setup/generated route output, and shared API utilities.
- Complete foundation work before parallel page work. Parallel tasks must have non-overlapping write ownership.
- Use real contracts and unchanged copied assets/data. Never fabricate data or successful submissions.
- Do not send live Google submissions without explicit approval.
- Mark work DONE only with recorded checks and remaining limitations.

## E01 — Inventory and baseline

- Status: TODO
- Depends on: none
- Scope: Audit all 11 legacy page paths and compare existing Vite code with retained functionality.
- References: `old-nextjs/app`, `old-nextjs/components`, `old-nextjs/lib`, `old-nextjs/public`, `apps/frontend`

### Completion checks

- Record routes, features, API requests, assets/data, and environment requirements.
- Classify functionality as retained, explicitly dropped, approved TODO, or blocked.
- Record asset/data source and destination paths before copying.
- Run available frontend checks and record baseline failures.
- Present additional exclusions and proposed corrections for approval.

## E02 — Frontend foundation and local API access

- Status: TODO
- Depends on: E01
- Scope: Compatible dependencies, router/query providers, shared API access, frontend tooling, and local setup.
- References: `apps/frontend/package.json`, `apps/frontend/vite.config.ts`, `apps/frontend/config`, `package.json`, `pnpm-lock.yaml`, foundation/API sections of `plan-for-vite.md`

### Completion checks

- Reproducible installation and documented Node.js/pnpm requirements.
- Development, lint, format, format-check, type-check, and build commands are available.
- Router generation works without relying on stale generated files.
- Website API requests reach Python through a restricted development proxy without exposing credentials.
- Identify and resolve required endpoint/slash compatibility, obtaining approval for behavioral corrections.
- Document local environment setup and production API limitations without modifying backend files.
- Frontend builds before parallel page migration begins.

## E03 — Shared shell and visual foundation

- Status: TODO
- Depends on: E02
- Scope: Header, footer, desktop/mobile navigation, root layout, not-found view, shared UI primitives, typography, and global styles.
- References: `old-nextjs/app/layout.tsx`, `old-nextjs/app/globals.css`, `old-nextjs/tailwind.config.ts`, `old-nextjs/components/Layout`, `old-nextjs/components/ui`

### Completion checks

- Hebrew, RTL, Heebo, brand tokens, customized UI, and responsive behavior match retained source functionality.
- Next.js-specific layout, link, image, and font coupling is replaced without redesign.
- Navigation, direct loads, history, and applicable fragment links work.
- No links misleadingly target the dropped electricity dashboard.
- Shared title, description, and keywords are preserved; accepted SPA SEO limitations are documented.

## E04 — Home and informational pages

- Status: TODO
- Depends on: E03
- Scope: `/`, `/about`, `/terms`.
- References: corresponding pages under `old-nextjs/app` and their components under `old-nextjs/components/Sections`

### Completion checks

- Finished content, sections, links, and required integrations are preserved.
- Missing electricity dashboard is not restored; its unused requests and dead links are not retained.
- Assets are copied unchanged with recorded source/destination paths.
- Desktop/mobile and RTL checks are recorded.

## E05 — Renewable energy

- Status: TODO
- Depends on: E03
- Scope: `/renewable-energy`, its retained sections, charts, controls, data transformations, and exports.
- References: `old-nextjs/app/renewable-energy`, related components/hooks, `old-nextjs/lib/api.ts`

### Completion checks

- Retained sections and interactions match the reference.
- Real requests, chart units/calculations, filters, date controls, and CSV exports are verified where present.
- Loading, empty, and error states are checked.
- Required assets/data are copied unchanged; responsive and RTL checks are recorded.

## E06 — Emissions

- Status: TODO
- Depends on: E03
- Scope: `/emissions` and its retained charts, controls, datasets, and exports.
- References: `old-nextjs/app/emissions`, related components/hooks and data sources

### Completion checks

- Content, retained interactions, calculations, and units match the reference.
- Data loading and any filters/downloads work against existing contracts.
- Loading, empty, error, desktop/mobile, and RTL checks are recorded.
- Copied datasets/assets remain unchanged.

## E07 — Climate

- Status: TODO
- Depends on: E03
- Scope: `/climate` and its retained content, charts, controls, and data sources.
- References: `old-nextjs/app/climate`, related components/hooks and data sources

### Completion checks

- Retained content and behavior match the reference.
- Data transformations, units, controls, and downloads are verified where present.
- Loading, empty, error, desktop/mobile, and RTL checks are recorded.
- Copied datasets/assets remain unchanged.

## E08 — Predictions

- Status: TODO
- Depends on: E03
- Scope: `/predictions` and its retained forecast/comparison views.
- References: `old-nextjs/app/predictions`, related components/hooks, `old-nextjs/lib/api.ts`

### Completion checks

- Forecast requests use backend-compatible paths permitted by the development proxy.
- Retained charts, comparisons, filters, calculations, units, and exports are verified where present.
- Loading, empty, error, desktop/mobile, and RTL checks are recorded.
- No forecasts or live values are fabricated.

## E09 — Contact and usage survey

- Status: TODO
- Depends on: E03
- Scope: `/contact` and the usage-survey popup with existing Python/Google integration contracts.
- References: `old-nextjs/components/Sections/ContactSection.tsx`, `old-nextjs/components/NewsletterPopup.tsx`, read-only `apps/backend/app/api/site.py`, form section of `plan-for-vite.md`

### Completion checks

- Contact submits to `/api/submit-contact`; frontend validation follows existing Python limits.
- Survey uses descriptive frontend naming while preserving `/api/newsletter-track`, its environment variable, and session-storage compatibility.
- Survey dismissal remains non-blocking and is not represented as proof of successful recording.
- Survey TODO explains required Apps Script deployment, configuration, permissions, and approved end-to-end recording verification.
- `GOOGLE_CONTACT_SCRIPT_URL` and `GOOGLE_NEWSLETTER_SCRIPT_URL` setup is documented without secrets or backend edits.
- Mocked submission success/failure and survey session behavior are tested.
- Live Google delivery/recording is explicitly reported as verified or unverified; no live tests run without approval.

## E10 — API information and documentation

- Status: TODO
- Depends on: E03
- Scope: `/api` and `/api-docs`, including examples, links, downloads, and fragment navigation.
- References: corresponding pages under `old-nextjs/app`, `old-nextjs/components/Sections/ApiSection.tsx`, related documentation components

### Completion checks

- Existing content and retained interactions are ported without redesign.
- Examples that conflict with Python contracts are presented for approval before correction.
- Links, downloads, code examples, and documentation anchors are checked.
- Desktop/mobile and RTL checks are recorded.

## E11 — Search TODO destination

- Status: TODO
- Depends on: E03
- Scope: Keep `/search/result` reachable without implementing search.
- References: `old-nextjs/app/search/result`, approved search exception in `plan-for-vite.md`

### Completion checks

- Route clearly explains that search is not implemented and marks it TODO.
- No fixed legacy cards are presented as genuine search results.
- Direct loads, navigation, and browser back/forward work.
- No new search engine or invented result behavior is added.

## E12 — Final scope review, validation, and cleanup

- Status: TODO
- Depends on: E04, E05, E06, E07, E08, E09, E10, E11
- Scope: Reconcile the port with the inventory and approved scope; validate and document delivery.
- References: `plan-for-vite.md`, inventory and evidence from E01–E11

### Completion checks

- All 11 original paths resolve, with the approved search TODO exception.
- Retained functionality is verified; approved exclusions and remaining blockers are explicit.
- Lint, format-check, type-check, build, and added targeted tests pass with exact commands/results recorded.
- Browser checks cover retained charts/forms, navigation, downloads, assets, responsive widths, RTL, and console/network errors.
- Temporary migration placeholders, unused scaffold code/dependencies, and Next.js runtime coupling are removed.
- Approved search and survey TODOs remain documented without false completion claims.
- Backend/reference source are unchanged; no secrets are bundled or committed.
- Local setup and deferred production/SEO limitations are documented. Deployment is not implemented or claimed as validated.
