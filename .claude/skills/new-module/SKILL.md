---
name: new-module
description: Create a new nexitas module, or port a standalone app into one - the layer's files, its registration, project scoping, public routes, pages in the suite's patterns, and wiring it into modules.json. Use for "add a module", "new module", "port X into nexitas", "make X a module".
---

# A new nexitas module

Read nexitas/AGENTS.md first; it holds every rule this follows. The closest existing modules to
copy from: **veritas** or **linguitas** (owner-edited data delivered by a token-guarded read API),
**collatas** (a public form other sites embed), **censitas** (beacons from other sites, counted),
**erratas** (reports from browsers and servers, with a key). Name it with the nominitas skill if
it has no name (Latin, ending in -tas).

## Files

In `../<name>/`, a Nuxt layer:

- `nuxt.config.ts`: `compatibilityDate` as the others, `vite.server.fs.allow: [root]`; for a
  public script, the `build:before` hook and the `routeRules` entry as censitas has them.
- `package.json`, `tsconfig.json`, `vitest.config.ts`, `oxlint.config.ts`, `oxfmt.config.ts`,
  `pnpm-workspace.yaml`, `.github/workflows/`: copied from veritas, names changed. Only the
  devDependencies a script uses.
- `server/core/module.ts`: the `NexitasModule` (id, migrations, publicRoutes with a guard from
  `#nexitas/server/utils/cors`, `paths` naming every prefix it serves, `projectStatus`,
  `deleteProject`, `hourly` if it prunes). Tables reference `projects(id)`; every row is a
  project's.
- `server/plugins/<name>.ts`: `export default defineNitroPlugin(() => registerModule(<name>))`.
- `server/core/*.ts`: plain SQL, db first. `server/utils/<name>.ts`: `route<Thing>(event)` helpers,
  scoped by `requestProject(event)`.
- `server/api/p/[project]/<section>/…`: the owner's API. `server/routes/v1/…`: public routes.
- `shared/contracts.ts`: its zod schemas and types.
- `app/app.config.ts`: `nexitas.modules` (id, label, description, an icon no other module uses,
  panel) and `nexitas.nav` (`to: '/<section>'`, `module`).
- `app/components/global/<Name>Project.vue`: its panel on a project's page, `text-s` sized.
- `app/pages/p/[project]/<section>/index.vue` and below, built only from the core's page kit
  (`<AppPage>` and the rest, `useProjectFetch`), its other components and `#nexitas/app/lib/format`;
  `node scripts/drift.ts` in nexitas must stay quiet. What the kit lacks is added to the kit.
- `AGENTS.md`: only what is this module's own, and a pointer to ../nexitas/AGENTS.md.
  `README.md`: what it stores and why, and its public API.

## Wiring

1. `ln -s ../../<name> .modules/<name>` in nexitas, and add it to `modules.json` as
   `"github:sovrin/<name>#master"` once the repo exists.
2. In nexitas: `pnpm check && pnpm lint && pnpm format:check && pnpm build`.
3. Run it (`pnpm dev`), switch it on under Modules, and walk through it with a project.
4. Have the `module-auditor` and `ui-reviewer` agents look at it before the first commit.

Porting a standalone app: its sign-in, sessions, limits on the owner, env names and its own
"sites"/"apps" all go; the owner's are the core's, its sites are the project's origins. Keep public
URLs that live embeds depend on, unless the user says they may break.
