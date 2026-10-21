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

/** The project named in the route, or a 404: the core's own /api/projects/<id> routes. */
export function routeProject(event: H3Event) {
  const project = getProject(nexitasDatabase(), getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, statusMessage: 'There is no such project.' })
  return project
}

/** The project an /api/p/<id>/ request is for. The security middleware has found it, or answered
 *  404, before any handler runs; a module's handler takes it from here and from nowhere else. */
export function requestProject(event: H3Event): Project {
  const project = event.context.project
  if (!project) throw new Error(`${event.path} is not under /api/p/<id>/.`)
  return project
}

declare module 'h3' {
  interface H3EventContext {
    project?: Project
  }
}
