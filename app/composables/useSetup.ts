/** Whether a module's first page has its setup open (?setup): in the inspector, titled "Setup",
 *  beside the module's content. `<SetupLink>` opens it; AppPage's `aside-close` closes it. Both keep
 *  the page's other query (a filter, a search). */
export function useSetup() {
  const route = useRoute()
  const open = computed(() => route.query.setup !== undefined)
  const openLink = computed(() => ({ query: { ...route.query, setup: null } }))
  const close = computed(() => {
    const { setup: _, ...query } = route.query
    return { query }
  })
  return { open, openLink, close }
}
