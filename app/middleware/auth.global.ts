import type { AuthStatus } from '../../shared/contracts'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useState<AuthStatus | null>('auth', () => null)
  // Signed in already: the check runs beside the page's own requests instead of before them, and
  // a session that ended meanwhile still lands on the sign-in page.
  if (import.meta.client && auth.value?.owner && !['/setup', '/login'].includes(to.path)) {
    const nuxtApp = useNuxtApp()
    $fetch<AuthStatus>('/api/auth/status')
      .then((status) => {
        auth.value = status
        if (!status.owner) return nuxtApp.runWithContext(() => navigateTo('/login'))
      })
      .catch(() => {})
    return
  }
  auth.value = await useRequestFetch()<AuthStatus>('/api/auth/status')
  if (auth.value.setupRequired && to.path !== '/setup') return navigateTo('/setup')
  if (!auth.value.setupRequired && !auth.value.owner && to.path !== '/login')
    return navigateTo('/login')
  if (auth.value.owner && ['/setup', '/login'].includes(to.path)) return navigateTo('/')
})
