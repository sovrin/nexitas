import type { H3Event } from 'h3'
import { projectAllows } from '../core/projects'
import { nexitasDatabase } from './nexitas'

// CORS for a module's public routes (PublicRoute.guard). Two kinds: a route the project's own
// pages call (a form, a report), open to exactly its origins; and a read API that a token, not
// the origin, guards (content, translations), open to every origin. Both answer a preflight with
// the value the guard returns.

interface CorsOptions {
  /** What a preflight may ask for: 'GET, POST'. */
  methods: string
  /** What a refused request is told: "This site may not send feedback to this app." */
  refusal: string
  /** Servers send no Origin: let them through to the route's own check (a key), unrefused. */
  originless?: boolean
}

/** Allows exactly the origins of `projectId`'s project, and refuses everyone else, a project that
 *  is not found (undefined) included. Without an Origin there is no CORS header, so a page
 *  elsewhere cannot read the answer either. */
export function projectCors(
  event: H3Event,
  projectId: string | undefined,
  { methods, refusal, originless }: CorsOptions,
) {
  const origin = getHeader(event, 'origin')
  if (!origin && originless) return undefined
  if (!origin || !projectId || !projectAllows(nexitasDatabase(), projectId, origin))
    throw createError({ statusCode: 403, statusMessage: refusal })
  setHeaders(event, { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' })
  return preflight(event, methods, 'content-type')
}

/** Any origin may read: the route checks a token instead (requireBearer). Anything but a read is
 *  refused with `refusal`: "The content API only reads." */
export function readOnlyCors(event: H3Event, refusal: string) {
  setHeaders(event, { 'Access-Control-Allow-Origin': '*', Vary: 'Origin' })
  if (event.method === 'OPTIONS') return preflight(event, 'GET', 'authorization')
  if (event.method !== 'GET' && event.method !== 'HEAD')
    throw createError({ statusCode: 405, statusMessage: refusal })
  return undefined
}

function preflight(event: H3Event, methods: string, headers: string) {
  if (event.method !== 'OPTIONS') return undefined
  setHeaders(event, {
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': headers,
    'Access-Control-Max-Age': '600',
  })
  setResponseStatus(event, 204)
  return ''
}
