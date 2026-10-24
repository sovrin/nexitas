// Fails when a page builds by hand what the core's page kit (app/components) draws: a header, a
// breadcrumb, an alert, a table, a state's dot, an aside, a section's heading. Those exist once,
// in the core, so every module looks alike and changes with it. Runs over the core's pages and
// components and every module in .modules/ as part of `pnpm lint`.
//   node scripts/drift.ts
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

// A bound style may set only custom properties ('--depth'), which a stylesheet then reads: a chart's
// values, a tree's depth. Anything else (a computed object, `insetInlineStart`) is drawn by a class.
function boundStyle(line: string) {
  const value = line.match(/(?<![\w-])(?::|v-bind:)style="([^"]*)/)?.[1]?.trim()
  if (value === undefined) return false
  if (!value.startsWith('{')) return true
  const keys = [...value.matchAll(/[{,]\s*(['"]?[\w-]+['"]?)\s*:/g)].map((match) => match[1]!)
  return keys.some((key) => !/^['"]--/.test(key))
}

const RULES: [{ test(line: string): boolean }, string][] = [
  [/class="[^"]*\bpage-header\b/, '<AppPage>'],
  [/class="[^"]*\bbreadcrumb\b/, "<AppPage>'s trail"],
  [/class="[^"]*\balert\b/, '<AppAlert>'],
  [/role="alert"/, '<AppAlert>'],
  [/class="[^"]*\btable-scroll\b/, '<DataTable>'],
  [/<table\b/, '<DataTable>'],
  [/class="[^"]*\bwith-aside\b/, "<AppPage>'s aside slot"],
  [/class="dot"/, '<StateDot>'],
  [/hairline-b pb-2/, '<AppSection>'],
  [/<h[2-6]\b[^>]*class="[^"]*\beyebrow\b/, '<AppSection>'],
  [/<h1\b/, "<AppPage>'s title"],
  [/useFetch[^(]*\(\s*`\/api\/p\//, 'useProjectFetch()'],
  [/(?<![:\w-])style="/, 'an aequitas class'],
  [{ test: boundStyle }, "an aequitas class (a bound style sets only '--' custom properties)"],
]
// The kit itself, which draws what the rules guard; and the sign-in screen, whose title stands
// outside any page frame.
const KIT = new Set([
  'AppAlert.vue',
  'AppPage.vue',
  'AppSection.vue',
  'AsideLayout.vue',
  'DataTable.vue',
  'StateDot.vue',
  'OwnerForm.vue',
])

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
  ...vueFiles(resolve(root, 'app/components')).filter((file) => !KIT.has(basename(file))),
  ...modules.flatMap((id) => vueFiles(resolve(root, '.modules', id, 'app'))),
]

let found = 0
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      const use = RULES.find(([pattern]) => pattern.test(line))?.[1]
      if (!use) return
      found++
      console.error(`${relative(root, file)}:${index + 1}  use ${use}: ${line.trim()}`)
    })
}
if (found) {
  console.error(`\n${found} place(s) draw by hand what the core's page kit draws.`)
  process.exit(1)
}
console.info(`drift: ${files.length} pages and components follow the core's page kit.`)
