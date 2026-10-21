<script setup lang="ts">
/** A modal confirmation on the native <dialog>. The confirm button closes it and emits `confirm`;
 *  Cancel, Esc and the close button leave it without side effects. Focus starts on Cancel. With
 *  `confirmWord` (a project's or a collection's id), confirming waits until it is typed: for what
 *  takes much with it and cannot be undone. */
const open = defineModel<boolean>('open', { required: true })
defineProps<{
  title: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger'
  disabled?: boolean
  confirmWord?: string
}>()
const emit = defineEmits<{ confirm: [] }>()
const dialog = ref<HTMLDialogElement>()
const id = useId()
const typed = ref('')
function sync(value: boolean) {
  if (!dialog.value) return
  if (value && !dialog.value.open) dialog.value.showModal()
  if (!value && dialog.value.open) dialog.value.close()
}
watch(open, sync, { flush: 'post' })
watch(open, (value) => {
  if (value) typed.value = ''
})
onMounted(() => sync(open.value))
function confirm() {
  open.value = false
  emit('confirm')
}
</script>
<template>
  <dialog
    ref="dialog"
    role="alertdialog"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="`${id}-description`"
    @close="open = false"
  >
    <div class="stack">
      <h2 :id="`${id}-title`" class="text-l weight-600">{{ title }}</h2>
      <p :id="`${id}-description`" class="text-muted"><slot name="description" /></p>
      <slot />
      <div v-if="confirmWord" class="field">
        <label :for="`${id}-word`"
          >Type <span class="font-mono">{{ confirmWord }}</span> to confirm</label
        >
        <input
          :id="`${id}-word`"
          v-model="typed"
          class="input font-mono text-s"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="cluster">
        <button
          type="button"
          class="btn"
          data-size="s"
          data-variant="primary"
          :data-tone="tone"
          :disabled="disabled || (!!confirmWord && typed !== confirmWord)"
          @click="confirm"
        >
          {{ confirmLabel }}
        </button>
        <button
          type="button"
          class="btn"
          data-size="s"
          data-variant="ghost"
          autofocus
          @click="open = false"
        >
          {{ cancelLabel || 'Cancel' }}
        </button>
      </div>
    </div>
  </dialog>
</template>
