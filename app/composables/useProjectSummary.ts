import type { ProjectSummary } from '../../shared/contracts'

/** What every module says about the open project, live. The sidebar and the project's overview
 *  read it at once: one key, so it is fetched once, and their two live refreshes join one request
 *  (`defer`). Empty with no project. */
export function useProjectSummary() {
  const { id } = useProject()
  const result = useFetch<ProjectSummary>(() => `/api/projects/${id.value}`, {
    key: () => `project-${id.value}`,
    enabled: () => !!id.value,
    dedupe: 'defer',
  })
  useLive(result.refresh)
  return result
}
