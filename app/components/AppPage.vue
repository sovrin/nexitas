<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { errorMessage } from '../lib/format'

interface Crumb {
  label: string
  to: string
  mono?: boolean
}

/** <AppPage title="Inbox" failed="Could not load the inbox." :error="error" :retry="refresh">
 *  Every page's frame, the core's and each module's: a pane whose header line holds where it sits
 *  (the trail), what it is, its state and its actions, and, with an `aside`, an inspector pane
 *  beside it for the item in hand or the page's settings. Within a module's section the pane
 *  takes the module's hue, the trail starts at the section ("Content") and is left out on its own
 *  first page. A load error takes the content's place, with "Try again" when `retry` is given.
 *  What cannot be undone goes in `danger`: alone at the inspector's foot, or the page's. A list's
 *  status links and search go in `filters`, the row under the header line; an `<AppLead>` that
 *  should stand above them goes in `lead`. The inspector is headed by a label (`aside-title`), or
 *  by the item in hand's own name (`aside-name`, with `aside-mono` for an identifier):
 *  <AppPage title="Translations" :aside-name="key" aside-mono>. An inspector that can be closed
 *  (an item, settings opened on demand) names where closing goes (`aside-close`): a ✕ in its
 *  header, and Escape.
 *  Slots: default, `subtitle`, `actions`, `lead`, `filters`, `aside`, `danger`. */
const props = defineProps<{
  title: string
  /** A title one could type in a terminal (a key, an id): set mono. */
  mono?: boolean
  /** The tab's title, only where the heading cannot name the page alone: a project's page, whose
   *  name another project may share, is its id. Modules leave it out. */
  head?: string
  trail?: readonly Crumb[]
  error?: unknown
  /** The inspector's label, when nothing in it names what it holds ("Settings", "Delivery"). */
  asideTitle?: string
  /** The item in the inspector by its own name ("Checkout fails on Safari"): its heading in place
   *  of a label, so nothing under it repeats the name. */
  asideName?: string
  /** The aside's name is an identifier one could type (a key, a slug): set mono. */
  asideMono?: boolean
  /** Where closing the inspector goes: the list without its item, the page without its settings. */
  asideClose?: RouteLocationRaw
  /** What failed, for the load error: "Could not load the inbox." */
  failed?: string
  retry?: () => unknown
}>()
const slots = defineSlots<{
  default?: () => unknown
  subtitle?: () => unknown
  actions?: () => unknown
  lead?: () => unknown
  filters?: () => unknown
  aside?: () => unknown
  danger?: () => unknown
}>()
const route = useRoute()
const { project, current: section } = useSections()
// The section leads the trail below its first page, unless the page is still titled by it (a
// list with one of its items open beside it).
const crumbs = computed((): Crumb[] =>
  section.value && route.path !== section.value.href && props.title !== section.value.label
    ? [{ label: section.value.label, to: section.value.href }, ...(props.trail ?? [])]
    : [...(props.trail ?? [])],
)
const inspector = computed(() => !!slots.aside && !props.error)
// Escape closes the inspector, unless something else that is open (a dialog, a menu) takes it.
function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented || !props.asideClose || !inspector.value)
    return
  if (document.querySelector('dialog[open], [popover]:popover-open')) return
  navigateTo(props.asideClose)
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
useHead({
  title: () => {
    const own = props.head ?? props.title
    return section.value ? `${own} · ${project.value}` : own
  },
})
</script>

<template>
  <!-- A shell of its own inside the console's main column: the page's pane, and its inspector.
       Both open with a bar of one height, so their seam runs straight across. -->
  <div
    class="shell"
    :data-inspector="inspector ? '' : undefined"
    :data-closable="inspector && asideClose ? '' : undefined"
    :data-accent="section?.accent"
  >
    <div class="main">
      <header class="pane-bar page-header items-center hairline-b px-5">
        <div class="cluster items-baseline gap-2 min-w-0">
          <template v-if="crumbs.length">
            <nav aria-label="Breadcrumb">
              <ol class="breadcrumb text-l">
                <li v-for="crumb in crumbs" :key="crumb.to">
                  <NuxtLink :to="crumb.to" :class="{ 'font-mono': crumb.mono }">{{
                    crumb.label
                  }}</NuxtLink>
                </li>
              </ol>
            </nav>
            <span class="text-l text-muted" aria-hidden="true">/</span>
          </template>
          <h1 class="text-l weight-600 break-words min-w-0" :class="{ 'font-mono': mono }">
            {{ title }}
          </h1>
          <span v-if="slots.subtitle" class="text-s text-muted"><slot name="subtitle" /></span>
        </div>
        <div v-if="slots.actions" class="cluster gap-2"><slot name="actions" /></div>
      </header>

      <div class="stack gap-5 p-5">
        <slot v-if="!error" name="lead" />
        <!-- The filters belong to the list under them, so they sit closer to it than to the lead. -->
        <div class="stack gap-3">
          <div v-if="slots.filters && !error" class="page-filters cluster items-center gap-4">
            <slot name="filters" />
          </div>
          <AppAlert v-if="error" :title="failed ?? 'Could not load this page.'">
            {{ errorMessage(error) }}
            <template v-if="retry" #actions>
              <button type="button" class="btn" data-size="s" @click="retry()">Try again</button>
            </template>
          </AppAlert>
          <div v-else class="stack gap-5"><slot /></div>
        </div>

        <footer v-if="slots.danger && !inspector && !error" class="danger-zone">
          <slot name="danger" />
        </footer>
      </div>
    </div>

    <aside v-if="inspector" class="inspector" :aria-label="asideName ?? asideTitle ?? 'Details'">
      <header class="pane-bar hairline-b px-5 gap-3">
        <h2
          v-if="asideName"
          class="text-m weight-600 break-words min-w-0"
          :class="{ 'font-mono': asideMono }"
        >
          {{ asideName }}
        </h2>
        <h2 v-else-if="asideTitle" class="eyebrow">{{ asideTitle }}</h2>
        <NuxtLink
          v-if="asideClose"
          :to="asideClose"
          class="btn end"
          data-size="s"
          data-variant="ghost"
          aria-label="Close"
          ><i class="icon" data-icon="x" aria-hidden="true"></i
        ></NuxtLink>
      </header>
      <div class="stack gap-5 p-5">
        <slot name="aside" />
        <footer v-if="slots.danger" class="danger-zone"><slot name="danger" /></footer>
      </div>
    </aside>
  </div>
</template>
