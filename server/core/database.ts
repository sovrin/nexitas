import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { NexitasModule } from '../../shared/modules'

// The core's own tables, as a module of its own. They come after the modules' and use IF NOT
// EXISTS, because the apps that moved onto nexitas create them in a released step of their own.
export const core: NexitasModule = {
  id: 'nexitas',
  migrations: [
    `CREATE TABLE IF NOT EXISTS owner (id INTEGER PRIMARY KEY CHECK (id = 1), email TEXT NOT NULL, password_hash TEXT NOT NULL);
     CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);`,
  ],
}

/** Opens the database at `file` and brings the core and every module up to date, in one
 *  transaction: a step that fails leaves the database as it was. */
export function openDatabase(file: string, modules: readonly NexitasModule[] = []) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 })
  const db = new DatabaseSync(file)
  db.exec('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  try {
    transaction(db, () => {
      // Each module's schema version, so modules can be added to an app and grow on their own.
      db.exec(
        'CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, version INTEGER NOT NULL) WITHOUT ROWID',
      )
      for (const module of [...modules, core]) migrate(db, module)
    })
  } catch (error) {
    db.close()
    throw error
  }
  return db
}

function migrate(db: DatabaseSync, module: NexitasModule) {
  const steps = module.migrations ?? []
  const row = db.prepare('SELECT version FROM modules WHERE id = ?').get(module.id) as
    | { version: number }
    | undefined
  let version = row?.version ?? (module.adoptsUserVersion ? userVersion(db) : 0)
  if (version > steps.length)
    throw new Error(`This database requires a newer version of ${module.id}.`)
  for (; version < steps.length; version++) db.exec(steps[version]!)
  db.prepare(
    'INSERT INTO modules (id, version) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET version = excluded.version',
  ).run(module.id, version)
}

const userVersion = (db: DatabaseSync) =>
  (db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version

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
