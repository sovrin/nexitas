<script setup lang="ts">
import type { ProjectSummary } from '../../shared/contracts'
import { errorMessage } from '../lib/format'
// Every project, with what each module says about it: what changed since last time, at a glance.
const { name } = useRuntimeConfig().public.nexitas
useHead({ title: `Projects · ${name}` })
const { data, error, refresh } = await useFetch<ProjectSummary[]>('/api/projects')
useLive(refresh)
</script>

<template>
  <div class="stack gap-5">
    <h1 class="sr-only">Projects</h1>
    <div v-if="error" class="alert" data-tone="danger" role="alert">
      <div><strong>Could not load your projects.</strong> {{ errorMessage(error) }}</div>
      <button type="button" class="btn" data-size="s" @click="refresh()">Try again</button>
    </div>
    <template v-else-if="data">
      <ul v-if="data.length" data-variant="plain" aria-label="Projects">
        <li v-for="project in data" :key="project.id" class="py-3 hairline-b">
          <div class="cluster gap-3 flex-nowrap">
            <span
              class="dot"
              :data-tone="
                project.status.flatMap((status) => status.items).find((item) => item.tone)?.tone
              "
              aria-hidden="true"
            ></span>
            <NuxtLink
              :to="`/projects/${project.id}`"
              class="link weight-600 flex-1 min-w-0 break-words"
              data-quiet
              >{{ project.name }}</NuxtLink
            >
            <span class="font-mono text-xs text-muted">{{ project.id }}</span>
          </div>
          <!-- Each module's line under its own name, so one module never reads as another's. -->
          <dl v-if="project.status.length" class="properties ps-4 pt-1 text-s">
            <template v-for="status in project.status" :key="status.module">
              <dt class="text-muted"><ModuleLabel :module="status.module" /></dt>
              <dd><StatusItems :items="status.items" /></dd>
            </template>
          </dl>
          <p v-else class="ps-4 text-s text-muted">no module in use yet</p>
        </li>
      </ul>
      <p v-else class="text-muted">
        No projects yet. Add one, then choose on its page what each module does for it.
      </p>
      <p><NuxtLink to="/projects/new" class="link">Add a project</NuxtLink></p>
    </template>
  </div>
</template>
