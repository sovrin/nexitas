import type { H3Event } from 'h3'
import type { Project, ProjectSummary } from '../../shared/contracts'
import { getProject } from '../core/projects'
import { enabledModules, nexitasDatabase } from './nexitas'

/** Each module's line about the project, in the order the modules were registered. */
export function summarizeProject(project: Project): ProjectSummary {
  const db = nexitasDatabase()
  return {
    ...project,
    status: enabledModules()
      .map((module) => ({
        module: module.id,
        items: [...(module.projectStatus?.(db, project.id) ?? [])],
      }))
      .filter((status) => status.items.length),
  }
}

/** The project named in the route, or a 404. */
export function routeProject(event: H3Event) {
  const project = getProject(nexitasDatabase(), getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, statusMessage: 'There is no such project.' })
  return project
}
