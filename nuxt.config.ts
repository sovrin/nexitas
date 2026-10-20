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
// `pnpm modules`, or a symlink to a checkout of your own). Each install's owner then switches on
// the ones it uses.
const manifest: Record<string, string> = JSON.parse(
  readFileSync(resolve(root, 'modules.json'), 'utf8'),
)
const modules = Object.keys(manifest).map((id) => {
  const dir = resolve(root, '.modules', id)
  if (!existsSync(resolve(dir, 'nuxt.config.ts')))
    throw new Error(`.modules/${id} is missing. Run \`pnpm modules\` first.`)
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
  vite: { server: { fs: { allow: [root, resolve(aequitas, '..')] } } },
  nitro: { preset: 'node-server' },
  // Page changes crossfade through the browser's View Transitions (see nexitas.css for timing).
  experimental: { viewTransition: true },
  runtimeConfig: {
    // The install's name: shown in the shell, and the prefix of its environment variables
    // (NEXITAS_DATA_DIR, …) and its database file (nexitas.sqlite).
    public: { nexitas: { name: 'nexitas' } },
  },
  app: {
    head: {
      // data-ae-manual: importing aequitas.js (setTheme) must not run its DOM-scanning init.
      // Graphite keeps the accent neutral, so colour on screen only ever reports state.
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
