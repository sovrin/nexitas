<script setup lang="ts">
import type { ProjectSummary } from '../../shared/contracts'
import { idDiffers } from '../lib/projects'
// Every project, with what each module says about it: what changed since last time, at a glance.
const { data, error, refresh } = await useFetch<ProjectSummary[]>('/api/projects', {
  key: 'projects',
})
useLive(refresh)
// One column per module that is on, so a module's line always sits under its own name.
const { modules } = useAppConfig().nexitas
const { enabled } = useModules()
const columns = computed(() => modules.filter((module) => enabled.value.has(module.id)))
const items = (project: ProjectSummary, module: string) =>
  project.status.find((status) => status.module === module)?.items ?? []
</script>

<template>
  <AppPage title="Projects" failed="Could not load your projects." :error="error" :retry="refresh">
    <template #actions>
      <NuxtLink to="/projects/new" class="btn" data-size="s" data-variant="primary"
        >New project</NuxtLink
      >
    </template>
    <template v-if="data">
      <DataTable v-if="data.length">
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th v-for="module in columns" :key="module.id" scope="col">
              <ModuleLabel :module="module.id" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in data" :key="project.id">
            <td>
              <div class="stack gap-1">
                <NuxtLink :to="`/p/${project.id}`" class="link weight-600">{{
                  project.name
                }}</NuxtLink>
                <small v-if="idDiffers(project)" class="font-mono text-muted">{{
                  project.id
                }}</small>
              </div>
            </td>
            <td v-for="module in columns" :key="module.id" class="text-s">
              <StatusItems
                v-if="items(project, module.id).length"
                :items="items(project, module.id)"
              />
              <span v-else class="text-muted">–</span>
            </td>
          </tr>
        </tbody>
      </DataTable>
      <EmptyState v-else>
        No projects yet. Add one, then choose on its page what each module does for it.
      </EmptyState>
    </template>
  </AppPage>
</template>
