import type { H3Event } from 'h3'
import type { PublicRoute } from '../../shared/modules'
import { requireOwner } from '../utils/auth'
import { enabledModuleIds } from '../core/database'
import { getProject } from '../core/projects'
import { nexitasDatabase, nexitasModules, nexitasName, nexitasOrigin } from '../utils/nexitas'

// Two kinds of API live here. /api/* is the owner's: their session, and for writes the app's exact
// origin. A module's public routes are open on purpose, each with its own guard. Pages themselves
// hold no data; the auth middleware in app/ sends a visitor to sign in.
// Exact paths, never a prefix: /api/auth/../sites must not pass as open because it starts right.
const OPEN_API = new Set([
  '/api/health',
  '/api/auth/status',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/setup',
])
// A form or a module's settings are a few kB; a module that takes more says so (maxBody). Checked
// here, not left to whichever proxy is in front.
const MAX_BODY = 64 * 1024

export default defineEventHandler((event) => {
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'Referrer-Policy', 'same-origin')
  if (nexitasOrigin().startsWith('https:'))
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000')
  // shortcut: no script-src, since Nuxt inlines its config script; add nonces if pages ever
  // render HTML from what others send.
  setHeader(
    event,
    'Content-Security-Policy',
    "object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  )
  // The router drops a trailing slash before it finds the handler; match the same path, or
  // /v1/…/feedback/ would reach a public route's handler without its guard.
  const path = event.path.split('?')[0]!.replace(/\/$/, '') || '/'
  const reads = ['GET', 'HEAD', 'OPTIONS'].includes(event.method)
  const open = findPublicRoute(path)
  // A module the owner switched off answers nothing, as if it were not there: JSON for its API and
  // public routes, the not-found page for its pages. Its static files (a form's or tracker's
  // script) still load, but find nothing to call.
  const owner = findModule(path)
  if (owner && !enabledModuleIds(nexitasDatabase()).has(owner.id)) {
    if (open || path.startsWith('/api/')) event.node.req.headers.accept = 'application/json'
    throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
  }
  if (open) {
    // Nuxt renders an error as a page unless the request asks for JSON, and the page's sign-in
    // redirect would answer a refused call with a 302.
    if (open.route.json) event.node.req.headers.accept = 'application/json'
    if (!reads) limitBody(event, open.route.maxBody ?? MAX_BODY)
    setHeader(event, 'Cache-Control', 'no-store')
    return open.route.guard?.(event, open.match)
  }
  if (!reads) limitBody(event, owner?.maxBody ?? MAX_BODY)
  if (!path.startsWith('/api/')) return
  setHeader(event, 'Cache-Control', 'no-store')
  if (!reads) {
    // Compare with a configured origin, never with caller-controlled forwarded headers.
    if (getHeader(event, 'origin') !== nexitasOrigin())
      throw createError({
        statusCode: 403,
        statusMessage: `This request did not come from ${nexitasName()}.`,
      })
    // A DELETE carries no body to type.
    if (
      event.method !== 'DELETE' &&
      !getHeader(event, 'content-type')?.startsWith('application/json')
    )
      throw createError({ statusCode: 415, statusMessage: 'Send application/json.' })
  }
  if (!OPEN_API.has(path)) requireOwner(event)
  // A project's API: /api/p/<id>/… is about that project, which must exist. Found once here, so
  // no module looks it up, or takes it from a query, on its own.
  const scoped = /^\/api\/p\/([^/]+)\//.exec(path)
  if (scoped) {
    const project = getProject(nexitasDatabase(), scoped[1]!)
    if (!project) throw createError({ statusCode: 404, statusMessage: 'There is no such project.' })
    event.context.project = project
  }
})

/** The module a path belongs to, by its paths or its public routes; the database is only asked
 *  when one does. A project's paths are the module's as its own: /p/<id>/feedback as /feedback,
 *  /api/p/<id>/feedback as /api/feedback. */
function findModule(path: string) {
  const own = path.replace(/^(\/api)?\/p\/[^/]+(?=\/)/, '$1')
  return nexitasModules().find(
    (module) =>
      module.paths?.some((prefix) => own === prefix || own.startsWith(`${prefix}/`)) ||
      module.publicRoutes?.some((route) =>
        typeof route.path === 'string' ? route.path === path : route.path.test(path),
      ),
  )
}

function findPublicRoute(
  path: string,
): { route: PublicRoute; match: RegExpExecArray | null } | undefined {
  for (const module of nexitasModules())
    for (const route of module.publicRoutes ?? []) {
      if (route.path === path) return { route, match: null }
      const match = typeof route.path === 'string' ? null : route.path.exec(path)
      if (match) return { route, match }
    }
  return undefined
}

/** A body must announce its length, and stay under `max`. Browsers always send the length for
 *  these requests; a body without one (chunked) could grow without end before it is read. */
function limitBody(event: H3Event, max: number) {
  const length = Number(getHeader(event, 'content-length') ?? Number.NaN)
  if (Number.isNaN(length))
    throw createError({ statusCode: 411, statusMessage: 'Send the body with a Content-Length.' })
  if (length > max)
    throw createError({ statusCode: 413, statusMessage: 'This request is too large.' })
}
