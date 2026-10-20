import { moduleSwitchSchema } from '../../../shared/contracts'
import { disableModule, enableModule } from '../../core/database'
import { announceChange } from '../../utils/changes'
import { invalid } from '../../utils/invalid'
import { nexitasDatabase, nexitasModules } from '../../utils/nexitas'

/** Switches a module on (bringing its tables up to date) or off (keeping them). */
export default defineEventHandler(async (event) => {
  const module = nexitasModules().find((known) => known.id === getRouterParam(event, 'id'))
  if (!module) throw createError({ statusCode: 404, statusMessage: 'There is no such module.' })
  const body = moduleSwitchSchema.safeParse(await readBody(event))
  if (!body.success) throw invalid(body.error)
  const db = nexitasDatabase()
  if (body.data.enabled) enableModule(db, module)
  else disableModule(db, module.id)
  announceChange()
  return { id: module.id, enabled: body.data.enabled }
})
