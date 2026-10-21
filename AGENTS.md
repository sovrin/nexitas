# Agent notes for nexitas

Conventions for working on nexitas, the app the modules (censitas, collatas, erratas, veritas,
linguitas, and more to come) plug into. They hold for every module too: a module's own AGENTS.md
adds only what is its own, and points here for the rest.

## Code

- Keep comprehension debt low: explicit control flow, small modules, framework conventions, no
  speculative abstractions. Comments say why, not what.
- nexitas holds only what every module needs (the owner, projects, the shell). Something one
  module needs stays in that module; it moves here once a second one needs it too.
- Modules are layers nexitas extends, named in `modules.json` and fetched into `.modules/` by
  `node scripts/modules.ts`, never discovered. Every install switches on the ones it uses. They plug in only
  through the interfaces in `shared/modules.ts`; change those additively, the modules depend on
  them.
- A project holds everything. A module's pages are in `app/pages/p/[project]/` and read it with
  `useProject()`; its API is in `server/api/p/[project]/` and reads it with `requestProject(event)`,
  which the core resolves (or 404s) once. Never a `?project=` query, never another id standing in
  for the project; every query, one item's included, is scoped by it. Nothing spans projects but
  the Projects page.
- Import by relative path, here and in the modules: in a layer, `~` and `#shared` resolve against
  the app. Modules reach the core through `#nexitas/...`.
- Data access is plain SQL in `server/core/*.ts`: functions that take the database first, no ORM.
  The core's schema changes are a new step in `core.migrations` (`server/core/database.ts`); never
  edit a released step. The core's steps run before the modules', which may refer to `projects`.
- Privacy is the product of the apps on top. The core stores no IP address, user agent or
  identifier of anyone but the owner; the address is read in memory for the sign-in limit, and
  dropped.
- `/api/*` is the owner's (`server/middleware/security.ts`): their session, and for writes the
  app's exact origin. Only `/api/health` and the sign-in routes are open, matched exactly.

## What the core gives a module

Use these; don't write a module's own. Something two modules write alike belongs on this list.

- Server, through `#nexitas/server/...`: `requestProject(event)` (`utils/projects`);
  `nexitasDatabase()`, `nexitasEnv(name)`, `requestSender(event)` (`utils/nexitas`);
  `announceChange()`, `pacedAnnouncer(ms)` (`utils/changes`); `invalid(zodError | issues)`
  (`utils/invalid`); `projectCors` and `readOnlyCors` as a public route's guard (`utils/cors`);
  `requireBearer(event, token)` (`utils/auth`); `newToken(prefix)`, `tokensMatch` (`core/auth`);
  `transaction(db, fn)` (`core/database`); `projectAllows`, `getProject` (`core/projects`);
  `createLimiter`, `senderNetwork` (`core/limits`).
- Pages: `useProject()`, `useLive(refresh)`, `useModules()`, `useSubmit()` (auto-imported);
  `<ConfirmDialog>` (`confirm-word` for what takes much with it), `<FormIssues>`, `<EmbedCode>`,
  `<CopyButton>`, `<ModuleLabel>`, `<StatusItems>`; and every count, day, time and age through
  `#nexitas/app/lib/format` (`plural`, `formatCount`, `formatAge`, `formatTime`, `formatDay`,
  `formatDelta`, `errorMessage`), never a module's own `Intl` or `toLocaleString`.
- A module's server parts: a Nitro plugin that calls `registerModule(...)`, the module in
  `server/core/module.ts`, a `server/utils/<module>.ts` with its `route<Thing>(event)` helpers (the
  thing or a 404, scoped by the request's project). Its `paths` name every prefix it serves:
  pages, `/api/...` and its `/v1/...` routes.

## UI

- Built only from aequitas: semantic HTML plus its classes, `data-*` variants and ARIA state.
  `app/assets/nexitas.css` holds only what aequitas lacks and every app shares, with tokens only.
- The look: aequitas' own defaults (density and type included), the page in aequitas'
  `.container`: a navbar on top, the page, a status bar at the bottom. No cards, panels or
  sidebar. Colour only reports state, always next to a word.
- One pattern per thing, in every module:
  - Page: `.page-header` with an `h1.text-xl.weight-600` (a subtitle beside it in a
    `div.stack.gap-1.min-w-0`, as `p.text-s.text-muted`) and the actions in a `.cluster`, at most
    one primary. A module's first page is titled by its section's label ("Inbox", "Content"),
    without a breadcrumb; pages below it have one that starts there. `useHead` titles read
    `<page> · <project id>`; app.vue adds the app's name.
  - State is a `.dot` with `data-tone` before its word: no `.badge` or toned text for it, and never
    the colour alone.
  - Loading failed: `.alert[data-tone=danger][role=alert]` with `<strong>Could not …</strong>` and
    the `errorMessage`; a list adds a "Try again" button. Empty: `p.text-muted` (`text-s` inside a
    project's panel).
  - Tables: `div.table-scroll > table.table[data-size=s]`; ids, keys, origins, values mono.
  - Forms: `useSubmit()`, inputs `data-size="s"`, a field's error as `<span data-error>`,
    `<FormIssues>` above a `div.cluster.gap-3.hairline-t.pt-5` with the `btn end` primary.
  - Delete: a ghost danger button, then `<ConfirmDialog tone="danger">`.
  - No `style=""`; a module's own stylesheet only for what it alone draws (a chart).
  - A static page beside a `[param]` page is named with a leading underscore: `_new.vue`.
- Lint changed Vue files: `node ../aequitas/dist/aequitas-check.mjs --css app/assets/nexitas.css <files>`.

## Checks

`pnpm check`, `pnpm lint`, `pnpm format:check` and `pnpm build` must stay green, with the modules in
`.modules/` (`node scripts/modules.ts`).

## Commits and releases

Commit messages are [conventional](https://www.conventionalcommits.org):
`feat(auth): …`, `fix: …`, `docs(readme): …`. Give a scope or leave the parentheses out; never
write `feat(): …`. release-please can't parse an empty scope and silently drops the commit from
the next version and the changelog. Before 1.0, `feat` and `fix` bump the patch version and a
change marked `!` the minor. Mark a change that breaks the interfaces in `shared/modules.ts` with
`!` (`feat(modules)!: …`). Don't edit the version in `package.json` or `CHANGELOG.md` by hand; the
release PR does that.
