<script setup lang="ts">
// The shell's home page with no module in it; an app or module puts its own at /.
const { nav } = useAppConfig().nexitas
</script>
<template>
  <div class="stack gap-3">
    <h1 class="text-l weight-600">Nothing here yet.</h1>
    <p v-if="!nav.length" class="text-muted">Extend nexitas with a module to fill this page.</p>
    <ul v-else class="stack gap-2">
      <li v-for="section in nav" :key="section.to">
        <NuxtLink :to="section.to" class="link">{{ section.label }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
