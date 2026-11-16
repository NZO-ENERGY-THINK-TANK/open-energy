# Next.js to Vite migration plan

## Goal

Port the finished functionality of the existing Next.js site into a maintainable React/Vite frontend in small, reviewable steps. Preserve its appearance, content, URLs, data, and behavior within the agreed scope below. This is a port, not a redesign or feature-development project.

The repository remains a pnpm monorepo:

- `apps/backend`: the existing working Python/FastAPI application. Do not modify it.
- `apps/frontend`: the Vite application. Its existing implementation may be reorganized or replaced as needed.
- `old-nextjs`: the read-only source of truth for UI, behavior, assets, and data.

The deliverable is a working local development environment and a frontend port of the agreed scope. AWS deployment is not part of this work.

## Agreed scope and exceptions

- Drop unfinished legacy functionality rather than completing it. Inventory and present any additional proposed exclusions to the user before removal; do not classify working functionality as unfinished because its migration is difficult or its environment is unavailable.
- Do not restore the missing home-page electricity dashboard from `old-nextjs/components/Sections/Main Content.txt`. Omit its dormant hooks and remove links that would target the absent section; preserve the finished home-page sections.
- Do not implement a search engine or retain the old fixed cards as real results. Keep `/search/result` as an explicitly labeled TODO destination explaining that search is not implemented. This is an approved exception to the no-permanent-placeholder rule.
- Keep the usage-survey popup and its existing Google Apps Script integration. Use descriptive frontend naming such as `UsageSurveyPopup`, not newsletter terminology. Keep the legacy backend endpoint and environment-variable names unchanged.
- Existing Python form validation takes precedence over legacy frontend validation. Adapt the frontend to those limits without changing Python.
- Preserve existing SEO metadata where possible. Reduced crawler/indexing behavior from client rendering is accepted; new SEO infrastructure is out of scope.
- Before correcting legacy bugs, API documentation, or other user-visible behavior beyond these agreed exceptions, present the specific proposed changes in chat and obtain approval. Necessary framework adaptations must not silently alter behavior.

## Non-negotiable boundaries

- Do not edit, move, reformat, or upgrade anything under `apps/backend`.
- Do not modify or delete `old-nextjs`.
- Do not redesign pages, rewrite copy, change calculations, replace datasets, or invent behavior.
- Copy existing assets and data files using file-copy tools or commands. Never retype CSV, JSON datasets, images, fonts, or other existing file contents into generated source.
- Do not embed CSV or large datasets in TypeScript components. Preserve source files and load them through the appropriate asset or data interface.
- Do not fabricate live data, simulate successful submissions, or hide broken features behind permanent placeholders. The explicit search TODO and documented usage-survey integration TODO are approved exceptions, not claims of working functionality.
- Do not add deployment infrastructure, production proxies, Docker changes, CI changes, SSR, TanStack Start, or a replacement full-stack framework.
- Root workspace scripts and the shared lockfile may change only as required for the frontend workflow. Avoid unrelated repository changes.
- If parity requires a backend change, report the exact mismatch and stop that affected task. Do not silently work around it by changing behavior.

## Agreed stack

- Vite, React, and TypeScript for a client-rendered SPA.
- Tailwind CSS with the appropriate Vite integration.
- Existing customized Radix-based shadcn/ui components, adapted for Vite without resetting their appearance.
- TanStack Router with file-based routes, shared layouts, typed navigation, and search-parameter handling that preserves existing URLs and behavior.
- TanStack Query for API state, caching, loading, errors, and mutations. Do not introduce a second server-data cache.
- Existing React Hook Form and Zod integrations where used.
- Existing chart libraries, icons, and other dependencies where needed for parity. Replacing chart libraries or removing other UI libraries is not a migration goal.
- pnpm workspaces and one root lockfile. Keep Python dependency management separate. Do not add Nx or Turborepo.

### Dependency policy

Use verified, compatible stable versions. Do not upgrade every dependency to the latest release as part of this port.

Audit the existing Vite dependencies before reusing them. Verify package availability and peer compatibility; do not assume existing declarations are correct. Align React and React DOM, document the required Node.js and pnpm versions, and retain a reproducible lockfile. Never bypass peer checks to force an incompatible installation.

Change versions only when required by Vite, compatibility, or a demonstrated migration issue. Remove Next.js runtime dependencies from the migrated frontend. Preserve customized shadcn component source rather than blindly regenerating it.

## Maintainable frontend structure

Use clear boundaries rather than large page files or excessive one-use abstractions:

- `src/routes`: thin TanStack Router route definitions and route-level composition.
- `src/components/ui`: shared shadcn primitives.
- `src/components/layout`: shared header, footer, navigation, and layout elements.
- `src/features/<feature>`: page sections, charts, hooks, and feature-specific logic grouped by domain.
- `src/lib`: shared API client, query setup, and genuinely reusable utilities.
- `src/types`: shared API/data types where not better owned by a feature.
- `public`: copied static assets that need stable public URLs; preserve existing paths where feasible.

This structure is guidance, not a reason to rewrite correct source. Extract meaningful components such as chart panels, filters, sections, forms, and reusable loading/error states. Avoid monolithic route components, duplicated request logic, and abstractions with no concrete use.

Configure ESLint, TypeScript checking, and Prettier early. Provide documented commands for development, build, lint, type-check, format, and format-check. Scope checks to the frontend; do not reformat the backend or reference application. Exclude generated route files and build output from manual formatting/lint ownership where appropriate.

## Local API access and legacy secret

Keep integration simple and leave backend authentication unchanged for this migration.

- The browser uses relative API URLs through Vite's development proxy.
- The development proxy forwards website data requests to the local Python backend and attaches the existing API key when required.
- Keep the key in local, ignored server-side environment configuration. Never place it in `VITE_*`, committed files, browser request code, or bundled assets.
- Centralize API URL construction and preserve request parameters, response handling, redirects/trailing slashes, and CSV download headers as needed by the old application.
- Reuse a simple explicit allowlist for website-facing proxy requests if appropriate; do not expose backend administrative routes through a blanket key-bearing proxy.
- No new backend proxy service or production authentication architecture is required. Removing the legacy secret is future work.
- Vite's development proxy is local tooling only. `vite preview` and a static production host are not replacements for it.

### Contact and usage survey

Use the already implemented Python handlers in `apps/backend/app/api/site.py`; do not create replacement handlers or edit Python code:

- Contact: page `/contact`, reference UI `old-nextjs/components/Sections/ContactSection.tsx`, submission `POST /api/submit-contact`.
- Usage survey: reference UI `old-nextjs/components/NewsletterPopup.tsx`, submission `POST /api/newsletter-track`. Despite the legacy names, this asks why visitors use the site; it does not collect email addresses or subscribe users to a newsletter.

Preserve the Google Apps Script integration path: browser, development proxy, Python validation, then Google Apps Script. Existing Python validation is authoritative, including contact field limits and accepted survey reasons. Report remaining incompatibilities instead of altering Python or inventing behavior.

Rename migrated frontend components and helpers to describe a usage survey. Preserve `/api/newsletter-track`, `GOOGLE_NEWSLETTER_SCRIPT_URL`, and the existing `newsletter-submitted` session-storage key for compatibility. Preserve the current non-blocking survey dismissal behavior; closing the popup is not evidence that Google recorded a response. Do not introduce a new consent-management system or claim this popup implements one.

Add an explicit TODO near the migrated survey integration and in local setup documentation. It must explain:

- A deployed Google Apps Script that accepts the survey's `{ reason: 1..5 }` JSON is required; its actual behavior must be checked rather than invented.
- The backend environment must supply `GOOGLE_NEWSLETTER_SCRIPT_URL` using an Apps Script deployment URL of the form `https://script.google.com/macros/s/<deployment-id>/exec`. Contact uses `GOOGLE_CONTACT_SCRIPT_URL` separately.
- Verify deployment access permissions, Python-to-Google delivery, and actual recording in the intended Google destination with user approval before sending a live test submission.
- The integration's configuration and end-to-end recording are currently unverified. Python accepts a Google HTTP 2xx response as delivery success without checking that a record was saved.

Document these requirements without committing secrets or altering backend files. Use mocked success/failure checks during migration. The survey may retain this clearly documented integration TODO at acceptance; do not claim live Google recording is validated unless an approved check proves it.

## Design and behavior parity

Preserve:

- Hebrew copy, `lang="he"`, RTL direction, Heebo typography, brand tokens, spacing, backgrounds, and responsive layouts.
- Header, footer, desktop/mobile navigation, image aspect ratios, alt text, and public asset URLs where relevant.
- Charts, legends, tooltips, date controls, filters, calculations, units, CSV exports, and loading/empty/error states.
- URL query parameters, browser back/forward behavior, and existing internal/external links for retained functionality. Search is limited to its approved TODO destination; links to dropped functionality must not remain misleading.
- Contact and usage-survey integrations, subject to authoritative Python validation and the documented survey exception.

Replace Next.js links, images, fonts, navigation, and metadata with Vite-compatible equivalents. Keep transformations narrowly focused on removing framework coupling.

During an unfinished milestone, explicitly label unavailable destinations or features. Temporary migration placeholders do not count as a completed port and must be removed before final acceptance, except for the approved search TODO and documented usage-survey integration TODO. Record dropped legacy functionality separately from incomplete migration work.

## Indexing findings and rendering limits

Inspection of `old-nextjs/app/layout.tsx` found shared Next.js metadata:

- Title: `פלטפורמת נתוני אנרגיה פתוחה - NZO`
- Description: `פלטפורמה ציבורית לחקר וניתוח נתוני אנרגיה ופליטות בישראל`
- Keywords: `אנרגיה, פליטות, CO2, אנרגיה מתחדשת, ישראל, נתונים`

Preserve these values in the Vite HTML document. Source inspection found no dedicated robots or sitemap files, and no explicit per-page metadata, canonical links, Open Graph, Twitter metadata, or structured-data implementation in the searched source.

The original Next.js runtime can provide rendered HTML; the Vite SPA initially serves an application shell. Preserving metadata does not guarantee identical crawler behavior or indexing. Do not add SSR or prerendering silently. This rendering/indexing difference is explicitly accepted. Preserve the existing metadata, Hebrew language, and document direction where possible; identical SEO behavior is not an acceptance requirement. New SEO work and deployment-time SEO remain outside this migration.

## Current state: audit, do not assume completion

The monorepo directories and frontend scaffold already exist. Vite route files exist for all 11 old page paths, and Python website form handlers already exist. Their presence does not prove parity or correctness.

The previous plan's home/about-only and uninstalled-dependencies status is stale. Begin with an audit and actual checks. Reuse correct frontend code; replace incorrect code without treating the first attempt as the source of truth. Do not delete the entire frontend before establishing what is useful.

## Migration milestones

### 1. Inventory and verified baseline

- Inventory every old route, its components, providers, assets, datasets, API requests, environment requirements, and Next.js-specific imports.
- Map existing frontend code against that inventory. Record missing behavior, duplicated code, embedded datasets, and known blockers.
- Identify which existing data files and assets must be copied unchanged. Record source and destination paths.
- Run available frontend checks to establish the baseline. Distinguish existing failures from migration regressions.
- Produce a route/feature parity checklist that later tasks can reference. Classify entries as retained, explicitly dropped, approved TODO, or blocked. Present additional unfinished-feature exclusions and proposed bug/documentation fixes to the user before acting.

### 2. Frontend foundation and local workflow

- Establish compatible dependencies, frontend structure, path aliases, and the router/query/provider setup.
- Configure linting, formatting, type-checking, and reproducible development/build commands.
- Verify the local API proxy and document environment setup without touching the backend.
- Establish reusable layout, UI primitives, copied fonts/assets, and real loading/error patterns.
- Confirm the frontend can build before proceeding with parallel page work.

### 3. Shared shell and first complete slice

- Port header, footer, responsive navigation, root layout, and not-found behavior.
- Complete `/`, `/about`, and `/terms`, including their required shared sections and components.
- Preserve finished home-page sections and their required integrations. Do not restore the missing electricity dashboard or retain its unused requests and dead section links.
- Review desktop/mobile appearance and RTL before multiplying the pattern across other pages.

### 4. Data pages in small batches

Port the remaining domains in dependency-aware batches:

- `/renewable-energy`
- `/emissions`
- `/climate`
- `/predictions`

Keep `/search/result` reachable as the approved explicit TODO destination. Do not build search or present the legacy fixed cards as real results.

For each batch, copy required assets/data unchanged, adapt framework imports, connect real requests, and validate charts, filters, query parameters, and exports before marking it complete. Shared chart/filter components must have one owner when agents run in parallel.

### 5. Forms and API-information pages

- Port `/contact` against the existing Python handler, aligning frontend validation with Python's existing contract.
- Port the usage-survey popup with descriptive frontend naming, its existing endpoint, and the required configuration/verification TODO. Preserve its non-blocking dismissal behavior without claiming successful recording.
- Port `/api` and `/api-docs`, preserving examples, links, downloads, and content unless the user approves specific corrections presented in chat first.
- Verify submission success/failure handling with mocked responses, including survey HTTP/network failure and session behavior. Do not send real Google submissions during automated tests; perform live checks only with explicit approval.

### 6. Full parity review and cleanup

- Reconcile every inventoried route and feature against the agreed scope, approved exclusions, and TODO exceptions.
- Remove temporary migration placeholders, unused scaffold/demo code, unused dependencies, and remaining Next.js runtime imports. Retain the approved search TODO and usage-survey integration TODO.
- Verify lint, format-check, type-check, production build, and targeted tests.
- Review representative desktop/mobile widths, RTL, navigation, retained charts/forms, the search TODO destination, survey session behavior, downloads, assets, and browser console/network errors.
- Document local setup, commands, configuration, known limitations, and the deferred production API/SPA-hosting decisions.

## Agent execution rules

Write `tasks.md` from this agreed plan as a separate next step. Do not launch implementation agents while the plan is still being reviewed.

Each task must specify:

- Objective and reference source paths.
- Allowed write paths and explicit forbidden paths.
- Dependencies and files owned by another task.
- Assets/data to copy, with source and destination paths.
- Concrete acceptance checks and validation commands.
- Completion evidence and any remaining blockers.

Complete foundation work before parallel page migration. Parallel agents must have non-overlapping write ownership. Assign shared dependencies, router root, package files, lockfile, global styles, and shared API utilities to one integration owner. Agents must request shared changes instead of editing another owner's files.

Require small reviewable batches. An agent must report what it copied, changed, and tested. A route existing, a successful build, or a screenshot alone is not evidence of full behavioral parity.

## Final acceptance

- All 11 original page paths resolve locally, including direct loads and browser back/forward navigation. `/search/result` explicitly displays its approved TODO, not working search results. Any further route exclusions require user review.
- Existing UI, content, assets, datasets, and user-visible behavior are preserved for retained functionality, subject to the agreed exceptions and approved corrections.
- Retained charts, filters, downloads, and forms use the existing contracts. Python form validation takes precedence; no search implementation or restoration of the missing home dashboard is required.
- The usage survey has descriptive frontend naming, preserves its legacy backend contract, and includes the required setup/verification TODO. Mocked behavior is tested; live Google delivery and recording are reported separately as verified or unverified.
- No manually recreated datasets, fabricated live values, fake submission success, or unapproved permanent migration placeholders remain. The search TODO and documented survey integration TODO are explicit exceptions.
- Existing basic SEO metadata is preserved where possible. Client-rendering-related SEO differences are accepted; identical indexing is not required.
- Shared components and feature boundaries keep route files understandable and avoid duplicated logic.
- Frontend lint, format-check, type-check, build, and added targeted tests pass; browser checks are reported separately.
- No backend changes, source-reference changes, bundled secrets, or Next.js runtime dependency remain.
- Local setup is documented. AWS ECS/static hosting compatibility is considered through environment-driven API configuration and static output, but deployment is not implemented or claimed as validated.
