<script setup lang="ts">
import type { Project } from '../../../shared/contracts'
useHead({ title: `Add a project · ${useRuntimeConfig().public.nexitas.name}` })
const saved = (project: Project) => navigateTo(`/projects/${project.id}`)
</script>

<template>
  <div>
    <nav aria-label="Breadcrumb" class="mb-5">
      <ol class="breadcrumb">
        <li><NuxtLink to="/">Projects</NuxtLink></li>
        <li aria-current="page">Add</li>
      </ol>
    </nav>
    <h1 class="text-l weight-600 mb-5">Add a project</h1>
    <ProjectForm @saved="saved" />
  </div>
</template>
