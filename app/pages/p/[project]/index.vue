<script setup lang="ts">
import type { ProjectActivity } from '../../../../shared/contracts'
import {
  errorMessage,
  formatAge,
  formatClock,
  formatDayName,
  formatTime,
  plural,
} from '../../../lib/format'

const id = useProject().id.value
// The sidebar reads the same summary, under the same key: fetched once for both.
const { data: project, error, refresh } = await useProjectSummary()
// Each switched-on module's part of the project, under its name and icon, in its hue. The panels
// are global components, so a name from the config resolves at runtime.
const allPanels = useAppConfig()
  .nexitas.modules.filter((module) => module.panel)
  .map((module) => ({
    id: module.id,
    accent: module.accent,
    component: resolveComponent(module.panel!),
  }))
const { enabled } = useModules()
const panels = computed(() => allPanels.filter((panel) => enabled.value.has(panel.id)))

// The project's story over the last two weeks, kept whole: what came after the owner last looked
// stands out, a marker shows where they left off, and the rest stays readable below it. The
// moment of the last visit lives in a cookie of theirs (nothing about anyone else); it stays
// fixed for this visit, so live updates join the new part, and the next visit starts from now.
const DAY = 24 * 60 * 60 * 1000
const seen = useCookie<number | null>(`nexitas-seen-${id}`, {
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 400,
})
const firstVisit = !seen.value
// A first visit counts what the whole story holds: the same two weeks it shows.
const since = Date.now() - 14 * DAY
const lastLooked = seen.value ?? since
const { data: activity, refresh: refreshActivity } = await useFetch<ProjectActivity>(
  `/api/projects/${id}/activity`,
  { query: { since } },
)
useLive(refreshActivity)
onMounted(() => (seen.value = Date.now()))

const { modules } = useAppConfig().nexitas
const accentOf = (module: string) => modules.find((known) => known.id === module)?.accent
const fresh = computed(() => (activity.value?.items ?? []).filter((item) => item.at > lastLooked))
// The story by UTC day, newest first. Events of one kind in a row from one module (four entries
// published at once) fold into one line that names them all, never across the marker.
type Event = ProjectActivity['items'][number] & { count: number; fresh: boolean }
type Line = Event | { mark: true; at: number }
const days = computed(() => {
  const lines: Line[] = []
  let marked = firstVisit
  for (const item of activity.value?.items ?? []) {
    const isFresh = item.at > lastLooked
    if (!isFresh && !marked) {
      if (fresh.value.length) lines.push({ mark: true, at: lastLooked })
      marked = true
    }
    const last = lines.at(-1)
    if (
      last &&
      !('mark' in last) &&
      last.module === item.module &&
      last.title === item.title &&
      last.fresh === isFresh &&
      formatDayName(last.at) === formatDayName(item.at)
    ) {
      last.count++
      last.detail = [last.detail, item.detail].filter(Boolean).join(', ')
    } else lines.push({ ...item, count: 1, fresh: isFresh })
  }
  const groups: { name: string; lines: Line[] }[] = []
  for (const line of lines) {
    const name = formatDayName(line.at)
    const group = groups.at(-1)
    if (group?.name === name) group.lines.push(line)
    else groups.push({ name, lines: [line] })
  }
  return groups
})
const headline = computed(() => {
  const when = firstVisit ? 'in the last two weeks' : 'since you last looked'
  return fresh.value.length
    ? `${plural(fresh.value.length, 'change')} ${when}`
    : `Nothing new ${when}`
})
// Each module's state now, in its hue: the line under the headline.
const states = computed(() =>
  (project.value?.status ?? []).filter((status) =>
    panels.value.some((p) => p.id === status.module),
  ),
)

// "Saved." stands until the settings are touched again.
const savedNotice = ref(false)
async function saved() {
  await refresh()
  savedNotice.value = true
}

const deleting = ref(false)
const deleteError = ref('')
async function remove() {
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/projects/${id}/delete`, { method: 'POST', body: {} })
    await navigateTo('/')
  } catch (cause) {
    deleteError.value = errorMessage(cause)
  } finally {
    deleting.value = false
  }
}

// The project's settings open beside the story on demand (?settings), so the story has the room.
const route = useRoute()
const settingsOpen = computed(() => route.query.settings !== undefined)
</script>

<template>
  <AppPage
    :title="project?.name ?? id"
    :head="id"
    :trail="[{ label: 'Projects', to: '/' }]"
    aside-title="Settings"
    :aside-close="settingsOpen ? { query: {} } : undefined"
    failed="Could not load this project."
    :error="error"
  >
    <!-- The news first: what changed since the owner last looked, then each module's state now,
         then the story of what happened, day by day. How to set the modules up waits below. -->
    <div v-if="project" class="stack gap-6">
      <AppLead :title="headline">
        <template #meta>
          <template v-if="firstVisit">From every module that is on.</template>
          <template v-else
            >Last looked {{ formatAge(lastLooked) }},
            <time :datetime="new Date(lastLooked).toISOString()">{{ formatTime(lastLooked) }}</time
            >. The last two weeks below.</template
          >
        </template>
        <ul
          v-if="states.length"
          class="stack gap-1 text-s"
          data-variant="plain"
          aria-label="Modules now"
        >
          <li
            v-for="state in states"
            :key="state.module"
            class="cluster gap-2"
            :data-accent="accentOf(state.module)"
          >
            <ModuleLabel :module="state.module" class="weight-600" />
            <StatusItems :items="state.items" />
          </li>
        </ul>
      </AppLead>

      <div v-if="days.length" class="stack gap-5">
        <AppSection v-for="day in days" :key="day.name" :title="day.name">
          <ol class="timeline">
            <template v-for="(line, index) in day.lines" :key="index">
              <!-- Where the owner left off: what is above came after. -->
              <li v-if="'mark' in line" class="text-muted">
                <time :datetime="new Date(line.at).toISOString()">{{ formatClock(line.at) }}</time>
                <div class="text-s">You last looked here</div>
              </li>
              <li
                v-else
                :data-accent="accentOf(line.module)"
                :class="{ 'text-muted': !line.fresh }"
              >
                <time :datetime="new Date(line.at).toISOString()">{{ formatClock(line.at) }}</time>
                <div>
                  <b class="cluster gap-2 flex-nowrap"
                    ><ModuleLabel :module="line.module" icon-only /><NuxtLink
                      v-if="line.to"
                      :to="line.to"
                      class="link"
                      data-quiet
                      >{{ line.title }}</NuxtLink
                    ><template v-else>{{ line.title }}</template
                    ><span v-if="line.count > 1" class="text-muted tabular">{{
                      line.count
                    }}</span></b
                  >
                  <p v-if="line.detail" class="break-words">{{ line.detail }}</p>
                </div>
              </li>
            </template>
          </ol>
        </AppSection>
      </div>
      <EmptyState v-else-if="panels.length">
        What the modules do shows up here as it happens.
      </EmptyState>

      <EmptyState v-if="!panels.length">
        No module is on. Switch one on under <NuxtLink to="/modules" class="link">Modules</NuxtLink>
        to use it for this project.
      </EmptyState>
      <!-- Setting a module up is done once; it waits here, folded, under its name. -->
      <AppSection v-else title="Set up">
        <div>
          <details
            v-for="panel in panels"
            :key="panel.id"
            class="accordion"
            :data-accent="panel.accent"
          >
            <summary><ModuleLabel :module="panel.id" /></summary>
            <!-- Panels are set small here, so none sizes its own text. -->
            <div class="text-s pb-4"><component :is="panel.component" :project="project" /></div>
          </details>
        </div>
      </AppSection>
    </div>

    <template v-if="project" #actions>
      <NuxtLink v-if="!settingsOpen" :to="{ query: { settings: null } }" class="btn" data-size="s"
        >Settings</NuxtLink
      >
    </template>
    <template v-if="project && settingsOpen" #aside>
      <AppAlert v-if="savedNotice" tone="success" title="Saved."
        >Every module uses the new settings from now on.</AppAlert
      >
      <ProjectForm
        :key="JSON.stringify([project.name, project.origins])"
        :project="project"
        @saved="saved"
        @input="savedNotice = false"
        @submit="savedNotice = false"
      />
    </template>
    <template v-if="project && settingsOpen" #danger>
      <span>Removes the project and everything every module keeps for it.</span>
      <DangerAction
        label="Delete project"
        :title="`Delete ${id} and all it holds?`"
        :confirm-word="id"
        :pending="deleting"
        @confirm="remove"
      >
        Its snippets stop working. This cannot be undone.
      </DangerAction>
      <AppAlert v-if="deleteError" class="w-full" title="Could not delete the project.">{{
        deleteError
      }}</AppAlert>
    </template>
  </AppPage>
</template>
