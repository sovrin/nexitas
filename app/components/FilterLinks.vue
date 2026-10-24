<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
/** <FilterLinks label="Show" :options="[{ label: 'Open', to: …, current: true }]" />
 *  Which part of a list shows, as links (the choice lives in the address, so reload and the back
 *  button keep it): the current one in ink, the rest quiet. Goes in AppPage's `filters`. */
defineProps<{
  label: string
  options: readonly { label: string; to: RouteLocationRaw; current: boolean }[]
}>()
</script>

<template>
  <span class="cluster gap-3 text-s" role="group" :aria-label="label">
    <NuxtLink
      v-for="option in options"
      :key="option.label"
      :to="option.to"
      class="link"
      :data-quiet="option.current ? undefined : ''"
      :aria-current="option.current ? 'page' : undefined"
      >{{ option.label }}</NuxtLink
    >
  </span>
</template>
