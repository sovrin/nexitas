<script setup lang="ts">
import type { Project } from '../../../shared/contracts'
useHead({ title: `Add a project · ${useRuntimeConfig().public.nexitas.name}` })
const saved = (project: Project) => navigateTo(`/p/${project.id}`)
</script>

<template>
  <div class="stack gap-5">
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumb">
        <li><NuxtLink to="/">Projects</NuxtLink></li>
        <li aria-current="page">Add</li>
      </ol>
    </nav>
    <div class="page-header">
      <h1 class="text-xl weight-600">Add a project</h1>
    </div>
    <!-- A form reads best at a line's length, however wide the window. -->
    <div class="measure">
      <ProjectForm @saved="saved" />
    </div>
  </div>
</template>
