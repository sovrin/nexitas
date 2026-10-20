<script setup lang="ts">
import type { StatusItem } from '../../shared/modules'
/** <StatusItems :items="status.items" />
 *  One module's items in a line, each a link where it leads somewhere. */
defineProps<{ items: readonly StatusItem[] }>()
</script>

<template>
  <span>
    <template v-for="(item, index) in items" :key="index">
      <template v-if="index"> · </template>
      <NuxtLink v-if="item.to" :to="item.to" class="link" data-quiet>{{ item.text }}</NuxtLink>
      <template v-else>{{ item.text }}</template>
    </template>
  </span>
</template>
