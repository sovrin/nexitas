<script setup lang="ts">
/** <EmbedCode :code="snippet" />
 *  What a site puts in its pages to use a module (a tracker, a form, a request), with a Copy
 *  action. Long lines wrap, so the column never scrolls sideways. */
defineProps<{ code: string }>()
</script>

<template>
  <div class="stack gap-2">
    <div class="cluster justify-end">
      <CopyButton :text="code" label="Copy the snippet" />
    </div>
    <pre class="snippet font-mono text-xs"><code>{{ code }}</code></pre>
  </div>
</template>
