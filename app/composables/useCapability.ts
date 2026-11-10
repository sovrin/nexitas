import type { Capabilities } from '../../shared/capabilities'

/** Whether a switched-on module provides `name` (see capabilities.ts), for a page to offer what
 *  depends on it only then. */
export function useCapability(name: keyof Capabilities) {
  const { switches } = useModules()
  return computed(() =>
    switches.value.some((module) => module.enabled && module.provides.includes(name)),
  )
}
