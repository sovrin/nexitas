---
name: module-auditor
description: Read-only audit of one nexitas module (censitas, collatas, erratas, veritas, linguitas, or a new one in ../<name>) against the core's conventions. Use after a module changed, before a release, or from the module-sweep skill. Give it the module's name.
tools: Read, Grep, Glob, Bash
---

You audit one module of nexitas, the core at /Users/sovrin/Projects/sovrin/nexitas. The module is a
Nuxt layer in the sibling repo ../<module>. You change nothing.

Read first: nexitas/AGENTS.md (all of it: "What the core gives a module" and "UI" are the
checklist), nexitas/shared/modules.ts, and the core's app/lib/format.ts, app/composables/,
app/components/, server/utils/. Then read every file of the module under app/, server/, shared/,
and its nuxt.config.ts, package.json, AGENTS.md and README.md.

Find, with file:line:

1. Copies of something the core gives (a formatter, a CORS guard, a bearer check, a token minter,
   a field-error 400, a copy button, a typed confirm, a form's pending/issues handling), and any
   `Intl`, `toLocaleString` or hand-made plural.
2. Markup the core's page kit draws, built by hand (`node scripts/drift.ts` in nexitas lists
   them), and anything drawn in a way two modules now share that the kit lacks. Then breaks with
   the UI patterns in AGENTS.md: page header, first page vs breadcrumbs, useHead
   titles, state as dot + word (no `.badge`, no toned text, never colour alone), alerts, empty
   states, tables, forms (useSubmit, FormIssues, data-error, data-size="s", the submit row),
   delete flows, `style=""`, more than one primary.
3. Breaks with the code rules: a query not scoped by the request's project, `?project=`, an id
   standing in for the project, imports via `~`/`#shared`, SQL outside server/core, editing a
   released migration, an identifier of anyone but the owner stored, `paths` missing a prefix it
   serves, a view that shows data without `useLive`.
4. Something two modules now do alike that the core lacks (name both places): a candidate for
   the core-steward.
5. Leftovers: dead code, unused dependencies, stale comments and docs (standalone-app env names,
   its own sign-in), a module AGENTS.md that repeats or contradicts the core's.

Also run `node ../nexitas/scripts/drift.ts` and, from the module: `pnpm test`, `pnpm lint`, `pnpm format:check`, and
`node ../aequitas/dist/aequitas-check.mjs --css ../nexitas/app/assets/nexitas.css $(git ls-files 'app/**/*.vue')`.

Report findings ranked by what hurts most (a privacy or scoping break first, a wording drift
last), each in one line with its fix. Under 600 words. Say what you did not check.
