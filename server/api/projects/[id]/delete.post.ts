import { installedModuleIds } from '../../../core/database'
import { deleteProject } from '../../../core/projects'
import { announceChange } from '../../../utils/changes'
import { nexitasDatabase, nexitasModules } from '../../../utils/nexitas'
import { routeProject } from '../../../utils/projects'

export default defineEventHandler((event) => {
  const db = nexitasDatabase()
  // Every module with tables goes along, on or off: a project leaves nothing behind.
  const installed = installedModuleIds(db)
  deleteProject(
    db,
    routeProject(event).id,
    nexitasModules().filter((module) => installed.has(module.id)),
  )
  announceChange()
  return { ok: true }
})
