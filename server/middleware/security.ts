import type { H3Event } from 'h3'
import type { PublicRoute } from '../../shared/modules'
import { requireOwner } from '../utils/auth'
import { nexitasModules, nexitasName, nexitasOrigin } from '../utils/nexitas'

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
// A form or a module's settings are a few kB. Checked here, not left to whichever proxy is in
// front.
const MAX_BODY = 64 * 1024

export default defineEventHandler((event) => {
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'Referrer-Policy', 'same-origin')
  // shortcut: no script-src, since Nuxt inlines its config script; add nonces if pages ever
  // render HTML from what others send.
  setHeader(
    event,
    'Content-Security-Policy',
    "object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  )
  const path = event.path.split('?')[0]!
  const reads = ['GET', 'HEAD', 'OPTIONS'].includes(event.method)
  const open = findPublicRoute(path)
  if (open) {
    // Nuxt renders an error as a page unless the request asks for JSON, and the page's sign-in
    // redirect would answer a refused call with a 302.
    if (open.route.json) event.node.req.headers.accept = 'application/json'
    if (!reads) limitBody(event, open.route.maxBody ?? MAX_BODY)
    setHeader(event, 'Cache-Control', 'no-store')
    return open.route.guard?.(event, open.match)
  }
  if (!reads) limitBody(event, MAX_BODY)
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
})

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
