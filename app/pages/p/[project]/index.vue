<script setup lang="ts">
import type { ProjectSummary } from '../../../../shared/contracts'
import { errorMessage } from '../../../lib/format'

const id = useProject().id.value
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
  <AppPage
    :title="project?.name ?? id"
    :head="id"
    :trail="[{ label: 'Projects', to: '/' }]"
    failed="Could not load this project."
    :error="error"
  >
    <template v-if="project" #actions>
      <DangerAction
        label="Delete project"
        :title="`Delete ${id} and all it holds?`"
        :confirm-word="id"
        @confirm="remove"
      >
        Removes the project and everything every module keeps for it. Its snippets stop working.
        This cannot be undone.
      </DangerAction>
    </template>
    <AppAlert v-if="deleteError" title="Could not delete the project.">{{ deleteError }}</AppAlert>
    <!-- What the modules do for it takes the room; its own settings sit beside them. -->
    <!-- One under the other: side by side, a short panel left a hole beside a tall one. -->
    <div v-if="project" class="stack gap-6">
      <AppSection v-for="panel in panels" :key="panel.id">
        <template #title><ModuleLabel :module="panel.id" /></template>
        <!-- Panels are set small here, so none sizes its own text. -->
        <div class="text-s"><component :is="panel.component" :project="project" /></div>
      </AppSection>
      <EmptyState v-if="!panels.length">
        No module is on. Switch one on under Modules to use it for this project.
      </EmptyState>
    </div>

    <template v-if="project" #aside>
      <AppSection title="Settings">
        <AppAlert v-if="savedNotice" tone="success" title="Saved."
          >Every module uses the new settings from now on.</AppAlert
        >
        <ProjectForm
          :key="JSON.stringify([project.name, project.origins])"
          :project="project"
          @saved="saved"
        />
      </AppSection>
    </template>
  </AppPage>
</template>
