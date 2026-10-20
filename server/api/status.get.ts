import type { StatusItem } from '../../shared/modules'
import { nexitasDatabase, nexitasModules } from '../utils/nexitas'

/** The status line under every page (signed in, see the security middleware): each module's
 *  items, in the order the modules were registered. */
export default defineEventHandler((): StatusItem[] => {
  const db = nexitasDatabase()
  return nexitasModules().flatMap((module) => module.status?.(db) ?? [])
})
