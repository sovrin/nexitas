import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, describe, expect, it } from 'vitest'
import {
  disableModule,
  enableModule,
  enabledModuleIds,
  installedModuleIds,
  openDatabase,
} from '../../server/core/database'
import type { NexitasModule } from '../../shared/modules'

const dirs: string[] = []
const dbs: DatabaseSync[] = []

function file() {
  const dir = mkdtempSync(join(tmpdir(), 'nexitas-test-'))
  dirs.push(dir)
  return join(dir, 'test.sqlite')
}

function open(path: string, modules: NexitasModule[] = []) {
  const db = openDatabase(path, modules)
  dbs.push(db)
  return db
}

const versions = (db: DatabaseSync) =>
  db.prepare('SELECT id, version FROM modules ORDER BY id').all()

const notes: NexitasModule = {
  id: 'notes',
  migrations: [
    'CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)',
    'ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0',
  ],
}

afterEach(() => {
  for (const db of dbs.splice(0)) if (db.isOpen) db.close()
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('database', () => {
  it('brings the core and each module up to date, and only once', () => {
    const path = file()
    const db = open(path, [notes])
    expect(versions(db)).toEqual([
      { id: 'nexitas', version: 1 },
      { id: 'notes', version: 2 },
    ])
    db.prepare("INSERT INTO notes (text) VALUES ('kept')").run()
    db.close()
    // Opening again runs nothing: a second CREATE TABLE would throw.
    expect(open(path, [notes]).prepare('SELECT text, pinned FROM notes').get()).toEqual({
      text: 'kept',
      pinned: 0,
    })
  })

  it('runs only the steps a module has not had yet', () => {
    const path = file()
    open(path, [{ ...notes, migrations: notes.migrations!.slice(0, 1) }]).close()
    const db = open(path, [notes])
    expect(versions(db)).toContainEqual({ id: 'notes', version: 2 })
  })

  it('refuses a database a newer version wrote, and leaves a failed step undone', () => {
    const path = file()
    open(path, [notes]).close()
    expect(() => open(path, [{ ...notes, migrations: notes.migrations!.slice(0, 1) }])).toThrow(
      'requires a newer version of notes',
    )
    const broken: NexitasModule = { id: 'broken', migrations: ['CREATE TABLE a (x)', 'NOT SQL'] }
    expect(() => open(path, [notes, broken])).toThrow()
    const db = open(path, [notes])
    expect(versions(db)).not.toContainEqual(expect.objectContaining({ id: 'broken' }))
    expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'a'").get()).toBeUndefined()
  })

  it('switches a module on with its schema, and off keeping its data', () => {
    const db = open(file())
    expect(enabledModuleIds(db).size).toBe(0)
    enableModule(db, notes)
    expect([...enabledModuleIds(db)]).toEqual(['notes'])
    db.prepare("INSERT INTO notes (text) VALUES ('kept')").run()
    disableModule(db, 'notes')
    expect(enabledModuleIds(db).size).toBe(0)
    expect([...installedModuleIds(db)]).toEqual(['notes'])
    enableModule(db, notes)
    expect(db.prepare('SELECT text FROM notes').get()).toEqual({ text: 'kept' })
  })
})
