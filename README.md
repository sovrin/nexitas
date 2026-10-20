# nexitas

The common core of a family of small self-hosted apps: censitas (usage counts), collatas (feedback)
and what follows. It is a Nuxt layer. An app extends it and gets the owner's sign-in, the `/api`
guard, live updates, the database and the page shell; it adds only what it is about. The
interfaces in `shared/modules.ts` are how a module plugs into the core, so several modules can
later run in one app and show their data side by side.

## What the core owns

- **The owner**: one account, set up once with an installation key, signed in with a session
  cookie. Passwords are hashed with scrypt, sessions are stored only as hashes, and sign-in
  attempts are limited in memory, so no address is kept.
- **The guard**: `/api/*` needs the owner's session, and writes need the app's exact origin. Only
  `/api/health` and the sign-in routes are open. A module's public routes are open on purpose,
  each with its own guard.
- **Live updates**: one server-sent event stream per tab (`/api/events`). Whatever changes what the
  pages show calls `announceChange()`, or announces through a `pacedAnnouncer()` when it can come
  all the time; every view that shows data passes its refresh to `useLive`.
- **The database**: one SQLite file per app, with the core's tables and every module's. Each module
  has its own schema version, so modules grow on their own.
- **The shell**: built from [aequitas](../aequitas): the page layout, the nav, the status line under
  every page, the sign-in and setup pages, `ConfirmDialog` and the theme switch.

## Using it

An app extends the layer from a sibling checkout, as it consumes aequitas:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [process.env.NEXITAS_DIR ?? '../nexitas'],
  runtimeConfig: { public: { nexitas: { name: 'censitas' } } },
})
```

The name is shown in the shell and is the prefix of the app's environment variables:

| Variable                 | What it is                                                                  |
| ------------------------ | --------------------------------------------------------------------------- |
| `<NAME>_DATA_DIR`        | where the database lives, as `<name>.sqlite`                                |
| `<NAME>_ORIGIN`          | the address the app is opened at; writes to `/api` must come from it        |
| `<NAME>_BOOTSTRAP_TOKEN` | the installation key that protects the first setup (`openssl rand -hex 32`) |

Its scripts run the core's:

```json
"dev": "node --env-file-if-exists=.env --import tsx ../nexitas/scripts/dev.ts censitas 3100",
"owner:reset": "node --env-file-if-exists=.env --import tsx ../nexitas/scripts/reset-owner.ts censitas"
```

## Writing a module

The server half is a `NexitasModule`, registered from a Nitro plugin:

```ts
// server/plugins/censitas.ts
import { registerModule } from '#nexitas/server/utils/nexitas'

export default defineNitroPlugin(() =>
  registerModule({
    id: 'censitas',
    migrations: ['CREATE TABLE counts (…)', 'CREATE TABLE sites (…)'],
    publicRoutes: [{ path: '/v1/e', maxBody: 4 * 1024, json: true }],
    status: (db) => [{ text: `${countToday(db)} events today`, tone: 'success' }],
  }),
)
```

- **`migrations`**: schema steps, oldest first. Never edit a released step; add one. An app that
  kept its schema in `PRAGMA user_version` before it moved onto nexitas sets
  `adoptsUserVersion: true`, and its steps continue from there.
- **`publicRoutes`**: routes outside `/api` that anyone may call, each with its body limit and an
  optional `guard` for origins and CORS.
- **`status`**: what the module adds to the status line under every page.

The page half goes into `app/app.config.ts`:

```ts
export default defineAppConfig({
  nexitas: {
    nav: [{ to: '/', label: 'Sites', paths: ['/sites'] }],
    text: {
      setup: 'Create the owner account. What every site you add counts arrives here.',
      signIn: 'Sign in to see how your sites are used.',
      promise: 'One owner. Your server. The counts stay on it.',
    },
  },
})
```

Its own `LogoMark.vue` and `public/favicon.svg` replace the core's. Everything else (pages, API
routes, components) joins the app as in any Nuxt layer. Server code reaches the core through
`#nexitas/server/...`, the pages through the auto-imported composables.

## Development

Node 24+ and pnpm 11. aequitas is not published yet: check it out next to this repository and
build it first (`pnpm install && pnpm build` in `../aequitas`).

```bash
pnpm install
pnpm dev
```

Run on its own, nexitas is the shell with no module: sign-in, setup and an empty home page.
