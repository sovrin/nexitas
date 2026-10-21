<script setup lang="ts">
import type { ModuleStatus } from '../../shared/modules'
// The heartbeat on every signed-in page: what each module reports about the project, in one line,
// each part behind its module's icon.
const props = defineProps<{ project: string }>()
const { data, refresh } = useFetch<ModuleStatus[]>('/api/status', {
  key: 'status-line',
  query: { project: toRef(props, 'project') },
  server: false,
  lazy: true,
})
useLive(refresh)
// Refresh on navigation too, so the line never contradicts the page that just loaded.
const route = useRoute()
watch(
  () => route.fullPath,
  () => refresh(),
)
const tone = computed(
  () => data.value?.flatMap((status) => status.items).find((item) => item.tone)?.tone,
)
</script>
<template>
  <!-- One small mono line under the page. It truncates rather than wraps. -->
  <p class="cluster gap-2 flex-nowrap font-mono text-xs text-muted" aria-label="Status">
    <span class="dot" :data-tone="tone" aria-hidden="true"></span>
    <span class="cluster gap-3 flex-nowrap flex-1 min-w-0 truncate" role="status">
      <template v-if="data">
        <span v-for="status in data" :key="status.module" class="cluster gap-1 flex-nowrap">
          <ModuleLabel :module="status.module" icon-only />
          <StatusItems :items="status.items" />
        </span>
        <template v-if="!data.length">nothing to report</template>
      </template>
      <template v-else>loading</template>
    </span>
  </p>
</template>
