import type { UseFetchOptions } from 'nuxt/app'

/** What a module's page reads from its API, for the open project: `/feedback` fetches
 *  /api/p/<id>/feedback. Live unless `live: false` (a form a refresh would reset while the owner
 *  types), so the page follows every change. The project comes from here, never from a query. */
export function useProjectFetch<T>(
  path: string,
  {
    live = true,
    query,
    key,
  }: { live?: boolean; query?: UseFetchOptions<T>['query']; key?: string } = {},
) {
  const { id } = useProject()
  const result = useFetch<T>(`/api/p/${id.value}${path}`, { query, key })
  if (live) useLive(result.refresh)
  return result
}
