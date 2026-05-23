# AS Coaching og Vaner

Marketing- og bookingside for **AS Coaching og Vaner** — personlig coaching i stress, angst,
vaner og overspisning. Besøgende kan læse om ydelserne, sende en kontaktbesked og bestille tid
(inkl. en gratis startsamtale). Indkomne bookinger og henvendelser ses i et adminoverblik.

Deployes som tenant på [devantler-tech/platform](https://github.com/devantler-tech/platform)
via en OCI-pakket Kustomize-konfiguration (`deploy/`).

## Features

- **Forside** — hero, fokusområder, services-overblik og gratis startsamtale
- **Services** — fire forløb (stress, angst, vaner, overspisning) med priser og rater
- **Om mig** — præsentation af coachen (pladsholdertekst indtil endeligt indhold)
- **Kontakt** — kontaktformular der sender en e-mailnotifikation
- **Book tid** — booking-forespørgsel der gemmes og sender en e-mailnotifikation
- **Admin** — adgangskodebeskyttet overblik over bookinger og henvendelser

## Tech stack

- [SvelteKit](https://kit.svelte.dev) + TypeScript
- [TailwindCSS v4](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- [Nodemailer](https://nodemailer.com) til e-mailnotifikationer (best-effort)
- [Playwright](https://playwright.dev) til E2E-tests
- Deployes til Kubernetes via [CloudNativePG](https://cloudnative-pg.io) + [Longhorn](https://longhorn.io)

## Kør lokalt

### Forudsætninger

- Node.js ≥ 22
- npm

### Udvikling (uden database)

Sæt `DEV_SKIP_AUTH=true` for at køre uden PostgreSQL. Booking- og kontaktformularer returnerer
mock-svar og gemmer ikke data, og admin-overblikket viser eksempeldata.

```bash
npm install
DEV_SKIP_AUTH=true npm run dev
```

Åbn [http://localhost:5173](http://localhost:5173). Admin findes på `/admin` (login `/login`,
brug koden `ADMIN` i dev-mode).

### Udvikling (med database)

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/ascoaching"
npm run db:migrate
npm run dev
```

## Scripts

| Script | Beskrivelse |
|--------|-------------|
| `npm run dev` | Udviklingsserver |
| `npm run build` | Produktionsbuild (adapter-node) |
| `npm run check` | Svelte/TypeScript-typecheck |
| `npm run lint` | ESLint |
| `npm test` | Unit-tests (Vitest) |
| `npm run test:e2e` | E2E-tests (Playwright) |
| `npm run db:generate` | Generér Drizzle-migration ud fra schema |
| `npm run db:migrate` | Kør migrationer |

## Miljøvariabler

| Variabel | Krævet | Beskrivelse |
|----------|--------|-------------|
| `DATABASE_URL` | prod | PostgreSQL-forbindelse (leveres af CNPG) |
| `ADMIN_CODE` | prod | Adgangskode til admin-overblikket |
| `NOTIFY_EMAIL` | nej | Modtager af booking-/kontaktnotifikationer |
| `SMTP_HOST` / `SMTP_PORT` | nej | SMTP-server til notifikationer |
| `SMTP_USER` / `SMTP_PASS` | nej | SMTP-login |
| `SMTP_FROM` | nej | Afsenderadresse |
| `DEV_SKIP_AUTH` | nej | Sæt `true` for at køre uden DB/auth (kun udvikling/test) |
