import { chmodSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { NexitasModule } from '../../shared/modules'

// The core's own tables, as a module of its own. They come before the modules', whose steps may
// refer to them.
export const core: NexitasModule = {
  id: 'nexitas',
  migrations: [
    // The owner and their sessions; the owner's sites and apps, one row each, shared by every
    // module (see core/projects.ts); and the modules the owner switched on.
    `CREATE TABLE owner (id INTEGER PRIMARY KEY CHECK (id = 1), email TEXT NOT NULL, password_hash TEXT NOT NULL);
     CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
     CREATE TABLE projects (
       id TEXT PRIMARY KEY, name TEXT NOT NULL, origins TEXT NOT NULL,
       created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
     );
     CREATE TABLE enabled_modules (id TEXT PRIMARY KEY) WITHOUT ROWID;`,
  ],
}

/** Opens the database at `file` and brings the core and every module in `modules` up to date, in
 *  one transaction: a step that fails leaves the database as it was. */
export function openDatabase(file: string, modules: readonly NexitasModule[] = []) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 })
  const db = new DatabaseSync(file)
  // SQLite gives its WAL files the database's mode, so this keeps them the owner's too.
  chmodSync(file, 0o600)
  db.exec('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  try {
    transaction(db, () => {
      // Each module's schema version, so modules can be added to an app and grow on their own.
      db.exec(
        'CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, version INTEGER NOT NULL) WITHOUT ROWID',
      )
      for (const module of [core, ...modules]) migrate(db, module)
    })
  } catch (error) {
    db.close()
    throw error
  }
  return db
}

/** Brings `modules` up to date on an open database, all or none. */
export function updateModules(db: DatabaseSync, modules: readonly NexitasModule[]) {
  transaction(db, () => {
    for (const module of modules) migrate(db, module)
  })
}

/** The modules the owner switched on. */
export function enabledModuleIds(db: DatabaseSync): Set<string> {
  const rows = db.prepare('SELECT id FROM enabled_modules').all() as { id: string }[]
  return new Set(rows.map((row) => row.id))
}

/** The modules whose tables exist, on or off: their schema version is recorded. */
export function installedModuleIds(db: DatabaseSync): Set<string> {
  const rows = db.prepare("SELECT id FROM modules WHERE id != 'nexitas'").all() as { id: string }[]
  return new Set(rows.map((row) => row.id))
}

/** Switches a module on: its schema is brought up to date first, all or none. */
export function enableModule(db: DatabaseSync, module: NexitasModule) {
  transaction(db, () => {
    migrate(db, module)
    db.prepare('INSERT OR IGNORE INTO enabled_modules (id) VALUES (?)').run(module.id)
  })
}

/** Switches a module off. Its tables and data stay, for when it is switched on again. */
export function disableModule(db: DatabaseSync, id: string) {
  db.prepare('DELETE FROM enabled_modules WHERE id = ?').run(id)
}

function migrate(db: DatabaseSync, module: NexitasModule) {
  const steps = module.migrations ?? []
  const row = db.prepare('SELECT version FROM modules WHERE id = ?').get(module.id) as
    | { version: number }
    | undefined
  let version = row?.version ?? 0
  if (version > steps.length)
    throw new Error(`This database requires a newer version of ${module.id}.`)
  for (; version < steps.length; version++) db.exec(steps[version]!)
  db.prepare(
    'INSERT INTO modules (id, version) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET version = excluded.version',
  ).run(module.id, version)
}

export function transaction<T>(db: DatabaseSync, run: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = run()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
