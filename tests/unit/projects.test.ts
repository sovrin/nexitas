import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase } from '../../server/core/database'
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  projectAllows,
  updateProject,
} from '../../server/core/projects'
import type { NexitasModule } from '../../shared/modules'

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

// A module keeping a row per project, as collatas and censitas do.
const forms: NexitasModule = {
  id: 'forms',
  migrations: ['CREATE TABLE forms (id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id))'],
  deleteProject: (db, id) => db.prepare('DELETE FROM forms WHERE project_id = ?').run(id),
}

function open() {
  const dir = mkdtempSync(join(tmpdir(), 'nexitas-test-'))
  dirs.push(dir)
  return openDatabase(join(dir, 'test.sqlite'), [forms])
}

const sonotas = { id: 'sonotas', name: 'sonotas', origins: ['https://sonotas.example'] }

describe('projects', () => {
  it('are added once, changed, and answer for their origins only', () => {
    const db = open()
    expect(createProject(db, sonotas)).toBe(true)
    expect(createProject(db, { ...sonotas, name: 'again' })).toBe(false)
    updateProject(db, 'sonotas', {
      name: 'Sonotas',
      origins: ['https://sonotas.example', 'https://www.sonotas.example'],
    })
    expect(listProjects(db)).toEqual([
      {
        id: 'sonotas',
        name: 'Sonotas',
        origins: ['https://sonotas.example', 'https://www.sonotas.example'],
      },
    ])
    expect(projectAllows(db, 'sonotas', 'https://www.sonotas.example')).toBe(true)
    expect(projectAllows(db, 'sonotas', 'https://elsewhere.example')).toBe(false)
    expect(projectAllows(db, 'missing', 'https://sonotas.example')).toBe(false)
  })

  it('go with what every module keeps for them, or not at all', () => {
    const db = open()
    createProject(db, sonotas)
    db.prepare("INSERT INTO forms VALUES ('sonotas', 'sonotas')").run()
    expect(() => deleteProject(db, 'sonotas', [])).toThrow()
    expect(getProject(db, 'sonotas')).not.toBeNull()
    expect(deleteProject(db, 'sonotas', [forms])).toBe(true)
    expect(getProject(db, 'sonotas')).toBeNull()
    expect(db.prepare('SELECT COUNT(*) AS n FROM forms').get()).toEqual({ n: 0 })
  })
})
