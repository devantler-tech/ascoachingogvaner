# AS - Coaching, vaner og ro

Marketingside for **AS - Coaching, vaner og ro**: personlig coaching i stress, angst,
vaner og overspisning. Besøgende kan læse om ydelserne, sende en besked og booke tid.

Siden er fuldt statisk (ingen database eller backend). Booking foregår i et eksternt
bookingsystem, og kontaktformularen åbner den besøgendes egen mailapp med en udfyldt besked.

Deployes som tenant på [devantler-tech/platform](https://github.com/devantler-tech/platform)
via en OCI-pakket Kustomize-konfiguration (`deploy/`).

## Features

Hele siden er én sammenhængende side; navigationen scroller til det relevante afsnit:

- **Forside**: hero med de primære call-to-actions
- **Services**: fire forløb (stress, angst, vaner, overspisning) med priser og rater
- **Om mig**: coachens baggrund, personlige historie og uddannelse/certificeringer
- **Kontakt & booking**: kontaktformular (åbner mailapp via `mailto`) plus "Book tid"-knapper, der linker til det eksterne bookingsystem

## Tech stack

- [SvelteKit](https://kit.svelte.dev) (Svelte 5) + TypeScript
- [`@sveltejs/adapter-static`](https://svelte.dev/docs/kit/adapter-static): hele siden prerenderes til statisk HTML
- [TailwindCSS v4](https://tailwindcss.com)
- [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (E2E)
- Serveres i produktion af nginx (se `Dockerfile` og `docker/nginx.conf.template`, renderet ved build fra `src/lib/site-config.json`)

## Kør lokalt

### Forudsætninger

- Node.js ≥ 22
- npm

### Udvikling

```bash
npm install
npm run dev
```

Åbn [http://localhost:5173](http://localhost:5173). Ingen database eller miljøvariabler er nødvendige.

## Scripts

| Script | Beskrivelse |
|--------|-------------|
| `npm run dev` | Udviklingsserver |
| `npm run build` | Statisk produktionsbuild (prerender til `build/`) |
| `npm run preview` | Forhåndsvis det byggede statiske site |
| `npm run check` | Svelte/TypeScript-typecheck |
| `npm run lint` | ESLint |
| `npm test` | Unit-tests (Vitest) |
| `npm run test:e2e` | E2E-tests (Playwright) |

## Miljøvariabler

Ingen. Siden er statisk, og alt indhold (inkl. kontaktoplysninger og bookinglink) ligger i
`src/lib/content.ts`.
