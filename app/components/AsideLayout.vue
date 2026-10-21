<script setup lang="ts">
/** <AsideLayout>main<template #aside>beside it</template></AsideLayout>
 *  The main column with a narrower one beside it, below it on a phone. AppPage's `aside` slot is
 *  this; a component that needs it for itself (a form and its live preview) uses it directly. */
</script>

<template>
  <div class="with-aside">
    <!-- min-w-0: a wide table scrolls in its column instead of pushing the aside away. -->
    <div class="stack gap-5 min-w-0"><slot /></div>
    <aside class="stack gap-5"><slot name="aside" /></aside>
  </div>
</template>
