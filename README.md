# AS - Coaching, vaner og ro

En dansk, statisk hjemmeside for en coachingpraksis. Besøgende kan læse om forløbene,
finde praktiske oplysninger og vælge kontakt eller booking. Navigationen går til afsnit
på én sammenhængende side.

Kontaktformularen åbner den besøgendes egen mailapp med en udfyldt besked; hjemmesiden
sender ikke mail. Booking foregår hos en ekstern udbyder. Der er ingen database, login
eller backend, og en lokal forhåndsvisning opretter ikke en rigtig booking.

## Kør siden lokalt

Brug Git, Bash, Node.js 26 og npm 11, som repositoryets CI anvender. Andre npm-hovedversioner
afvises af `package.json`. Kør fra den mappe, hvor du vil have din kopi:

```sh
git clone https://github.com/devantler-tech/ascoachingogvaner.git
cd ascoachingogvaner
npm ci
npm run dev -- --host 127.0.0.1
```

Åbn den lokale adresse, Vite viser, normalt `http://127.0.0.1:5173/`. Du skal kunne se
forsiden og navigere til Services, Om mig og Kontakt. Ingen miljøvariabler, database
eller platformadgang er nødvendige. Stop serveren med Ctrl+C. Afprøv ikke kontakt
eller booking med rigtige personoplysninger, når du blot tester en ændring.

Fra repositoryets rod kan du også bygge og se det statiske resultat:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Et vellykket build lægger HTML og assets i `build/`. Åbn den viste preview-adresse, og
stop med Ctrl+C. Redigér ikke det genererede output. Lokal preview er ikke bevis for,
at en ny version er udgivet eller kører i produktion.

## Find den rigtige kilde

- `src/lib/content.ts` ejer sidens danske tekster, offentlige kontaktoplysninger og priser.
- `src/lib/site-config.json` ejer bookingadressen. Den importeres af indholdet og bruges
  til at generere nginx-konfigurationen; ret ikke en separat kopi af bookinglinket.
- `src/lib/components/` og `src/routes/` ejer præsentation og navigation.
- `static/` indeholder statiske assets; `tests/unit/` og `tests/e2e/` indeholder tests.

Siden er bygget med SvelteKit/Svelte, TypeScript og TailwindCSS og prerenderes med
`@sveltejs/adapter-static`. Produktion bruger nginx; konfigurationen findes i
`Dockerfile` og `docker/`. Deploy-konfigurationen i `deploy/` er operatørarbejde,
ikke en forudsætning for at starte lokalt.

## Bidrag og kvalitet

Start i [CONTRIBUTING.md](CONTRIBUTING.md) for en lille ændring, de nødvendige værktøjer,
lokale checks og krav til en PR. [AGENTS.md](AGENTS.md) er repositoryets kanoniske kontrakt.

Tilgængelighed og understøttelse af Safari 13.1 er eksisterende krav. Buildet tilpasser
både CSS-lag og JavaScript, og browsertests kontrollerer dem; et moderne browser-preview
alene beviser ikke kompatibilitet. De krav må ikke fjernes for at få et check til at bestå.

Release/CD-workflows og platformens reconciliation ejer udgivelse. Et merge er ikke et
bevis for live deployment, og almindelige bidrag kræver ikke udgivelsesrettigheder.

## Sikkerhed og genbrug

Følg organisationens [adfærdskodeks](https://github.com/devantler-tech/.github/blob/main/.github/CODE_OF_CONDUCT.md)
og [sikkerhedspolitik](https://github.com/devantler-tech/.github/blob/main/.github/SECURITY.md).
Brug en privat rapporteringsvej til sårbarheder; hvis den mangler, bed om en privat kanal
uden at offentliggøre de følsomme oplysninger. Del ikke kundehenvendelser, persondata
eller credentials i issues, PRs eller eksempler.

Repositoryet har ingen licens, der giver fri genbrug af applikationens kildekode, tekster
eller billeder. Offentlig kildekode og dependency-licenser giver ikke i sig selv den tilladelse.
