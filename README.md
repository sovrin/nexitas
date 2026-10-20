# nexitas

A self-hosted app that tells you about your own sites and apps: what people say about them, how
they are used, and soon what breaks in them. One install, one owner, one database, on your own
server. What it does comes from modules, each switched on only if you want it.

You add each of your sites once, as a **project**: its name and the origins its pages are served
from. Every module works on those projects, so a site that collects feedback has its usage counts
a click away, and the overview shows what changed on each, at a glance.

## Modules

| Module                                         | Shown as | What it does                                                         |
| ---------------------------------------------- | -------- | -------------------------------------------------------------------- |
| [collatas](https://github.com/sovrin/collatas) | Feedback | an embeddable feedback form per project, and one inbox for all       |
| [censitas](https://github.com/sovrin/censitas) | Usage    | named events counted per day; nothing that tells visitors apart      |
| [veritas](https://github.com/sovrin/veritas)   | Content  | collections and entries per project, delivered to your sites as JSON |
| erratas (planned)                              | Errors   | what breaks in your sites                                            |

Every module in the build is off until you switch it on: at setup, or later under Modules. Off, a
module runs nothing and answers nothing (its pages and routes are 404, its hourly work stops, the
shell leaves it out), and switching it off keeps its data. An install without tracking never
counts a thing.

## Run it

Node 24+ and pnpm 11. aequitas is not published yet: check it out next to this repository and
build it once (`cd ../aequitas && pnpm install && pnpm build`). Then fetch the modules before the
install, which prepares the app with them:

```bash
node scripts/modules.ts
pnpm install
pnpm dev
```

It runs with plain Node, not as a pnpm script: pnpm would install first, and the install needs
the modules there.

Open http://localhost:3000 and create the owner with the installation key from
`.data/bootstrap-token`, choosing the modules to switch on.

### With Docker Compose

Copy `.env.example` to `.env`, set `NEXITAS_BOOTSTRAP_TOKEN` (`openssl rand -hex 32`) and the
public address, `NEXITAS_ORIGIN=https://nexitas.example.com`. Then:

```bash
docker compose up -d --build
```

The image fetches the modules `modules.json` names itself, so local checkouts never reach it. The
web service listens on `127.0.0.1:3000` (`NEXITAS_BIND`); data lives in the `nexitas-data` volume
(`nexitas.sqlite`), so back it up and never `docker compose down -v`. The image runs as an
unprivileged user on Alpine with only the node binary.

TLS and the public address belong to your reverse proxy: put it, or the network it shares, in an
untracked `compose.override.yaml`. The proxy must append the caller's address to
`X-Forwarded-For`: the rate limits count senders by its last entry, and keep addresses only in
memory or as a keyed hash. Keep it from logging the modules' public routes (`/v1/…`), or it stores
the addresses nexitas drops. With Caddy, which logs nothing unless told to:

```
nexitas.example.com {
	reverse_proxy 127.0.0.1:3000
	header Strict-Transport-Security "max-age=31536000"
}
```

Put nothing else (a CDN) in front of the proxy without changing how the sender is read.

### Settings

| Variable                  | What it is                                                             |
| ------------------------- | ---------------------------------------------------------------------- |
| `NEXITAS_DATA_DIR`        | where the database lives, as `nexitas.sqlite`                          |
| `NEXITAS_ORIGIN`          | the address the app is opened at; changes are only accepted from there |
| `NEXITAS_BOOTSTRAP_TOKEN` | the installation key that protects the first setup                     |
| `COLLATAS_WEBHOOK_URL`    | collatas: a URL that gets every new feedback as JSON (see its README)  |

Forgot the password? `pnpm owner:reset --confirm` (with `NEXITAS_DATA_DIR` pointing at
the data) removes the owner and every session, keeps everything else, and lets you set up again
with the installation key.

## How it is built

nexitas holds what every module needs:

- **The owner**: one account, set up once with an installation key, signed in with a session
  cookie. Passwords are hashed with scrypt, sessions are stored only as hashes, and sign-in
  attempts are limited in memory, so no address is kept.
- **Projects**: id, name and origins. A module keeps its own settings per project and asks the core
  whether an origin belongs to it (`projectAllows`).
- **The switches**: which modules are on. The core runs only those: their migrations, routes,
  hourly work and parts of the shell.
- **The guard**: `/api/*` needs the owner's session, and writes need the app's exact origin. Only
  `/api/health` and the sign-in routes are open. A module's public routes are open on purpose,
  each with its own guard.
- **Live updates**: one server-sent event stream per tab (`/api/events`). Whatever changes what the
  pages show calls `announceChange()`, or announces through a `pacedAnnouncer()` when it can come
  all the time; every view that shows data passes its refresh to `useLive`.
- **The database**: one SQLite file through `node:sqlite`, with the core's tables and those of every
  module switched on. Each module has its own schema version, so modules grow on their own.
- **The shell**: built from [aequitas](../aequitas): the page layout, the nav, the status line under
  every page, the sign-in and setup pages, the projects and Modules pages, `ConfirmDialog`,
  `EmbedCode` and the theme switch.

### The modules in a build

`modules.json` names every module the build includes, each with the version it is built from:

```json
{ "collatas": "github:sovrin/collatas#master", "censitas": "github:sovrin/censitas#master" }
```

`node scripts/modules.ts` fills the untracked `.modules/` with them, a shallow clone each, with its packages
installed. The build extends exactly what `modules.json` names, from `.modules/`; a missing one
stops it. The list is written out, never discovered, so what ships is what the manifest names.
It also links `.modules/nexitas/.nuxt` to nexitas' `.nuxt`, so a module's `tsconfig.json`, which
finds nexitas' types at `../nexitas/.nuxt` as in a checkout next to nexitas, works there too.
To work on a module, make its folder a symlink to your checkout; `node scripts/modules.ts` leaves it as it is:

```bash
ln -s ../../collatas .modules/collatas
```

### Writing a module

A module is a Nuxt layer that nexitas extends; it does not extend nexitas itself and has no app of
its own. It brings its pages under a path of its own, its API under `/api/<its things>`, and
nothing that belongs to the whole app: no name, logo, favicon or sign-in lines. It joins with a
line in `modules.json`.

The server half is a `NexitasModule`, registered from a Nitro plugin:

```ts
// server/plugins/censitas.ts
import { registerModule } from '#nexitas/server/utils/nexitas'

export default defineNitroPlugin(() =>
  registerModule({
    id: 'censitas',
    migrations: [
      'CREATE TABLE sites (id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id), …)',
    ],
    publicRoutes: [{ path: '/v1/e', maxBody: 4 * 1024, json: true }],
    paths: ['/sites', '/api/sites'],
    status: (db) => [{ text: `${countToday(db)} events today`, to: '/sites', tone: 'success' }],
    projectStatus: (db, projectId) => [{ text: `${countToday(db, projectId)} today` }],
    deleteProject: (db, projectId) => deleteSiteOf(db, projectId),
  }),
)
```

- **`migrations`**: schema steps, oldest first. Never edit a released step; add one. The core's
  run first, so a module's may refer to `projects`.
- **`publicRoutes`**: routes outside `/api` that anyone may call, each with its body limit and an
  optional `guard` for origins and CORS (`projectAllows`).
- **`paths`**: every prefix it serves, pages and `/api` alike, so they answer 404 while it is off.
  Its static files (a script in `public/`) still load, but find nothing to call.
- **`hourly`**: work such as a cleanup, run at start and every hour while it is on. A module keeps
  no timers of its own.
- **`status`**: what the module adds to the status line under every page.
- **`projectStatus`** and **`deleteProject`**: its line about one project, and removing what it
  keeps for one, in the core's transaction.

The page half goes into `app/app.config.ts`:

```ts
export default defineAppConfig({
  nexitas: {
    modules: [
      {
        id: 'censitas',
        label: 'Usage',
        description: 'How your sites are used: event counts, nothing about visitors.',
        icon: 'bar-chart',
        panel: 'CensitasProject',
      },
    ],
    nav: [{ to: '/sites', label: 'Usage', module: 'censitas' }],
  },
})
```

The entry in `modules` is how the shell tells the modules apart: every line a module reports, on
the overview, the status line and the project page, stands under its label and icon, and its nav
entry carries the icon. The description stands beside its switch at setup and under Modules.
Give each module an aequitas icon no other module uses. The panel is a component in the module's
`app/components/global/`, given the project as `project`; the shell puts the label above it.
Server code reaches the core through `#nexitas/server/...`, the pages through the auto-imported
composables.

## Checks

```bash
pnpm check         # typecheck of the app with every module, and the core's unit tests
pnpm lint
pnpm format:check
pnpm build
node ../aequitas/dist/aequitas-check.mjs --css app/assets/nexitas.css app/**/*.vue
```
