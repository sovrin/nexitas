// Forgot the owner password? Removes the owner and every session, so /setup runs again with the
// installation key. What the modules keep stays.
//   node --import tsx ../nexitas/scripts/reset-owner.ts <name> --confirm
import { resolve } from 'node:path'
import { resetOwner } from '../server/core/auth'
import { openDatabase } from '../server/core/database'

const name = process.argv[2]
if (!name || name.startsWith('-')) {
  console.error('Name the app: reset-owner.ts <name> --confirm.')
  process.exit(1)
}
if (!process.argv.includes('--confirm')) {
  console.error('This signs out the owner and allows a new setup. Run it with --confirm.')
  process.exit(1)
}
const dataDir = resolve(process.env[`${name.toUpperCase()}_DATA_DIR`] || '.data')
// Only the core's tables are touched, so the modules' migrations need not run here.
resetOwner(openDatabase(resolve(dataDir, `${name}.sqlite`)))
console.info(`The owner is removed. Open ${name} to set it up again.`)
