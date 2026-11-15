# Vite migration plan

## Goal

Convert the project into a pnpm monorepo with a Python/FastAPI backend in `apps/backend` and a React/Vite frontend in `apps/frontend`. Reuse the existing frontend's UI and behavior without retaining a Next.js runtime.

This document records the proposed stack first. Detailed migration steps will follow after the stack is agreed.

## Step 1: Choose the stack

### Recommended frontend stack

- **Vite + React + TypeScript:** Build a client-rendered application. Vite handles development and production builds; FastAPI remains the application backend.
- **Tailwind CSS:** Use the latest stable release and its Vite integration. Migrate the existing Tailwind 3 configuration, theme tokens, plugins, and styles to the selected version while preserving responsive behavior and RTL layout.
- **TanStack Router:** Use file-based routing, typed navigation, nested layouts, and validated URL search parameters. Preserve existing public URLs. Use URL search parameters for shareable filters such as dates, chart views, and search terms.
- **TanStack Query:** Retain the existing dependency for API requests, caching, loading states, and mutations. Router loaders may prefetch Query data, but should not create a separate data-cache layer.
- **shadcn/ui:** Retain the existing Radix-based shadcn/ui components from `old-nextjs/components/ui`. The source project has a shadcn configuration in `old-nextjs/components.json`. Update that configuration for Vite, including disabling React Server Components and pointing to the migrated CSS file. Bring reused components in line with current shadcn/ui patterns and the selected React and Tailwind versions. Preserve local customizations. Reuse existing chart libraries and icons, upgrading their packages rather than replacing them with another UI kit or charting stack.
- **React Hook Form + Zod:** Keep React Hook Form for form state and submission, including the existing shadcn/ui form integration. Retain Zod for schema validation and use the Zod resolver where appropriate. Zod can also validate route search parameters.

### Version strategy

- Use the latest stable releases available at implementation time for frontend dependencies and tooling, including React, React DOM, Vite, TypeScript, Tailwind CSS, TanStack Router, TanStack Query, React Hook Form, Zod, UI primitives, and chart libraries. Do not use prerelease or canary versions.
- Verify actual published versions and peer dependency requirements before selecting versions. Keep React and React DOM aligned, and choose a supported Node.js LTS release that satisfies the toolchain.
- Include dependency upgrades in this migration rather than preserving the old Next.js dependency versions. Resolve breaking API changes in the migrated source.
- If the latest releases cannot work together, document the conflict and select the newest compatible stable combination. Do not bypass peer dependency checks to force installation.
- shadcn/ui components are copied source code, not a single versioned runtime package. Review current component implementations and CLI guidance, applying changes without blindly overwriting customized components.
- Audit existing dependencies and migrate only those still needed. Do not carry Next.js-specific packages into the Vite application.
- Pin the chosen pnpm version, record resolved dependency versions in the root lockfile, and use frozen-lockfile installs in CI.
- Validate upgraded forms, Zod schemas and resolvers, chart interactions, date pickers, theme behavior, and RTL styling alongside the routing migration.
- This version policy applies to the frontend and JavaScript tooling. Python dependency upgrades remain outside this migration unless required by a specific backend change.

### Why TanStack Router

The application has multiple pages, shared layouts, search, and dashboard filters. Typed routes and validated search parameters fit those needs. File-based routing also provides a clear replacement for the Next.js App Router.

TanStack Router does not require TanStack Start. Use Router with Vite only; do not add a replacement full-stack React framework.

### Monorepo tooling

- Use pnpm workspaces for JavaScript dependencies and root convenience scripts.
- Keep Python dependency management separate using `requirements.txt` and a backend-local virtual environment.
- Do not add Turborepo or Nx initially. Two applications do not yet justify another orchestration layer.
- Maintain one root pnpm lockfile and pin the chosen pnpm version.

### Backend and security boundary

Vite replaces the frontend build system, not the Next.js server routes. The existing frontend contains a backend API proxy, a contact handler, and a newsletter tracking handler. Each needs an explicit server-side replacement.

- Keep backend API keys server-side. Never put secrets in `VITE_*` variables or browser code.
- Plan a production same-origin proxy for `/api/backend/*`, with a matching development proxy. Vite's development proxy is not a production server.
- Restrict publicly proxied endpoints so administrative backend routes remain protected.
- Port contact and newsletter server behavior into FastAPI where appropriate.

### Rendering and hosting considerations

- The initial target is a client-rendered SPA, not SSR.
- Configure production hosting to serve `index.html` for frontend routes while keeping API and asset handling separate.
- Preserve Hebrew text, RTL behavior, fonts, page titles, and existing URLs.
- Confirm SEO and social-preview requirements before accepting client-only rendering for public content. Per-page HTML metadata may require a separate prerendering decision.

## Step 2: Minimal UI migration kickoff

The Vite application has been scaffolded with TanStack Router and shadcn/ui. Start with a small, reviewable UI slice rather than migrating every dashboard at once.

### Implementation status

The initial UI is implemented in `apps/frontend`: file-based home and about routes, a shared responsive header/footer, a not-found view, Tailwind 4 brand tokens, and shadcn/ui button infrastructure. The home page retains its hero, images, resource links, and data-section layout; charts remain explicitly unavailable rather than showing fabricated data. Deferred navigation is disabled and labeled. The original `old-nextjs` remains unchanged.

Dependencies have been declared but still need installation with pnpm. No shell commands were run during setup. Build, lint, browser behavior, responsive appearance, and production route fallbacks remain unverified. TanStack Router generates its route tree on the first Vite start or build.

### First milestone

- [ ] **Shared application shell:** Port the existing header, footer, navigation, content container, and required providers from `old-nextjs/app/layout.tsx` and its components. Use a TanStack Router root layout with an outlet.
- [ ] **Home page (`/`):** Port `old-nextjs/app/page.tsx` and `components/Sections/HomePage`, including only the components and assets needed by that page. Preserve the existing section order, visual hierarchy, and links. Defer linked dashboards rather than importing them solely to satisfy navigation.
- [ ] **About page (`/about`):** Port `old-nextjs/app/about/page.tsx` and `components/Sections/AboutSection`. This provides a second real route and a mostly static page for checking shared layout and navigation.
- [ ] **Not-found view:** Add a small, styled not-found view with a working link back to the home page.

### Design preservation

- Keep the existing design rather than adopting the scaffold's demo appearance or default shadcn styling.
- Preserve Hebrew copy, `lang="he"`, RTL direction, Heebo typography, brand colors, theme tokens, spacing, backgrounds, image assets, and responsive layouts.
- Reuse customized shadcn components where needed, adapting them to the new dependency versions without resetting their appearance.
- Replace Next.js links, images, and fonts with Vite-compatible implementations. Keep image aspect ratios, alt text, and layout behavior.
- Keep visible navigation labels and existing URL paths. For destinations not yet migrated, use an explicit temporary unavailable page or clearly disabled item; do not silently redirect them to unrelated content.
- Leave `old-nextjs` intact as the visual and behavior reference until the migrated pages are accepted.

### Scope boundaries

- Do not migrate all charts, data dashboards, search, API documentation, contact submission, or newsletter tracking in this first milestone.
- If home-page sections require API data, preserve their layout with clearly labeled development fixtures or loading/error states until secure API access is ready. Never present fixture values as live data.
- Do not simulate successful contact or newsletter submissions. Keep submission unavailable until the server handlers are migrated.
- Import only dependencies and components needed for this milestone. Do not copy the entire old component tree or remove the existing scaffold configuration wholesale.

### Acceptance checks

- Both `/` and `/about` render through TanStack Router, and browser back/forward navigation works.
- Direct route loads and refreshes work with the configured hosting fallback.
- Header, footer, mobile navigation, typography, and RTL layouts match the source at representative desktop and mobile widths.
- Images and fonts load without Next.js packages or missing assets.
- Unknown URLs show the not-found view, and deferred navigation has an explicit state.
- The frontend builds and type-checks with no browser console errors on the migrated pages.
- No backend secrets appear in browser code or bundled assets.

## Next planning steps

1. Inventory existing pages, Next.js APIs, providers, environment variables, and deployment assumptions.
2. Plan the backend move and update paths, Docker build contexts, ignore rules, and CI.
3. Scaffold the pnpm workspace and Vite frontend with the agreed stack.
4. Define the route tree and replace Next.js navigation, image, font, and metadata features.
5. Migrate server handlers and configure secure development and production API access.
6. Port pages and components incrementally, preserving behavior and URLs.
7. Validate builds, types, routes, RTL layout, charts, forms, exports, and secret handling before retiring the old frontend.
