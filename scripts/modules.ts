// Fills .modules/ with the modules modules.json names: each a shallow clone at its ref, with its
// packages installed. A folder that is a symlink (your own checkout, for working on a module) is
// left as it is. Plain Node, not a pnpm script: pnpm installs before it runs a script, and
// nexitas' install prepares the app, which needs the modules there.
//   node scripts/modules.ts
import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readFileSync, symlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = dirname(import.meta.dirname)
const manifest: Record<string, string> = JSON.parse(
  readFileSync(resolve(root, 'modules.json'), 'utf8'),
)
const run = (command: string, args: string[]) => execFileSync(command, args, { stdio: 'inherit' })
mkdirSync(resolve(root, '.modules'), { recursive: true })

for (const [id, spec] of Object.entries(manifest)) {
  const match = /^github:([\w.-]+\/[\w.-]+)#(.+)$/.exec(spec)
  if (!/^[a-z][a-z0-9-]*$/.test(id) || id === 'nexitas' || !match)
    throw new Error(`modules.json: write ${id} as "github:owner/repository#ref".`)
  const [, repository, ref] = match as unknown as [string, string, string]
  const dir = resolve(root, '.modules', id)
  if (existsSync(dir) && lstatSync(dir).isSymbolicLink()) {
    console.info(`${id}: your checkout, left as it is.`)
    continue
  }
  if (existsSync(dir)) {
    run('git', ['-C', dir, 'fetch', '--depth', '1', 'origin', ref])
    run('git', ['-C', dir, 'checkout', '--detach', 'FETCH_HEAD'])
  } else
    run('git', [
      'clone',
      '--depth',
      '1',
      '--branch',
      ref,
      `https://github.com/${repository}.git`,
      dir,
    ])
  run('pnpm', ['--dir', dir, 'install', '--frozen-lockfile'])
  console.info(`${id}: ${spec}`)
}

// A module's tsconfig.json finds nexitas' types at ../nexitas/.nuxt, as in a checkout of the module
// next to nexitas. Inside .modules/ that path is this link to nexitas' own .nuxt (only .nuxt, so
// nothing leads back into .modules/). Vite reads each module's tsconfig and stops at a missing one.
const types = resolve(root, '.modules', 'nexitas', '.nuxt')
mkdirSync(dirname(types), { recursive: true })
try {
  lstatSync(types)
} catch {
  symlinkSync('../../.nuxt', types)
}
