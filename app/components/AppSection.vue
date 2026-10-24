<script setup lang="ts">
/** <AppSection title="Stack trace">…</AppSection>
 *  A named part of a pane, under a heading in small capitals: never a card. The `title` slot takes
 *  a heading with more than text (a module's icon); `actions` sits at the heading's other end, for
 *  what belongs to the part as a whole (its total, a Clear button). */
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
    <div class="cluster justify-between items-center gap-4">
      <h2 :id="id" class="eyebrow">
        <slot name="title">{{ title }}</slot>
      </h2>
      <span v-if="slots.actions" class="cluster gap-3 text-s"><slot name="actions" /></span>
    </div>
    <slot />
  </section>
</template>
