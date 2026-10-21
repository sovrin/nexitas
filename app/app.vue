<script setup lang="ts">
// Render the saved theme on the server, so the first paint is already final.
const theme = useThemeMode()
const { name } = useRuntimeConfig().public.nexitas
// Every page, a module's too, sets only its own part of the title; the app's name follows it.
useHead({
  title: name,
  titleTemplate: (title) => (title && title !== name ? `${title} · ${name}` : name),
  htmlAttrs: { 'data-theme': () => (theme.value === 'auto' ? undefined : theme.value) },
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
