import type { ProjectActivity } from '../../../../shared/contracts'
import { enabledModules, nexitasDatabase } from '../../../utils/nexitas'
import { routeProject } from '../../../utils/projects'

const DAY = 24 * 60 * 60 * 1000

/** What happened in the project since the owner last looked (`?since=` in ms), from every module
 *  that is on, newest first. At most a month back and sixty items: the overview is a glance. */
export default defineEventHandler((event): ProjectActivity => {
  const project = routeProject(event)
  const now = Date.now()
  const asked = Number(getQuery(event).since)
  const since = Number.isFinite(asked)
    ? Math.min(now, Math.max(asked, now - 30 * DAY))
    : now - 7 * DAY
  const db = nexitasDatabase()
  const items = enabledModules()
    .flatMap((module) =>
      (module.projectActivity?.(db, project.id, since) ?? []).map((item) => ({
        ...item,
        module: module.id,
      })),
    )
    .sort((a, b) => b.at - a.at)
    .slice(0, 60)
  return { since, items }
})
