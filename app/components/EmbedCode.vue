<script setup lang="ts">
/** <EmbedCode :code="snippet" />
 *  What a site puts in its pages to use a module (a tracker, a form), with an icon Copy action.
 *  Long lines wrap, so the column never scrolls sideways. */
// caption: still accepted from callers, but the snippet shows without one.
const props = withDefaults(defineProps<{ code: string; caption?: string }>(), { caption: 'HTML' })
const copied = ref(false)
let reset: ReturnType<typeof setTimeout> | undefined
async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  clearTimeout(reset)
  reset = setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="stack gap-2">
    <div class="cluster justify-end">
      <button
        type="button"
        class="btn"
        data-icon
        data-size="s"
        data-variant="ghost"
        :aria-label="copied ? 'Copied' : 'Copy the snippet'"
        :data-tip="copied ? 'Copied' : 'Copy the snippet'"
        @click="copy"
      >
        <i class="icon" :data-icon="copied ? 'check' : 'copy'"></i>
      </button>
    </div>
    <pre class="snippet font-mono text-xs"><code>{{ code }}</code></pre>
  </div>
</template>
