import { resolve } from 'node:path'
import type { H3Event } from 'h3'
import type { NexitasModule } from '../../shared/modules'
import { enabledModuleIds, openDatabase, updateModules } from '../core/database'
import { isPrivateAddress, senderNetwork } from '../core/limits'

const modules: NexitasModule[] = []
let database: ReturnType<typeof openDatabase> | undefined

/** Plugs a module's server half into the core. Call it from a Nitro plugin of the module's layer:
 *  plugins run before the first request, which is when the database opens. */
export function registerModule(module: NexitasModule) {
  if (database) throw new Error(`${module.id} was registered after the database opened.`)
  if (modules.some((known) => known.id === module.id))
    throw new Error(`${module.id} is registered twice.`)
  // An open route returns before the owner's checks: one under /api, or a pattern that matches
  // mid-path, would open the owner's API.
  for (const { path } of module.publicRoutes ?? [])
    if (typeof path === 'string' ? path.startsWith('/api/') : !path.source.startsWith('^\\/v1\\/'))
      throw new Error(`${module.id}: public route ${path} must be anchored under /v1/.`)
  modules.push(module)
}

/** Every module in this build, on or off. */
export const nexitasModules = (): readonly NexitasModule[] => modules

/** The modules the owner switched on: only these run, migrate and answer. */
export function enabledModules(): NexitasModule[] {
  const on = enabledModuleIds(nexitasDatabase())
  return modules.filter((module) => on.has(module.id))
}

/** The app's name, as its nuxt.config sets it. */
export const nexitasName = () => useRuntimeConfig().public.nexitas.name

/** An environment variable under the app's own prefix: CENSITAS_ORIGIN for censitas. Each app
 *  keeps its names, so installs that are already running need no change. */
export function nexitasEnv(name: string) {
  return process.env[`${nexitasName().toUpperCase()}_${name}`]
}

export function nexitasDatabase() {
  const dataDir = nexitasEnv('DATA_DIR')
  if (!dataDir) throw new Error(`${nexitasName().toUpperCase()}_DATA_DIR must be set.`)
  if (database) return database
  // The core first, which knows what is switched on; then only those modules.
  const db = openDatabase(resolve(dataDir, `${nexitasName()}.sqlite`))
  const on = enabledModuleIds(db)
  updateModules(
    db,
    modules.filter((module) => on.has(module.id)),
  )
  return (database = db)
}

/** Where the app lives; its own writes must come from here. */
export function nexitasOrigin() {
  const configured = nexitasEnv('ORIGIN')
  if (!configured) throw new Error(`${nexitasName().toUpperCase()}_ORIGIN must be set.`)
  return new URL(configured).origin
}

/** Who is asking, for the in-memory limits only. The proxy in front appends the address it saw
 *  as the last X-Forwarded-For entry; earlier ones come from the client. The header counts only
 *  from a proxy on this host or its private network: a caller reaching the app directly could
 *  write any address there, and pass every limit with a new one each time. */
// shortcut: assumes exactly one proxy in front (Caddy, nginx); behind a CDN as well, count hops.
export function requestSender(event: H3Event) {
  const peer = getRequestIP(event)
  const forwarded = peer && isPrivateAddress(peer) ? getHeader(event, 'x-forwarded-for') : undefined
  return senderNetwork(forwarded?.split(',').at(-1)?.trim() || peer || 'unknown')
}
