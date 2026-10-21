<script setup lang="ts">
import { errorMessage } from '../lib/format'

interface Crumb {
  label: string
  to: string
  mono?: boolean
}

/** <AppPage title="Inbox" failed="Could not load the inbox." :error="error" :retry="refresh">
 *  Every page's frame, the core's and each module's: its breadcrumb, its heading with a subtitle
 *  and actions, and its title in the tab. Within a module's section the breadcrumb starts at the
 *  section ("Content") and is left out on the section's own first page; `trail` adds the levels
 *  between. A load error takes the content's place, with "Try again" when `retry` is given.
 *  Slots: default, `subtitle`, `actions`, and `aside` for a column of settings beside it. */
const props = defineProps<{
  title: string
  /** A title one could type in a terminal (a key, an id): set mono. */
  mono?: boolean
  /** The tab's title, only where the heading cannot name the page alone: a project's page, whose
   *  name another project may share, is its id. Modules leave it out. */
  head?: string
  trail?: readonly Crumb[]
  error?: unknown
  /** What failed, for the load error: "Could not load the inbox." */
  failed?: string
  retry?: () => unknown
}>()
const slots = defineSlots<{
  default?: () => unknown
  subtitle?: () => unknown
  actions?: () => unknown
  aside?: () => unknown
}>()
const route = useRoute()
const { id: project } = useProject()
const { nav } = useAppConfig().nexitas
const section = computed(() =>
  nav
    .filter((entry) => entry.module)
    .map((entry) => ({ label: entry.label, to: `/p/${project.value}${entry.to}` }))
    .find((entry) => route.path === entry.to || route.path.startsWith(`${entry.to}/`)),
)
const crumbs = computed((): Crumb[] =>
  section.value && route.path !== section.value.to
    ? [section.value, ...(props.trail ?? [])]
    : [...(props.trail ?? [])],
)
useHead({
  title: () => {
    const own = props.head ?? props.title
    return section.value ? `${own} · ${project.value}` : own
  },
})
</script>

<template>
  <div class="stack gap-5">
    <nav v-if="crumbs.length" aria-label="Breadcrumb">
      <ol class="breadcrumb">
        <li v-for="crumb in crumbs" :key="crumb.to">
          <NuxtLink :to="crumb.to" :class="{ 'font-mono': crumb.mono }">{{ crumb.label }}</NuxtLink>
        </li>
        <li aria-current="page" :class="{ 'font-mono': mono }">{{ title }}</li>
      </ol>
    </nav>

    <!-- items-baseline: the actions' first line sits on the title's, so neither a subtitle nor
         tall actions (a search with its hint) move the other. -->
    <div class="page-header items-baseline">
      <div class="stack gap-1 min-w-0">
        <h1 class="text-xl weight-600 break-words" :class="{ 'font-mono': mono }">{{ title }}</h1>
        <p v-if="slots.subtitle" class="text-s text-muted"><slot name="subtitle" /></p>
      </div>
      <div v-if="slots.actions" class="cluster gap-3"><slot name="actions" /></div>
    </div>

    <AppAlert v-if="error" :title="failed ?? 'Could not load this page.'">
      {{ errorMessage(error) }}
      <template v-if="retry" #actions>
        <button type="button" class="btn" data-size="s" @click="retry()">Try again</button>
      </template>
    </AppAlert>
    <AsideLayout v-else-if="slots.aside">
      <slot />
      <template #aside><slot name="aside" /></template>
    </AsideLayout>
    <slot v-else />
  </div>
</template>
