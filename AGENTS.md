# Agent notes for nexitas

Conventions for working on nexitas, the app the modules (collatas, censitas) plug into.

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

## UI

- Built only from aequitas: semantic HTML plus its classes, `data-*` variants and ARIA state.
  `app/assets/nexitas.css` holds only what aequitas lacks and every app shares, with tokens only.
- The look: aequitas' own defaults (density and type included), the page in aequitas'
  `.container`: a navbar on top, the page, a status bar at the bottom. No cards, panels or
  sidebar. Colour only reports state, always next to a word.
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
