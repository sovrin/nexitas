---
name: module-sweep
description: Consistency sweep over the nexitas core and all its modules - runs every repo's checks, fans out a module-auditor per module, and turns what they find into one plan of fixes, the generic parts for the core. Use for "check the modules", "are the modules consistent", before a release, or after a core change the modules should follow.
---

# Module sweep

nexitas is at /Users/sovrin/Projects/sovrin/nexitas; each module named in its `modules.json` is a
sibling repo (`../<module>`), linked into `.modules/` for the build. AGENTS.md is the rulebook.

1. **Checks.** In nexitas: `pnpm check && pnpm lint && pnpm format:check && pnpm build` (one at a
   time: they share `.nuxt`). Then in each module, in parallel if you like:
   `pnpm test && pnpm lint && pnpm format:check` and the aequitas check on its Vue files
   (`node ../aequitas/dist/aequitas-check.mjs --css ../nexitas/app/assets/nexitas.css <files>`).
   `pnpm lint` runs `scripts/drift.ts`: a page that hand-builds what the core's page kit draws.
   Note every failure with its output.
2. **Audit.** Start one `module-auditor` agent per module, all in one message, each given its
   module's name. Wait for all.
3. **Sort.** Merge the findings:
   - the same finding in two or more modules, or a "candidate for the core": ask the
     `core-steward` agent with the list; what it accepts goes into the core first.
   - everything else: a fix in that module.
     Drop findings you cannot confirm by reading the line.
4. **Plan or fix.** Without a go from the user, report the plan: per repo, the fixes, smallest
   first, and the core changes with their release marking. With a go, do the core first (add,
   don't rename; run its checks), then one agent per module with the shared brief and its own
   list, never two agents on one repo, never `nuxt typecheck` from more than one at a time.
   Finish with step 1 again.

Commits are conventional and per repo (see AGENTS.md); a breaking change to `shared/modules.ts`
is marked `!`. Don't commit or push unless asked.
