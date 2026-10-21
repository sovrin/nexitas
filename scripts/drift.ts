// Fails when a page builds by hand what the core's page kit (app/components) draws: a header, a
// breadcrumb, an alert, a table's frame, a state's dot, an aside, a section's heading. Those exist
// once, in the core, so every module looks alike and changes with it. Runs over the core's pages
// and every module in .modules/ as part of `pnpm lint`.
//   node scripts/drift.ts
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const RULES: [RegExp, string][] = [
  [/class="[^"]*\bpage-header\b/, '<AppPage>'],
  [/class="[^"]*\bbreadcrumb\b/, "<AppPage>'s trail"],
  [/class="[^"]*\balert\b/, '<AppAlert>'],
  [/class="[^"]*\btable-scroll\b/, '<DataTable>'],
  [/class="[^"]*\bwith-aside\b/, "<AppPage>'s aside slot"],
  [/class="dot"/, '<StateDot>'],
  [/hairline-b pb-2/, '<AppSection>'],
  [/<h1\b/, "<AppPage>'s title"],
  [/useFetch[^(]*\(\s*`\/api\/p\//, 'useProjectFetch()'],
  [/(?<![:\w-])style="/, 'an aequitas class'],
]

function vueFiles(dir: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.flatMap((name) => {
    if (name === 'node_modules' || name.startsWith('.')) return []
    const path = join(dir, name)
    // statSync follows .modules/ symlinks to a checkout of a module.
    if (statSync(path).isDirectory()) return vueFiles(path)
    return name.endsWith('.vue') ? [path] : []
  })
}

const modules = readdirSync(resolve(root, '.modules')).filter((id) => id !== 'nexitas')
const files = [
  ...vueFiles(resolve(root, 'app/pages')),
  ...vueFiles(resolve(root, 'app/layouts')),
  ...modules.flatMap((id) => vueFiles(resolve(root, '.modules', id, 'app'))),
]

let found = 0
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const [pattern, use] of RULES)
        if (pattern.test(line)) {
          found++
          console.error(`${relative(root, file)}:${index + 1}  use ${use}: ${line.trim()}`)
        }
    })
}
if (found) {
  console.error(`\n${found} place(s) draw by hand what the core's page kit draws.`)
  process.exit(1)
}
console.info(`drift: ${files.length} pages and components follow the core's page kit.`)
