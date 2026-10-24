import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// nexitas is the app: the owner's sign-in, the /api guard, live updates, the database, projects and
// the page shell. It builds with the modules it lists, each a Nuxt layer that plugs in through the
// interfaces in shared/modules.ts.
//
// aequitas is not published yet: it is consumed from the built dist/ of a sibling checkout
// (../aequitas next to this repository). Run `pnpm build` there first, or point AEQUITAS_DIST
// at another dist/ directory.
const root = dirname(fileURLToPath(import.meta.url))
const aequitas = resolve(root, process.env.AEQUITAS_DIST ?? '../aequitas/dist') + '/'
// The modules in this build: exactly those modules.json names, from .modules/ (filled by
// `node scripts/modules.ts`, or a symlink to a checkout of your own). Each install's owner then switches on
// the ones it uses.
const manifest: Record<string, string> = JSON.parse(
  readFileSync(resolve(root, 'modules.json'), 'utf8'),
)
const modules = Object.keys(manifest).map((id) => {
  const dir = resolve(root, '.modules', id)
  if (!existsSync(resolve(dir, 'nuxt.config.ts')))
    throw new Error(`.modules/${id} is missing. Run \`node scripts/modules.ts\` first.`)
  return dir
})

export default defineNuxtConfig({
  extends: modules,
  compatibilityDate: '2026-09-06',
  devtools: { enabled: false },
  css: [
    `${aequitas}aequitas.css`,
    `${aequitas}aequitas.icons.css`,
    resolve(root, 'app/assets/nexitas.css'),
  ],
  // Paths in a layer resolve against the app that extends it, so modules reach the core through
  // #nexitas and the layer reaches aequitas through @aequitas.
  alias: { '@aequitas': aequitas, '#nexitas': root },
  vite: {
    server: { fs: { allow: [root, resolve(aequitas, '..')] } },
    // Each module is its own checkout with its own node_modules: one copy of zod, not one per module.
    resolve: { dedupe: ['zod'] },
  },
  nitro: { preset: 'node-server' },
  runtimeConfig: {
    // The install's name: shown in the shell, and the prefix of its environment variables
    // (NEXITAS_DATA_DIR, …) and its database file (nexitas.sqlite).
    public: { nexitas: { name: 'nexitas' } },
  },
  app: {
    head: {
      // data-ae-manual: aequitas.js starts only once Vue has hydrated (plugins/aequitas.client.ts).
      // Graphite is the core's accent; each module's section takes its own hue. Compact: a
      // working console shows more rows, not more air.
      htmlAttrs: {
        lang: 'en',
        'data-ae-manual': '',
        'data-accent': 'graphite',
        'data-density': 'compact',
      },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
