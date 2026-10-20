import { projectSettingsSchema } from '../../../shared/contracts'
import { getProject, updateProject } from '../../core/projects'
import { announceChange } from '../../utils/changes'
import { invalid } from '../../utils/invalid'
import { nexitasDatabase } from '../../utils/nexitas'
import { routeProject } from '../../utils/projects'

export default defineEventHandler(async (event) => {
  const { id } = routeProject(event)
  const body = projectSettingsSchema.safeParse(await readBody(event))
  if (!body.success) throw invalid(body.error)
  const db = nexitasDatabase()
  updateProject(db, id, body.data)
  announceChange()
  return getProject(db, id)
})
