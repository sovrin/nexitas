import { init } from '@aequitas/aequitas.js'

// aequitas' behaviours (the ⌘K palette's filtering and keys, menus that close, tabs) start once
// the server's page has hydrated, so they never touch markup Vue has yet to claim. init() then
// enhances what later pages render on its own.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => init())
})
