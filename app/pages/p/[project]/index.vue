<script setup lang="ts">
import type { ProjectSummary } from '../../../../shared/contracts'
import { errorMessage } from '../../../lib/format'

const id = useProject().id.value
useHead({ title: `${id} · ${useRuntimeConfig().public.nexitas.name}` })
const { data: project, error, refresh } = await useFetch<ProjectSummary>(`/api/projects/${id}`)
useLive(refresh)
// Each switched-on module's part of the project, under its name and icon. The panels are global components,
// so a name from the config resolves at runtime.
const allPanels = useAppConfig()
  .nexitas.modules.filter((module) => module.panel)
  .map((module) => ({ id: module.id, component: resolveComponent(module.panel!) }))
const { enabled } = useModules()
const panels = computed(() => allPanels.filter((panel) => enabled.value.has(panel.id)))

const savedNotice = ref(false)
async function saved() {
  await refresh()
  savedNotice.value = true
}

const deleteOpen = ref(false)
const typed = ref('')
const deleteError = ref('')
async function remove() {
  deleteError.value = ''
  try {
    await $fetch(`/api/projects/${id}/delete`, { method: 'POST', body: {} })
    await navigateTo('/')
  } catch (cause) {
    deleteError.value = errorMessage(cause)
  }
}
</script>

<template>
  <div class="stack gap-5">
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumb">
        <li><NuxtLink to="/">Projects</NuxtLink></li>
        <li aria-current="page" class="font-mono">{{ id }}</li>
      </ol>
    </nav>

    <div v-if="error" class="alert" data-tone="danger" role="alert">
      <div><strong>Could not load this project.</strong> {{ errorMessage(error) }}</div>
    </div>
    <template v-else-if="project">
      <div class="page-header">
        <h1 class="text-xl weight-600">{{ project.name }}</h1>
        <button
          type="button"
          class="btn"
          data-size="s"
          data-variant="ghost"
          data-tone="danger"
          @click="deleteOpen = true"
        >
          Delete project
        </button>
      </div>
      <div v-if="deleteError" class="alert" data-tone="danger" role="alert">
        <div><strong>Could not delete the project.</strong> {{ deleteError }}</div>
      </div>

      <!-- What the modules do for it takes the room; its own settings sit beside them. -->
      <div class="with-aside">
        <div class="grid">
          <section
            v-for="panel in panels"
            :key="panel.id"
            class="stack gap-3"
            :aria-labelledby="`${panel.id}-title`"
          >
            <h2 :id="`${panel.id}-title`" class="text-s weight-600 hairline-b pb-2">
              <ModuleLabel :module="panel.id" />
            </h2>
            <component :is="panel.component" :project="project" />
          </section>
          <p v-if="!panels.length" class="text-muted">
            No module is on. Switch one on under Modules to use it for this project.
          </p>
        </div>

        <aside class="stack gap-3" aria-labelledby="settings-title">
          <h2 id="settings-title" class="text-s weight-600 hairline-b pb-2">Settings</h2>
          <div v-if="savedNotice" class="alert" data-tone="success" role="status">
            <div><strong>Saved.</strong> Every module uses the new settings from now on.</div>
          </div>
          <ProjectForm
            :key="JSON.stringify([project.name, project.origins])"
            :project="project"
            @saved="saved"
          />
        </aside>
      </div>
    </template>

    <ConfirmDialog
      v-model:open="deleteOpen"
      :title="`Delete ${id} and all it holds?`"
      confirm-label="Delete project"
      tone="danger"
      :disabled="typed !== id"
      @confirm="remove"
    >
      <template #description
        >Removes the project and everything every module keeps for it. Its snippets stop working.
        This cannot be undone.</template
      >
      <div class="field">
        <label for="confirm-id"
          >Type <span class="font-mono">{{ id }}</span> to confirm</label
        >
        <input id="confirm-id" v-model="typed" class="input font-mono text-s" autocomplete="off" />
      </div>
    </ConfirmDialog>
  </div>
</template>
