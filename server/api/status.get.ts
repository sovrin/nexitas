import type { ModuleStatus } from '../../shared/modules'
import { enabledModules, nexitasDatabase } from '../utils/nexitas'

/** The status line under every page (signed in, see the security middleware): each module's
 *  items under its id, in the order the modules were registered. */
export default defineEventHandler((): ModuleStatus[] => {
  const db = nexitasDatabase()
  return enabledModules()
    .map((module) => ({ module: module.id, items: [...(module.status?.(db) ?? [])] }))
    .filter((status) => status.items.length)
})
