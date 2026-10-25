<script setup lang="ts">
/** <SetupLink /> in a module's first page's `actions`: opens its setup (useSetup) in the inspector.
 *  Hidden while it is open. */
const { open, openLink } = useSetup()
</script>

<template>
  <NuxtLink v-if="!open" :to="openLink" class="btn" data-size="s">Setup</NuxtLink>
</template>
