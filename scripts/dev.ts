// Runs an app built on nexitas for development, with its data in .data and a random installation
// key written there on first run.
//   node --import tsx ../nexitas/scripts/dev.ts <name> [port]
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const [name, port = process.env.PORT || '3000'] = process.argv.slice(2)
if (!name) {
  console.error('Name the app: dev.ts <name> [port].')
  process.exit(1)
}
const prefix = name.toUpperCase()
const dataDir = resolve(process.env[`${prefix}_DATA_DIR`] || '.data')
mkdirSync(dataDir, { recursive: true, mode: 0o700 })
const tokenPath = resolve(dataDir, 'bootstrap-token')
const token = process.env[`${prefix}_BOOTSTRAP_TOKEN`]
if (!token && !existsSync(tokenPath))
  writeFileSync(tokenPath, randomBytes(32).toString('base64url'), { mode: 0o600 })
const env = {
  ...process.env,
  [`${prefix}_DATA_DIR`]: dataDir,
  [`${prefix}_ORIGIN`]: process.env[`${prefix}_ORIGIN`] || `http://localhost:${port}`,
  [`${prefix}_BOOTSTRAP_TOKEN`]: token || readFileSync(tokenPath, 'utf8').trim(),
}
console.info(`${name} development: ${env[`${prefix}_ORIGIN`]}`)
console.info(`Initial setup key: ${token ? 'configured in environment' : tokenPath}`)
const child = spawn('pnpm', ['exec', 'nuxt', 'dev', '--host', '127.0.0.1', '--port', port], {
  env,
  stdio: 'inherit',
})
const stop = () => child.kill('SIGTERM')
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
child.on('exit', (code) => process.exit(code ?? 0))
