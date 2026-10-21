import type { Project } from '../../shared/contracts'

/** The project everything under /p/<id>/ belongs to: its page and every module's pages there. Off
 *  it, the last one opened, which a cookie keeps across visits, else the first. Empty with no
 *  project. Pages read it here, never from the address themselves. */
export function useProject() {
  const route = useRoute()
  const last = useCookie<string | null>('nexitas-project', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 400,
  })
  const { data: projects, refresh } = useFetch<Project[]>('/api/projects', { key: 'projects' })
  const open = computed(() =>
    typeof route.params.project === 'string' ? route.params.project : undefined,
  )
  watch(
    open,
    (id) => {
      if (id) last.value = id
    },
    { immediate: true },
  )
  const id = computed(() => {
    if (open.value) return open.value
    const ids = projects.value?.map((project) => project.id) ?? []
    return last.value && ids.includes(last.value) ? last.value : (ids[0] ?? '')
  })
  return { id, projects, refresh }
}
