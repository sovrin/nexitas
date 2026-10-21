<script setup lang="ts">
import type { ProjectSummary } from '../../shared/contracts'
import { errorMessage } from '../lib/format'
// Every project, with what each module says about it: what changed since last time, at a glance.
const { name } = useRuntimeConfig().public.nexitas
useHead({ title: `Projects · ${name}` })
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
const tone = (project: ProjectSummary) =>
  project.status.flatMap((status) => status.items).find((item) => item.tone)?.tone
</script>

<template>
  <div class="stack gap-5">
    <div class="page-header">
      <h1 class="text-xl weight-600">Projects</h1>
      <NuxtLink to="/projects/new" class="btn" data-size="s" data-variant="primary"
        >Add a project</NuxtLink
      >
    </div>
    <div v-if="error" class="alert" data-tone="danger" role="alert">
      <div><strong>Could not load your projects.</strong> {{ errorMessage(error) }}</div>
      <button type="button" class="btn" data-size="s" @click="refresh()">Try again</button>
    </div>
    <template v-else-if="data">
      <div v-if="data.length" class="table-scroll">
        <table class="table" data-size="s">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Id</th>
              <th v-for="module in columns" :key="module.id" scope="col">
                <ModuleLabel :module="module.id" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in data" :key="project.id">
              <td>
                <span class="cluster gap-3 flex-nowrap">
                  <span class="dot" :data-tone="tone(project)" aria-hidden="true"></span>
                  <NuxtLink :to="`/p/${project.id}`" class="link weight-600">{{
                    project.name
                  }}</NuxtLink>
                </span>
              </td>
              <td class="font-mono text-s text-muted">{{ project.id }}</td>
              <td v-for="module in columns" :key="module.id" class="text-s">
                <StatusItems
                  v-if="items(project, module.id).length"
                  :items="items(project, module.id)"
                />
                <span v-else class="text-muted">–</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted">
        No projects yet. Add one, then choose on its page what each module does for it.
      </p>
    </template>
  </div>
</template>
