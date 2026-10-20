# Agent notes for nexitas

Conventions for working on nexitas, the core layer the apps extend.

## Code

- Keep comprehension debt low: explicit control flow, small modules, framework conventions, no
  speculative abstractions. Comments say why, not what.
- nexitas holds only what every app needs. Something one app needs stays in that app; it moves
  here once a second one needs it too.
- Modules plug in only through the interfaces in `shared/modules.ts`. Change them additively: the
  apps out there depend on them.
- Inside the layer, import by relative path: `~` and `#shared` resolve against the app that
  extends it. Modules reach the core through `#nexitas/...`.
- Data access is plain SQL in `server/core/*.ts`: functions that take the database first, no ORM.
  The core's schema changes are a new step in `core.migrations` (`server/core/database.ts`); never
  edit a released step.
- Privacy is the product of the apps on top. The core stores no IP address, user agent or
  identifier of anyone but the owner; the address is read in memory for the sign-in limit, and
  dropped.
- `/api/*` is the owner's (`server/middleware/security.ts`): their session, and for writes the
  app's exact origin. Only `/api/health` and the sign-in routes are open, matched exactly.

## UI

- Built only from aequitas: semantic HTML plus its classes, `data-*` variants and ARIA state.
  `app/assets/nexitas.css` holds only what aequitas lacks and every app shares, with tokens only.
- The look: one centred small column hanging from the top, compact density, square corners, no
  cards, panels or sidebar. Colour only reports state, always next to a word.
- Lint changed Vue files: `node ../aequitas/dist/aequitas-check.mjs --css app/assets/nexitas.css <files>`.

## Checks

`pnpm check`, `pnpm lint`, `pnpm format:check` and `pnpm build` must stay green.

## Commits and releases

Commit messages are [conventional](https://www.conventionalcommits.org):
`feat(auth): …`, `fix: …`, `docs(readme): …`. Give a scope or leave the parentheses out; never
write `feat(): …`. release-please can't parse an empty scope and silently drops the commit from
the next version and the changelog. Before 1.0, `feat` and `fix` bump the patch version and a
change marked `!` the minor. Mark a change that breaks the interfaces in `shared/modules.ts` with
`!` (`feat(modules)!: …`). Don't edit the version in `package.json` or `CHANGELOG.md` by hand; the
release PR does that.
