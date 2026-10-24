<script setup lang="ts">
import type { Project } from '../../../shared/contracts'
const saved = (project: Project) => navigateTo(`/p/${project.id}`)
</script>

<template>
  <AppPage title="New project" :trail="[{ label: 'Projects', to: '/' }]">
    <!-- A form reads best at a line's length, however wide the window. -->
    <div class="measure">
      <ProjectForm @saved="saved" />
    </div>
  </AppPage>
</template>
