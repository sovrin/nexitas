<script setup lang="ts">
/** <EmbedCode :code="snippet" />
 *  What a site puts in its pages to use a module (a tracker, a form, a request), with a Copy
 *  action. Long lines wrap, so the column never scrolls sideways. */
defineProps<{ code: string }>()
</script>

<template>
  <!-- The copy button sits in the snippet's corner; the text keeps clear of it. -->
  <div class="relative">
    <pre class="snippet font-mono text-xs pe-7"><code>{{ code }}</code></pre>
    <CopyButton class="absolute top-0 end-0" :text="code" label="Copy the snippet" />
  </div>
</template>
