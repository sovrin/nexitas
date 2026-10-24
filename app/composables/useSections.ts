/** The open project's module sections, as the sidebar, the ⌘K palette and every page frame see
 *  them: those of modules switched on, each with its address under /p/<id>, its hue and icon, and
 *  whether the route is inside it. Empty with no project. */
export function useSections() {
  const route = useRoute()
  const { id: project, projects, refresh } = useProject()
  const { nav, modules } = useAppConfig().nexitas
  const { enabled } = useModules()

  const sections = computed(() => {
    if (!project.value) return []
    const base = `/p/${project.value}`
    return nav
      .filter((entry) => entry.module && enabled.value.has(entry.module))
      .map((entry) => {
        const module = modules.find((known) => known.id === entry.module)
        const href = `${base}${entry.to}`
        const inside = [entry.to, ...(entry.paths ?? [])].map((path) => `${base}${path}`)
        return {
          module: entry.module!,
          label: entry.label,
          href,
          icon: module?.icon ?? 'box',
          accent: module?.accent,
          current: inside.some((path) => route.path === path || route.path.startsWith(`${path}/`)),
        }
      })
  })
  const current = computed(() => sections.value.find((section) => section.current))
  return { project, projects, refresh, sections, current }
}
