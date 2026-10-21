<script setup lang="ts">
/** <DangerAction label="Delete entry" :title="`Delete ${slug}?`" @confirm="remove">
 *    Removes it from the API at once. This cannot be undone.</DangerAction>
 *  Something that cannot be undone: a quiet danger button, then a confirmation. `confirm-word`
 *  makes the owner type it first, for what takes much with it. The slot says what happens. */
// Its attributes (a class such as `end`) go to the button, not the dialog beside it.
defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    label: string
    title: string
    confirmLabel?: string
    confirmWord?: string
    pending?: boolean
  }>(),
  { confirmLabel: undefined, confirmWord: undefined },
)
const emit = defineEmits<{ confirm: [] }>()
const open = ref(false)
</script>

<template>
  <button
    type="button"
    class="btn"
    data-size="s"
    data-variant="ghost"
    data-tone="danger"
    :disabled="pending"
    :aria-busy="pending || undefined"
    v-bind="$attrs"
    @click="open = true"
  >
    {{ label }}
  </button>
  <ConfirmDialog
    v-model:open="open"
    :title="title"
    :confirm-label="confirmLabel ?? label"
    tone="danger"
    :confirm-word="confirmWord"
    @confirm="emit('confirm')"
  >
    <template #description><slot /></template>
  </ConfirmDialog>
</template>
