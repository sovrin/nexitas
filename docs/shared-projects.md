# Plan: shared projects and one combined app

Status: built (uncommitted). The README describes how it works now; this keeps the reasoning.

Today collatas and censitas are two apps, each extending nexitas, each with its own owner, database
and list of the owner's sites: collatas calls them _apps_, censitas _sites_. Both hold the same
thing: an id the owner's pages name in a snippet, and the origins allowed to call in. This plan
makes that one thing, a **project**, owned by the core, and builds nexitas with every module in
one app, so a project added once carries over to every module.

## 1. The projects table

The core's first step creates it:

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,      -- lowercase letters, digits and dashes, ^[a-z0-9][a-z0-9-]{0,63}$
  name TEXT NOT NULL,       -- shown in the shell; the id when nothing else is known
  origins TEXT NOT NULL,    -- JSON array of exact origins (https://sonotas.example)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

- The id pattern is the union of the two today (collatas: digit first allowed, up to 40;
  censitas: letter first, up to 64), so every existing id fits.
- Only the owner's own configuration: no visitor data, so the privacy rule holds unchanged.
- `server/core/projects.ts`: `listProjects`, `getProject`, `createProject`, `updateProject`,
  `deleteProject`, and `projectAllows(db, id, origin)`, which both modules' guards call instead of
  reading their own origins.
- `/api/projects` (owner only, as all of `/api`), `/` becomes the projects overview, and
  `/projects/new` and `/projects/:id` the core's pages.

### What the interfaces gain

All optional, so the change to `shared/modules.ts` is additive (`feat(modules): …`, no `!`):

```ts
interface NexitasModule {
  // …as today
  /** This module's line for one project, on the overview and the project's page. */
  projectStatus?: (db: DatabaseSync, projectId: string) => readonly StatusItem[]
  /** Removes what the module keeps for a project; runs in the core's delete transaction. */
  deleteProject?: (db: DatabaseSync, projectId: string) => void
}

interface NexitasAppConfig {
  // …as today
  /** Each module's name, icon and panel (built: `modules`, see the README). */
  modules: ModuleEntry[]
}
```

A panel shows the module's part of the project (the snippet, the latest feedback, today's counts)
and a button to switch the module on for a project that does not use it yet.

## 2. How apps and sites map onto projects

Each module keeps its own row per project, with its own settings, and points at the project. The
module row keeps its own id, because deployed snippets name it (`<collatas-form app="sonotas">`,
`track.js?site=sonotas`). A module row always takes its project's id; with no imported rows,
the separate column is now redundant.

| Today                               | Moves to                         | Stays in the module                                                       |
| ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| collatas `apps.id`                  | `projects.id` (for new projects) | `apps.id`, the id in the snippet                                          |
| collatas `apps.name`                | `projects.name`                  |                                                                           |
| collatas `apps.origins`             | `projects.origins`               |                                                                           |
| collatas kinds, context, send_page… |                                  | `apps`: kinds, context, send_page, issue_repo, retention, enabled, limits |
| censitas `sites.id`                 | `projects.id` (for new projects) | `sites.id`, the id in the snippet                                         |
| censitas `sites.origins`            | `projects.origins`               |                                                                           |
| censitas `sites.events`             |                                  | `sites.events`, `counts`, `refusals`                                      |

Each module's schema is one first step, written for projects from the start (no data is carried
over from the old installs, so their steps were squashed):

```sql
-- collatas (censitas: the same for sites, with its events)
CREATE TABLE apps (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL UNIQUE REFERENCES projects(id),
  kinds TEXT NOT NULL, context TEXT NOT NULL, …
);
```

- One module row per project (`UNIQUE`), so a project page shows one form and one dashboard.
- Deleting a project calls every module's `deleteProject`; counts have no foreign key, and
  feedback cascades from its app.
- censitas' JSON export and import carry the origins from the project.

### The migration runner

The core's steps run first, so module steps may reference `projects`. The core's schema, like each
module's, is a single first step. Modules no longer create the owner tables, and nothing adopts
`PRAGMA user_version`: every database starts empty.

## 3. The build

nexitas is the app you deploy and builds with the modules. The modules stop extending nexitas and
become plain layers; nexitas extends them. Which ones: exactly those `modules.json` names, each
pinned to a ref and fetched into the untracked `.modules/` by `pnpm modules` (or a symlink to a
checkout of your own). Every install runs that one build and the owner switches each module on or
off; off, it migrates nothing, answers 404 on its paths and runs no hourly work. See the README.

What changes in each module, before any of the above:

- **Relative imports** instead of `~/…` and `#shared/…` (25 in collatas, 14 in censitas): in a
  layer they resolve against the app, as nexitas' own `AGENTS.md` already says. CSS through
  `resolve(root, 'app/assets/app.css')`.
- **Its own path prefix**: the collatas inbox moves from `/` to `/feedback`, censitas' dashboard
  to `/sites`. `/` is the core's projects overview. `/apps` and `/apps/new`, and censitas' site
  list and `/sites/new`, go: a project replaces them. Their settings pages stay, linked from the
  project.
- **Nothing app-wide**: no `runtimeConfig.public.nexitas.name`, no `LogoMark.vue`, no favicon, no
  meta description, no sign-in lines. Those are nexitas', and two layers setting them would fight.
- Env names: the app is `nexitas`, so `NEXITAS_DATA_DIR`, `NEXITAS_ORIGIN`,
  `NEXITAS_BOOTSTRAP_TOKEN`. A module's own variables keep their names (`COLLATAS_WEBHOOK_URL`).
- Public routes don't clash (`/v1/form.js`, `/v1/apps/:id/…`, `/v1/track.js`, `/v1/e`).

### Three repositories (decided)

collatas and censitas stay in their own repositories; nexitas' `modules.json` names them, and its
CI and Dockerfile fetch them with `pnpm modules`. A module no longer builds on its own.

## 4. Existing installs

None are carried over: every install starts with an empty database. (A merge script that copied
old collatas and censitas installs into one was written, then dropped as not needed.)

## Decisions

- Three repositories (section 3).
- The module rows keep a `project_id` beside their own id, which now always equals it.
- No data is carried over from the old installs.
- The modules are listed in `modules.json`, never discovered from folders.
- Every install switches its modules on itself; none is on until chosen.
