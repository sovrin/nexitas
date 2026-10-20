import type { NexitasAppConfig } from '../shared/modules'

// The shell's defaults. An app or module overrides the texts and adds nav entries in its own
// app.config.ts under `nexitas`.
export default defineAppConfig({
  nexitas: {
    nav: [],
    text: {
      setup: 'Create the owner account.',
      signIn: 'Sign in to continue.',
      promise: 'One owner. Your server. Your data stays on it.',
    },
  } satisfies NexitasAppConfig,
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    nexitas?: Partial<NexitasAppConfig>
  }
  interface AppConfig {
    nexitas: NexitasAppConfig
  }
}
