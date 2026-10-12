# Bidrag til AS - Coaching, vaner og ro

En god første opgave er en præcis tekstkorrektion, et defekt link, en tilgængelighedsforbedring
eller en lille test. Beskriv større ændringer i et
[issue](https://github.com/devantler-tech/ascoachingogvaner/issues) først, så omfanget kan afklares.
Følg det fælles [adfærdskodeks](https://github.com/devantler-tech/.github/blob/main/.github/CODE_OF_CONDUCT.md).

Skriv ikke sårbarheder, kundehenvendelser, persondata, credentials eller private driftsoplysninger
i offentlige issues, PRs eller commits. Følg
[sikkerhedspolitikken](https://github.com/devantler-tech/.github/blob/main/.github/SECURITY.md).
Hvis privat rapportering ikke er tilgængelig, bed om en privat kanal uden de følsomme detaljer
og vent med at dele dem.

## Lav din egen kopi

Brug Git, Bash, Node.js 26, npm 11, `jq` og Mike Farahs `yq` v4. JSON/YAML-værktøjerne
bruges af de lokale workflow-fixtures; andre programmer med navnet `yq` er ikke udskiftelige.
Der kræves ingen database, produktionscredentials eller Kubernetes-adgang.

Fork repositoryet på GitHub. Erstat `YOUR-GITHUB-LOGIN` med dit eget login, og kør fra
den mappe, hvor du vil have din kopi:

```sh
git clone https://github.com/YOUR-GITHUB-LOGIN/ascoachingogvaner.git
cd ascoachingogvaner
git switch -c docs/my-first-change
npm ci
```

Læs [AGENTS.md](AGENTS.md) før redigering. Arbejder en anden session allerede i repositoryet,
så brug en separat kopi eller isoleret worktree; kassér ikke andres ændringer. Brug npm 11
og package manageren til bevidste dependency-ændringer, ikke håndredigering af lockfilen.

## Lav én fokuseret ændring

Ret eksempelvis en kort formulering i `src/lib/content.ts`, og behold sidens danske sprog
og design. Opfind ikke priser, certificeringer, behandlingsløfter eller kunderesultater.
Bookingadressen ejes af `src/lib/site-config.json`, som også styrer den genererede
nginx-redirect. Komponenter og routes ejer layoutet; unit- og browsertests ligger under `tests/`.

Følg [README'ens lokale preview](README.md#kør-siden-lokalt), besøg det berørte afsnit,
og stop serveren med Ctrl+C. Kontakt åbner en mailapp, og booking peger ud af sitet;
send ikke en rigtig mail eller booking som dokumentationstest. Brug kun opdigtede
oplysninger, hvis en test kræver input, og lad eksterne links være uaktiverede.

Redigér ikke `build/`, `.svelte-kit/` eller genereret nginx-output. Bevar Safari 13.1-
kravene til både CSS og JavaScript samt accessibility-tests; slet eller svæk ikke et check
for at få en ændring igennem.

## Kontroller fra repositoryets rod

Efter `npm ci`:

```sh
npm run lint
npm run check
npm test
```

ESLint og typecheck skal afslutte uden fejl, og Vitest-tests skal bestå. Browsertests
kræver desuden Playwrights Chromium-download:

```sh
npx playwright install chromium
CI=true npm run test:e2e
```

Downloadet lægger browseren i Playwrights cache. Linux kan også kræve browserens
OS-dependencies; CI installerer dem på sin disposable runner. Ændr ikke værtsmaskinens
indstillinger uden aftale. Stop dit eget preview først, og kontroller, at port 4173 er ledig.
`CI=true` forhindrer genbrug af en uvedkommende server. Playwright bygger og starter
sit eget preview, afprøver browsertests og stopper det igen. Tests dækker blandt andet
tilgængelighed, sikkerhed, kontakt-/bookinglinks og den eksisterende browserkompatibilitet.

Byg også eksplicit og kør performance-lanen:

```sh
npm run build
npm run test:perf
```

Buildet skal oprette `build/`. Lighthouse kræver en installeret Chrome/Chromium, som dens
browser-opslag kan finde; Playwrights download er ikke automatisk samme forudsætning.
Ved en ikke-standard sti bruges Lighthouse CI's dokumenterede
[`collect.chromePath`](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md#chromepath)
uden at ændre repositoryets budgets. Rapporterne skrives lokalt i `.lighthouseci/`.
Budgetoverskridelser er aktuelt advarsler, men infrastrukturen skal fungere: Lighthouse-jobbet
indgår i `CI - Required Checks`. Det er altså ikke en valgfri lane som i andre apps.

Kør også de lokale wiring-fixtures:

```sh
bash scripts/retired-repo-links.test.sh
sh scripts/workflow-caller-pin-contract.test.sh
sh scripts/homepage-group.test.sh
sh scripts/npm-toolchain.test.sh
sh scripts/publish-pin-approved.test.sh
git diff --check
```

Alle kommandoer skal afslutte med status 0. Retired-link-fixturen kontrollerer lokal wiring;
CI kører også den udgivne validator mod ren dokumentation, et ugyldigt link og manglende
konfiguration. CI bygger desuden den rigtige Docker-container og kontrollerer både en
tilgængelig forside og booking-redirect. Docker kræves ikke for den første tekstændring;
lokale fixtures er ikke bevis for den container eller en live deployment.

Notér manglende værktøjer eller utilgængelige checks ærligt. Brug ikke udgivelsesadgang
eller en produktionsplatform for at omgå et lokalt problem.

## Bevar de tilpassede guides

Tenantens `.templatesyncignore` beskytter README, CONTRIBUTING og de øvrige deklarerede
egne filer mod senere template-sync. En ny ownership-entry skal være merged **før** et
efterfølgende sync starter; en entry i selve det genererede forslag kan ikke beskytte
den kørsel. Ved et allerede åbent forslag gendannes den tilpassede guide før merge.
Ændr ikke genererede sync-filer eller delte workflow-pins i hånden; følg deres owning source.

## Indsend en draft PR

Opsæt commit-signering. Stage kun de filer, du bevidst har ændret, og lav en signeret commit.
Ved en ændring af README alene kan det være:

```sh
git add README.md
git commit -S -m "docs: clarify the local website preview"
```

Push til dit fork og åbn en **draft PR** mod `main` med GitHubs angivne template.
Brug en Conventional Commit-titel, forklar problemet og resultatet for læseren, og link
til issuet. Beskriv de checks og brugerforløb, der faktisk blev afprøvet, med fejl og
begrænsninger adskilt fra deployment. Oplys brug af AI; Agentic Engineer-artifacts følger
repositoryets disclosure-konvention.

Svar på reviewfeedback med evidens for det aktuelle head. Promotion og squash merge kræver
repositoryets fulde review-/CI-gates; omgå dem ikke, og bed ikke om Copilot-review.
Denne guide giver ingen ny licens, platformadgang eller tilladelse til live udgivelse.
