import type { H3Event } from 'h3'
import { createSession, sessionOwner } from '../core/auth'
import { createLimiter } from '../core/limits'
import { nexitasDatabase, nexitasName, nexitasOrigin, requestSender } from './nexitas'

/** The session cookie: named after the app, so two apps on one host never share it. */
export const sessionCookie = () => `${nexitasName()}_session`

// Ten sign-in or setup attempts per sender in 15 minutes, a hundred for everyone: a guesser gets
// nowhere, and one sender cannot lock the owner out.
// shortcut: in memory, so a restart starts the count again; keeping it in the database would put
// a sender's address (hashed) on disk. Persist it if restarts become a way in.
const perSender = createLimiter(10, 15 * 60 * 1000)
const everyone = createLimiter(100, 15 * 60 * 1000)

export function requireOwner(event: H3Event) {
  const owner = sessionOwner(nexitasDatabase(), getCookie(event, sessionCookie()))
  if (!owner) throw createError({ statusCode: 401, statusMessage: 'Sign in to continue.' })
  return owner
}

export function setOwnerSession(event: H3Event) {
  const session = createSession(nexitasDatabase())
  setCookie(event, sessionCookie(), session.token, {
    httpOnly: true,
    secure: nexitasOrigin().startsWith('https:'),
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.expiresAt),
  })
}

/** Counts a sign-in or setup attempt, and refuses it once the sender or everyone is out of them. */
export function checkAuthRate(event: H3Event, key: string) {
  if (!perSender.hit(`${key}:${requestSender(event)}`) || !everyone.hit(key))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many attempts. Try again in 15 minutes.',
    })
}
