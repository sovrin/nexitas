import type { ModuleStatus } from '../../shared/modules'
import { getProject } from '../core/projects'
import { nexitasDatabase } from '../utils/nexitas'
import { summarizeProject } from '../utils/projects'

/** The status line under every page (signed in, see the security middleware): what each module
 *  says about the project the owner has open, in the order the modules were registered. */
export default defineEventHandler((event): ModuleStatus[] => {
  const { project } = getQuery(event)
  const found = typeof project === 'string' ? getProject(nexitasDatabase(), project) : null
  return found ? summarizeProject(found).status : []
})
