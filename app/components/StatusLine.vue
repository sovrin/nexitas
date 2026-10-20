<script setup lang="ts">
import type { StatusItem } from '../../shared/modules'
// The heartbeat on every signed-in page: what each module reports, in one line.
const { data, refresh } = useFetch<StatusItem[]>('/api/status', {
  key: 'status-line',
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
const tone = computed(() => data.value?.find((item) => item.tone)?.tone)
</script>
<template>
  <!-- One small mono line under the page. It truncates rather than wraps. -->
  <p class="cluster gap-2 flex-nowrap font-mono text-xs text-muted" aria-label="Status">
    <span class="dot" :data-tone="tone" aria-hidden="true"></span>
    <span class="flex-1 min-w-0 truncate" role="status">
      <template v-if="data">
        <template v-for="(item, index) in data" :key="index">
          <template v-if="index"> · </template>
          <NuxtLink v-if="item.to" :to="item.to" class="link" data-quiet>{{ item.text }}</NuxtLink>
          <template v-else>{{ item.text }}</template>
        </template>
        <template v-if="!data.length">nothing to report</template>
      </template>
      <template v-else>loading</template>
    </span>
  </p>
</template>
