<script setup lang="ts">
import type { ProjectSummary } from '../../shared/contracts'
import { idDiffers } from '../lib/projects'
import ThemeSwitch from './ae/ThemeSwitch.vue'
// Bumped by the release PR, so it names the release this build belongs to: the app's, not the
// layer's.
import { version } from '~~/package.json'

/** The console's left pane: which project is open, each of its modules with its hue and the one
 *  reading it gives (so the module that moved is found before it is opened), the install's own
 *  pages, and the owner's theme and sign-out. A rail under 64rem, a row on a phone. */
const emit = defineEmits<{ search: []; signOut: [] }>()
const route = useRoute()
const theme = useThemeMode()
const { name } = useRuntimeConfig().public.nexitas
const { project, projects, sections } = useSections()
const open = computed(() => projects.value?.find((known) => known.id === project.value))
// What each module says about the open project, live; its reading is the item marked `figure`.
// useRequestFetch, not $fetch: on the server it forwards the owner's session cookie.
const request = useRequestFetch()
const { data: summary, refresh } = await useAsyncData(
  () => `sidebar-${project.value}`,
  () =>
    project.value
      ? request<ProjectSummary>(`/api/projects/${project.value}`)
      : Promise.resolve(null),
)
useLive(refresh)
function reading(module: string) {
  const items = summary.value?.status.find((status) => status.module === module)?.items ?? []
  return {
    figure: items.find((item) => item.figure)?.figure,
    tone: items.find((item) => item.tone)?.tone,
  }
}
const at = (path: string) => (route.path === path ? 'page' : undefined)
</script>

<template>
  <nav class="sidebar" aria-label="Workspace">
    <button
      type="button"
      class="btn sidebar-switch"
      data-variant="ghost"
      popovertarget="project-menu"
      :aria-label="`Project: ${open?.name ?? 'none'}. Switch project`"
    >
      <LogoMark />
      <span class="sidebar-switch-name"
        ><strong class="truncate">{{ open?.name ?? name }}</strong>
        <small v-if="open && idDiffers(open)" class="font-mono text-muted truncate">{{
          open.id
        }}</small></span
      >
      <i
        class="icon text-muted sidebar-switch-name"
        data-icon="chevron-down"
        aria-hidden="true"
      ></i>
    </button>
    <div id="project-menu" class="menu" popover>
      <h6>Projects</h6>
      <NuxtLink
        v-for="known in projects"
        :key="known.id"
        :to="`/p/${known.id}`"
        :aria-pressed="known.id === project"
        data-close
        >{{ known.name }}
        <small v-if="idDiffers(known)" class="font-mono text-muted">{{ known.id }}</small></NuxtLink
      >
      <hr />
      <NuxtLink to="/projects/new" data-close
        ><i class="icon" data-icon="plus" aria-hidden="true"></i> Add a project</NuxtLink
      >
    </div>

    <a href="#" @click.prevent="emit('search')"
      ><i class="icon" data-icon="search" aria-hidden="true"></i><span>Search</span
      ><kbd class="end sidebar-label">⌘K</kbd></a
    >

    <template v-if="project">
      <h6>Project</h6>
      <NuxtLink :to="`/p/${project}`" :aria-current="at(`/p/${project}`)"
        ><i class="icon" data-icon="grid" aria-hidden="true"></i><span>Overview</span></NuxtLink
      >
      <NuxtLink
        v-for="section in sections"
        :key="section.module"
        :to="section.href"
        :data-accent="section.accent"
        :aria-current="section.current ? 'page' : undefined"
        ><i class="icon" :data-icon="section.icon" aria-hidden="true"></i
        ><span>{{ section.label }}</span
        ><span
          v-if="reading(section.module).figure"
          class="end sidebar-label cluster gap-2 flex-nowrap tabular font-mono"
          ><span
            v-if="reading(section.module).tone"
            class="dot"
            :data-tone="reading(section.module).tone"
            aria-hidden="true"
          ></span
          >{{ reading(section.module).figure }}</span
        ></NuxtLink
      >
    </template>

    <h6>Install</h6>
    <NuxtLink to="/" :aria-current="at('/')"
      ><i class="icon" data-icon="folder" aria-hidden="true"></i><span>Projects</span></NuxtLink
    >
    <NuxtLink to="/modules" :aria-current="at('/modules')"
      ><i class="icon" data-icon="puzzle" aria-hidden="true"></i><span>Modules</span></NuxtLink
    >

    <footer class="stack gap-3">
      <ThemeSwitch v-model="theme" />
      <div class="cluster justify-between gap-2 text-s">
        <span class="font-mono text-muted">v{{ version }}</span>
        <button type="button" class="link" @click="emit('signOut')">Sign out</button>
      </div>
    </footer>
  </nav>
</template>
