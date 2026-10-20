<script setup lang="ts">
import type { ProjectSummary } from '../../../shared/contracts'
import { errorMessage } from '../../lib/format'

const id = useRoute().params.id as string
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
  <div>
    <nav aria-label="Breadcrumb" class="mb-5">
      <ol class="breadcrumb">
        <li><NuxtLink to="/">Projects</NuxtLink></li>
        <li aria-current="page" class="font-mono">{{ id }}</li>
      </ol>
    </nav>

    <div v-if="error" class="alert" data-tone="danger" role="alert">
      <div><strong>Could not load this project.</strong> {{ errorMessage(error) }}</div>
    </div>
    <div v-else-if="project" class="stack gap-6">
      <h1 class="text-l weight-600">{{ project.name }}</h1>

      <section
        v-for="panel in panels"
        :key="panel.id"
        class="stack gap-3"
        :aria-labelledby="`${panel.id}-title`"
      >
        <h2 :id="`${panel.id}-title`" class="text-s weight-600">
          <ModuleLabel :module="panel.id" />
        </h2>
        <component :is="panel.component" :project="project" />
      </section>

      <section class="stack gap-3 hairline-t pt-5" aria-labelledby="settings-title">
        <h2 id="settings-title" class="text-s weight-600">Settings</h2>
        <div v-if="savedNotice" class="alert" data-tone="success" role="status">
          <div><strong>Saved.</strong> Every module uses the new settings from now on.</div>
        </div>
        <ProjectForm
          :key="JSON.stringify([project.name, project.origins])"
          :project="project"
          @saved="saved"
        />
      </section>

      <section class="stack gap-3 hairline-t pt-5" aria-labelledby="delete-title">
        <h2 id="delete-title" class="text-s weight-600">Delete</h2>
        <p class="text-s text-muted">
          Removes the project and everything every module keeps for it. Its snippets stop working.
        </p>
        <p>
          <button type="button" class="link text-danger" @click="deleteOpen = true">
            Delete {{ project.id }}
          </button>
        </p>
        <div v-if="deleteError" class="alert" data-tone="danger" role="alert">
          <div><strong>Could not delete the project.</strong> {{ deleteError }}</div>
        </div>
      </section>
    </div>

    <ConfirmDialog
      v-model:open="deleteOpen"
      :title="`Delete ${id} and all it holds?`"
      confirm-label="Delete project"
      tone="danger"
      :disabled="typed !== id"
      @confirm="remove"
    >
      <template #description>This cannot be undone.</template>
      <div class="field">
        <label for="confirm-id"
          >Type <span class="font-mono">{{ id }}</span> to confirm</label
        >
        <input id="confirm-id" v-model="typed" class="input font-mono text-s" autocomplete="off" />
      </div>
    </ConfirmDialog>
  </div>
</template>
