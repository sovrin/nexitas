<script setup lang="ts">
/** <StateDot tone="warning">3 new</StateDot>
 *  A state: its marker, coloured by `tone` (none for a quiet one), always before its word. Inline,
 *  so it can sit in a sentence ("34,590 in 30 days · 17 refused"). */
defineProps<{ tone?: 'success' | 'warning' | 'danger' | 'info' }>()
</script>

<template>
  <span class="inline-flex items-center gap-2"
    ><span class="dot" :data-tone="tone" aria-hidden="true"></span><slot
  /></span>
</template>
