import type { ModuleSwitch } from '../../shared/contracts'

/** Which modules the owner has on, for the shell to show only those. One fetch per page load,
 *  shared by every caller; the Modules page refreshes it after a switch. */
export function useModules() {
  const { data, refresh } = useFetch<ModuleSwitch[]>('/api/modules', {
    key: 'modules',
    default: () => [],
  })
  const enabled = computed(
    () => new Set(data.value.filter((module) => module.enabled).map((module) => module.id)),
  )
  return { switches: data, enabled, refresh }
}
