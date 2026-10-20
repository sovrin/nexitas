// Every rule about what the core accepts lives here, shared by the pages and the server. Modules
// keep their own rules in their own shared/contracts.ts and may build on these.
import { z } from 'zod'
import type { ModuleStatus } from './modules'

/** Scheme, host and port only, as a browser sends it in the Origin header. */
export function isOrigin(value: string) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value
  } catch {
    return false
  }
}

export const ownerCredentialsSchema = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(12, 'Use at least 12 characters.').max(256),
  })
  .strict()

export const setupSchema = ownerCredentialsSchema.extend({
  token: z.string().min(32).max(256),
  /** The modules to switch on from the start; none unless chosen. */
  modules: z.array(z.string().max(64)).max(32).default([]),
})

export interface AuthStatus {
  setupRequired: boolean
  owner: { email: string } | null
}

/** A new project's id: the one the modules' snippets will name, so it never changes. Letter first
 *  and at most 40, so every module can use it for its own row too. */
export const projectIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,39}$/, 'Use lowercase letters, digits and dashes, a letter first.')

/** The exact origins a project's pages are served from: only these may call its modules. */
export const originsSchema = z
  .array(
    z
      .string()
      .trim()
      .transform((value) => value.replace(/\/$/, ''))
      .refine(isOrigin, 'Enter an origin like https://sonotas.example.com, without a path.'),
  )
  .min(1, 'Add the site this project is.')
  .max(16)

/** What can change about a project; its id cannot. */
export const projectSettingsSchema = z
  .object({
    name: z.string().trim().min(1, 'Give the project a name.').max(60),
    origins: originsSchema,
  })
  .strict()

export const projectSchema = projectSettingsSchema.extend({ id: projectIdSchema }).strict()

export type ProjectSettings = z.infer<typeof projectSettingsSchema>
/** Ids made before projects existed may not match projectIdSchema, so the type takes any. */
export interface Project extends ProjectSettings {
  id: string
}

/** A project with what each module says about it, the modules that say nothing left out. */
export interface ProjectSummary extends Project {
  status: ModuleStatus[]
}

/** A module in this build, as the Modules page shows it. */
export interface ModuleSwitch {
  id: string
  enabled: boolean
  /** It has tables, and maybe data, kept while it is off. */
  hasData: boolean
}

export const moduleSwitchSchema = z.object({ enabled: z.boolean() }).strict()
