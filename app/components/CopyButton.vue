<script setup lang="ts">
/** <CopyButton :text="token" label="Copy the token" />
 *  An icon button that copies `text`, and says so for two seconds. */
const props = withDefaults(defineProps<{ text: string; label?: string }>(), { label: 'Copy' })
const copied = ref(false)
let reset: ReturnType<typeof setTimeout> | undefined
async function copy() {
  await navigator.clipboard.writeText(props.text)
  copied.value = true
  clearTimeout(reset)
  reset = setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <button
    type="button"
    class="btn"
    data-icon
    data-size="s"
    data-variant="ghost"
    :aria-label="copied ? 'Copied' : label"
    :data-tip="copied ? 'Copied' : label"
    @click="copy"
  >
    <i class="icon" :data-icon="copied ? 'check' : 'copy'" aria-hidden="true"></i>
  </button>
</template>
