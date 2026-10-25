import type { NexitasAppConfig } from '../shared/modules'

// The shell's own part. A module adds its name, icon and nav entries in its own app.config.ts
// under `nexitas`; nexitas is always the app, so these texts and the projects section come first.
export default defineAppConfig({
  nexitas: {
    nav: [{ to: '/', label: 'Projects', paths: ['/projects'] }],
    modules: [],
    text: {
      setup:
        'Create the owner account. Your projects, and what every module keeps for them, live here.',
      signIn: 'Sign in to see your projects.',
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
