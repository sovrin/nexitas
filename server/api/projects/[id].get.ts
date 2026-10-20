import { routeProject, summarizeProject } from '../../utils/projects'

export default defineEventHandler((event) => summarizeProject(routeProject(event)))
