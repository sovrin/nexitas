import { revokeSession } from '../../core/auth'
import { sessionCookie } from '../../utils/auth'
import { nexitasDatabase } from '../../utils/nexitas'

export default defineEventHandler((event) => {
  revokeSession(nexitasDatabase(), getCookie(event, sessionCookie()))
  deleteCookie(event, sessionCookie(), { path: '/' })
  return { ok: true }
})
