<script setup lang="ts">
/** <AppLead title="2 new feedback">…</AppLead>
 *  What a page leads with: what needs the owner, as one plain sentence at the page's largest size,
 *  a muted line of context under it (`meta`), and what belongs to it below (a state row). The
 *  project's overview and every module's first page open with one, so the answer to "what
 *  changed, what needs me?" always sits in the same place. */
defineProps<{ title: string }>()
const slots = defineSlots<{ default?: () => unknown; meta?: () => unknown }>()
const id = useId()
</script>

<template>
  <section class="stack gap-4" :aria-labelledby="id">
    <div class="stack gap-2">
      <h2 :id="id" class="text-xl weight-600">{{ title }}</h2>
      <p v-if="slots.meta" class="text-s text-muted"><slot name="meta" /></p>
    </div>
    <slot />
  </section>
</template>
