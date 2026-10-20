// The owner's sites and apps, shared by every module: a module keeps its own settings per project
// and asks here which origins may call it.
import type { DatabaseSync } from 'node:sqlite'
import type { Project, ProjectSettings } from '../../shared/contracts'
import type { NexitasModule } from '../../shared/modules'
import { transaction } from './database'

interface ProjectRow {
  id: string
  name: string
  origins: string
}

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  origins: JSON.parse(row.origins),
})

export function listProjects(db: DatabaseSync): Project[] {
  return (
    db
      .prepare('SELECT id, name, origins FROM projects ORDER BY name, id')
      .all() as unknown as ProjectRow[]
  ).map(toProject)
}

export function getProject(db: DatabaseSync, id: string): Project | null {
  const row = db.prepare('SELECT id, name, origins FROM projects WHERE id = ?').get(id) as
    | ProjectRow
    | undefined
  return row ? toProject(row) : null
}

/** False when a project with this id exists already. */
export function createProject(db: DatabaseSync, project: Project, now = Date.now()) {
  return (
    db
      .prepare(
        `INSERT OR IGNORE INTO projects (id, name, origins, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .run(project.id, project.name, JSON.stringify(project.origins), now, now).changes === 1
  )
}

export function updateProject(
  db: DatabaseSync,
  id: string,
  settings: ProjectSettings,
  now = Date.now(),
) {
  return (
    db
      .prepare('UPDATE projects SET name = ?, origins = ?, updated_at = ? WHERE id = ?')
      .run(settings.name, JSON.stringify(settings.origins), now, id).changes === 1
  )
}

/** Deletes the project and what every module keeps for it, all or none. */
export function deleteProject(db: DatabaseSync, id: string, modules: readonly NexitasModule[]) {
  return transaction(db, () => {
    for (const module of modules) module.deleteProject?.(db, id)
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes === 1
  })
}

/** Whether a page at `origin` belongs to the project, so it may call the project's modules. */
export function projectAllows(db: DatabaseSync, id: string, origin: string) {
  return getProject(db, id)?.origins.includes(origin) ?? false
}
