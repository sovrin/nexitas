<script setup lang="ts">
import ThemeSwitch from '../components/ae/ThemeSwitch.vue'
import { errorMessage } from '../lib/format'
// Bumped by the release PR, so it names the release this build belongs to: the app's, not the
// layer's.
import { version } from '~~/package.json'
const route = useRoute()
const theme = useThemeMode()
const { name } = useRuntimeConfig().public.nexitas
const { id: project, projects, refresh: refreshProjects } = useProject()
// A project added or deleted joins the picker or leaves it on the next page.
watch(
  () => route.path,
  () => refreshProjects(),
)
// The sections every module adds in its app.config, those of modules switched off left out. A
// module's section is the project's, under /p/<id>, and needs one.
const { nav } = useAppConfig().nexitas
const { enabled } = useModules()
const within = (path: string, module?: string) => (module ? `/p/${project.value}${path}` : path)
const current = (to: string, paths: readonly string[] = []) =>
  route.path === to || paths.some((path) => route.path.startsWith(path))
const sections = computed(() =>
  nav
    .filter((section) => !section.module || (enabled.value.has(section.module) && project.value))
    .map((section) => ({
      ...section,
      href: within(section.to, section.module),
      // A module's section holds its pages below it, such as one entry.
      current: current(
        within(section.to, section.module),
        (section.module ? [section.to, ...(section.paths ?? [])] : section.paths)?.map((path) =>
          within(path, section.module),
        ),
      ),
    })),
)
/** Another project: the same section of it, or its page from anywhere else. */
function choose(next: string) {
  const section = sections.value.find((section) => section.module && section.current)
  return navigateTo(section ? `/p/${next}${section.to}` : `/p/${next}`)
}
const signingOut = ref(false)
const error = ref('')
async function logout() {
  signingOut.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/logout', { method: 'POST', body: {} })
    clearNuxtData()
    await navigateTo('/login')
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <!-- One bar on top for where to go, one at the bottom for how things stand; the page between
       them sits in aequitas' container, which the navbar lines up with. -->
  <div class="page">
    <header class="navbar">
      <strong class="cluster gap-2 flex-nowrap"><LogoMark />{{ name }}</strong>
      <nav class="cluster gap-4" aria-label="Main">
        <NuxtLink
          v-for="section in sections.filter((section) => !section.module)"
          :key="section.to"
          :to="section.href"
          :aria-current="section.current ? 'page' : undefined"
          >{{ section.label }}</NuxtLink
        >
        <!-- The project the sections after it show. -->
        <template v-if="sections.some((section) => section.module)">
          <span class="select"
            ><select
              class="input"
              data-size="s"
              aria-label="Project"
              @change="choose(($event.target as HTMLSelectElement).value)"
            >
              <!-- selected, not the select's value: that one is lost in the server's HTML. -->
              <option
                v-for="option in projects"
                :key="option.id"
                :value="option.id"
                :selected="option.id === project"
              >
                {{ option.name }}
              </option>
            </select></span
          >
          <NuxtLink
            v-for="section in sections.filter((section) => section.module)"
            :key="section.to"
            :to="section.href"
            class="cluster gap-1 flex-nowrap"
            :aria-current="section.current ? 'page' : undefined"
            ><ModuleLabel :module="section.module!" icon-only />{{ section.label }}</NuxtLink
          >
        </template>
      </nav>
      <span class="cluster gap-4 flex-nowrap">
        <NuxtLink to="/modules" :aria-current="current('/modules') ? 'page' : undefined"
          >Modules</NuxtLink
        >
        <button
          type="button"
          class="btn"
          data-size="s"
          data-variant="ghost"
          :disabled="signingOut"
          :aria-busy="signingOut || undefined"
          @click="logout"
        >
          Sign out
        </button>
      </span>
    </header>
    <main id="main" class="container py-5" tabindex="-1">
      <AppAlert v-if="error" class="mb-5" title="Could not sign out.">{{ error }}</AppAlert>
      <slot />
    </main>
    <footer class="statusbar">
      <StatusLine class="flex-1 min-w-0" :project="project" />
      <ThemeSwitch v-model="theme" />
      <span class="font-mono">v{{ version }}</span>
    </footer>
  </div>
</template>
