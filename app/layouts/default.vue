<script setup lang="ts">
import { errorMessage } from '../lib/format'

// The console: the sidebar's pane and the page beside it, which brings its own inspector when it
// has one (AppPage). ⌘K reaches everything from anywhere.
const route = useRoute()
const { refresh: refreshProjects } = useProject()
// A project added or deleted joins the switcher or leaves it on the next page.
watch(
  () => route.path,
  () => refreshProjects(),
)
const palette = ref<{ open: () => void }>()

const error = ref('')
async function signOut() {
  error.value = ''
  try {
    await $fetch('/api/auth/logout', { method: 'POST', body: {} })
    clearNuxtData()
    await navigateTo('/login')
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="shell" data-collapsible>
    <AppSidebar @search="palette?.open()" @sign-out="signOut" />
    <main id="main" tabindex="-1">
      <AppAlert v-if="error" class="m-5" title="Could not sign out.">{{ error }}</AppAlert>
      <slot />
    </main>
  </div>
  <CommandPalette ref="palette" @sign-out="signOut" />
</template>
