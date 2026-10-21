<script setup lang="ts">
/** <AppSection title="Settings">…</AppSection>
 *  A named part of a page, under a small heading with a hairline: never a card. The `title` slot
 *  takes a heading with more than text (a module's icon); `actions` sits at the heading's other
 *  end, for what belongs to the part as a whole (its total, a Clear button). */
defineProps<{ title?: string }>()
const slots = defineSlots<{
  default?: () => unknown
  title?: () => unknown
  actions?: () => unknown
}>()
const id = useId()
</script>

<template>
  <section class="stack gap-3" :aria-labelledby="id">
    <div v-if="slots.actions" class="cluster justify-between gap-4 hairline-b pb-2">
      <h2 :id="id" class="text-s weight-600">
        <slot name="title">{{ title }}</slot>
      </h2>
      <span class="cluster gap-3 text-s"><slot name="actions" /></span>
    </div>
    <h2 v-else :id="id" class="text-s weight-600 hairline-b pb-2">
      <slot name="title">{{ title }}</slot>
    </h2>
    <slot />
  </section>
</template>
