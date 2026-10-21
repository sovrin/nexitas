<script setup lang="ts">
// Everything of one project lives under /p/<id>/: its page, and every module's section of it.
// Here a project that does not exist is not found, for all of them; below, pages take the
// project from useProject().
const id = useProject().id.value
const { error } = await useFetch(`/api/projects/${id}`, { pick: ['id'] })
if (error.value)
  throw createError({
    statusCode: error.value.statusCode,
    statusMessage: error.value.statusMessage,
    fatal: true,
  })
</script>

<template>
  <NuxtPage />
</template>
