# Open Energy frontend

React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Router, and Radix-based shadcn/ui components.

## Initial scope

- Home page (`/`): original hero, topic navigation, data-section shell, and external resources.
- About page (`/about`): original organization information and contact details.
- Shared responsive header/footer, Hebrew RTL layout, Heebo typography, and a not-found view.

The original application remains untouched in `old-nextjs`. App-owned images live in `src/assets/{brand,heroes,backgrounds,icons}` and use explicit imports so Vite resolves and fingerprints their URLs. Keep `public` for files requiring fixed public URLs, such as `favicon.svg`; unused legacy design exports and archives are not deployed. Former `/legacy/` asset URLs are no longer provided; external consumers must update their URLs or arrange hosting redirects.

Charts, search, dashboard routes, contact submission, and newsletter tracking are not connected yet. Deferred navigation is visibly disabled and labeled “בקרוב”. Data panels explicitly state that live data is unavailable. No backend credentials or simulated submissions are included.

## Development

From the monorepo root, install dependencies and start the frontend:

```sh
pnpm install
pnpm dev:frontend
```

Use a supported Node.js LTS release compatible with the installed Vite version. Dependency installation updates the root lockfile; commit that updated lockfile after verifying the application.

TanStack Router generates `src/routeTree.gen.ts` from `src/routes` when Vite starts. Do not edit the generated file manually.

```sh
pnpm build:frontend
pnpm lint:frontend
pnpm typecheck:frontend
```

The build runs Vite before TypeScript so the route tree exists on the first build. Standalone type checking requires a prior Vite start or build to generate the route tree.

## Hosting

Deploy the generated `dist` directory as a static SPA. Configure the production server to return `index.html` for frontend route requests such as `/about` without intercepting API requests or missing asset requests. Vite's development fallback does not configure production hosting.

The Heebo font currently loads from Google Fonts, which makes third-party requests from visitors' browsers. Self-host it before deployment if required by the site's privacy policy or offline requirements.

## UI conventions

- Use `@/` imports for `src` modules.
- Keep the existing brand palette, Hebrew copy, RTL behavior, and responsive layout.
- `components.json` configures shadcn/ui for Vite and Tailwind 4, with React Server Components disabled.
- Add React Hook Form, Zod, and TanStack Query when migrating the first actual forms and API-backed sections; this UI-only milestone does not need them yet.
- Keep secrets server-side. Variables prefixed with `VITE_` are public.
