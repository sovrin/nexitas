<script setup lang="ts">
/** <StateDot tone="warning">3 new</StateDot>
 *  A state: its marker, coloured by `tone` (none for a quiet one), always before its word. */
defineProps<{ tone?: 'success' | 'warning' | 'danger' | 'info' }>()
</script>

<template>
  <span class="cluster gap-2 flex-nowrap"
    ><span class="dot" :data-tone="tone" aria-hidden="true"></span><slot
  /></span>
</template>
