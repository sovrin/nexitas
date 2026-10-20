import { listProjects } from '../../core/projects'
import { nexitasDatabase } from '../../utils/nexitas'
import { summarizeProject } from '../../utils/projects'

export default defineEventHandler(() => listProjects(nexitasDatabase()).map(summarizeProject))
