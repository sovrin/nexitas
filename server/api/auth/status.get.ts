import type { AuthStatus } from '../../../shared/contracts'
import { getOwner, sessionOwner } from '../../core/auth'
import { sessionCookie } from '../../utils/auth'
import { nexitasDatabase } from '../../utils/nexitas'

export default defineEventHandler((event): AuthStatus => {
  const db = nexitasDatabase()
  return {
    setupRequired: !getOwner(db),
    owner: sessionOwner(db, getCookie(event, sessionCookie())),
  }
})
