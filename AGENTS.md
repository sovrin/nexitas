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
  `useProjectFetch()`, the page kit (see UI), `<FormIssues>`, `<EmbedCode>`, `<CopyButton>`,
  `<ModuleLabel>`, `<StatusItems>`; and every count, day, time and age through
  `#nexitas/app/lib/format` (`plural`, `formatCount`, `formatAge`, `formatTime`, `formatDay`,
  `formatDelta`, `errorMessage`), never a module's own `Intl` or `toLocaleString`.
- A module's server parts: a Nitro plugin that calls `registerModule(...)`, the module in
  `server/core/module.ts`, a `server/utils/<module>.ts` with its `route<Thing>(event)` helpers (the
  thing or a 404, scoped by the request's project), and `projectActivity` for what happened since
  the owner last looked, which the project's overview tells as one story. Its `paths` name every
  prefix it serves:
  pages, `/api/...` and its `/v1/...` routes.

## UI

- Built only from aequitas: semantic HTML plus its classes, `data-*` variants and ARIA state.
  `app/assets/nexitas.css` holds only what aequitas lacks and every app shares, with tokens only.
- The look is a console, dark first (the owner can switch): aequitas' `.shell`, compact density,
  square corners. The sidebar (`AppSidebar`) is the open project's switcher, its overview, each
  module's section with its icon in the module's hue and the one reading it gives (a
  `StatusItem.figure`), the install's pages, then theme, version and sign-out; a rail under
  64rem, a row on a phone. ⌘K (`CommandPalette`) reaches every project, module and command.
  Panes divide by hairline seams, never by shadow or cards; glass only where something floats
  (menus, dialogs, the palette).
- Colour: the core is graphite; each module names an aequitas accent preset in app.config
  (`accent`), and its section, panel and sidebar entry take that hue. State tones (success,
  warning, danger) stay separate from the hue and always sit beside a word.
- Pages are built from the core's page kit (app/components), never from the markup it draws, so
  every module looks alike and changes with the core. `node scripts/drift.ts` (in `pnpm lint`)
  fails on a hand-built header, breadcrumb, alert (`.alert`, `role="alert"`), table (`<table>`,
  its frame), dot, aside, section heading (`.eyebrow` on a heading), `h1`, `style=""`, a bound
  `:style` that sets more than custom properties (`'--depth'`), or a project fetch outside
  `useProjectFetch`. What a module needs drawn that the kit
  lacks is added to the kit, not to the module.
  - `<AppPage title failed :error :retry :trail>` frames every page as a pane: its header line
    (the trail from the module's section, the title, the `subtitle` as state, the `actions`),
    `filters` for a list's `<FilterLinks>` and `<SearchBox>` under it, the load error with "Try
    again", an `aside` that opens the inspector pane beside it (the item in hand, or the page's
    settings), and `danger` for what cannot be undone, alone at the inspector's foot or the
    page's. It sets the module's hue and the tab's title.
  - The inspector's header names what it holds: `aside-title` a label for settings ("Delivery"),
    `aside-name` the item in hand by its own name (`aside-mono` when it is an identifier, a key or
    a slug). Nothing under the header repeats the name.
  - A list and its item: the list stays in the pane and the item opens in the inspector, so the
    item's page renders the list too (`/feedback/<id>` is the inbox with that entry beside it).
  - `useProjectFetch('/feedback')` reads the project's API and keeps the page live (`live: false`
    for a form a refresh would reset).
  - `<AppLead title>` opens the project's overview and every module's first page: what needs the
    owner as one sentence, a muted line of context, then a state row. In AppPage's `lead` slot it
    stands above the `filters`.
  - Counts: the lead's headline says what needs the owner; the filters carry the counts. The
    lead's meta line and section headings don't repeat them.
  - `<AppSection title>` for a named part, `<DataTable>` for a table (ids, keys, origins, values
    mono), `<StateDot tone>word</StateDot>` for a state, `<AppAlert title tone>` for a message,
    `<EmptyState>` for nothing to show, `<PagerNav>` and `<SearchBox>` for long lists.
  - Forms: `useSubmit()`, inputs `data-size="s"`, a field's error as `<span data-error>`,
    `<FormIssues>` above a `div.cluster.gap-3.hairline-t.pt-5` with the `btn end` primary. At
    most one primary per view.
  - A one-click write (a status button, a switch) is `disabled` and `aria-busy` while it runs.
    After an action that removes the focused element, focus moves to the next sensible control
    (the next row, else the list).
  - `<DangerAction>` for what cannot be undone (`confirm-word` when it takes much with it),
    in AppPage's `danger` slot beside one line on what it removes; never next to a primary. The
    dialog only adds what that line doesn't say ("This cannot be undone."), never repeats it.
    `pending` while it runs; its error is an `<AppAlert>` in the `danger` slot beside the button,
    not at the top of the pane.
  - A panel on a project's overview is setup only (set small by the page, never by itself): its
    snippet, a link to its settings, or `<PanelStart>` while it does nothing for the project. No
    counts, status lines or StateDots: the overview's "Modules now" row and the sidebar's figure
    tell the module's state.
  - `<AsideLayout>` for a component that needs a column beside it (a form's live preview).
  - A module's own stylesheet only for what it alone draws (a chart).
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
