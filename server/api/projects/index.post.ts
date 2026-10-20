import { projectSchema } from '../../../shared/contracts'
import { createProject } from '../../core/projects'
import { announceChange } from '../../utils/changes'
import { invalid } from '../../utils/invalid'
import { nexitasDatabase } from '../../utils/nexitas'

export default defineEventHandler(async (event) => {
  const body = projectSchema.safeParse(await readBody(event))
  if (!body.success) throw invalid(body.error)
  if (!createProject(nexitasDatabase(), body.data))
    throw createError({ statusCode: 409, statusMessage: 'A project with this id exists already.' })
  announceChange()
  setResponseStatus(event, 201)
  return body.data
})
