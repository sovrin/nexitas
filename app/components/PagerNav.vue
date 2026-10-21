<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { formatCount } from '../lib/format'
/** <PagerNav :page="page" :page-size="25" :total="total" :to="(page) => …" />
 *  A long list a page at a time, newest first: Newer, where it is, Older. The page lives in the
 *  address (`to`), so a reload or the back button keeps it. Nothing when it all fits. */
const props = defineProps<{
  page: number
  pageSize: number
  total: number
  to: (page: number) => RouteLocationRaw
}>()
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <nav v-if="pages > 1" class="cluster justify-between gap-4 text-s" aria-label="Pages">
    <NuxtLink v-if="page > 1" :to="to(page - 1)" class="link">Newer</NuxtLink>
    <span v-else></span>
    <span class="text-muted tabular"
      >{{ formatCount((page - 1) * pageSize + 1) }}–{{
        formatCount(Math.min(page * pageSize, total))
      }}
      of {{ formatCount(total) }}</span
    >
    <NuxtLink v-if="page < pages" :to="to(page + 1)" class="link">Older</NuxtLink>
    <span v-else></span>
  </nav>
</template>
