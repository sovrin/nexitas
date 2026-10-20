import type { ModuleSwitch } from '../../../shared/contracts'
import { enabledModuleIds, installedModuleIds } from '../../core/database'
import { nexitasDatabase, nexitasModules } from '../../utils/nexitas'

/** Every module in this build, and whether the owner has it on. */
export default defineEventHandler((): ModuleSwitch[] => {
  const db = nexitasDatabase()
  const on = enabledModuleIds(db)
  const installed = installedModuleIds(db)
  return nexitasModules().map((module) => ({
    id: module.id,
    enabled: on.has(module.id),
    hasData: installed.has(module.id),
  }))
})
