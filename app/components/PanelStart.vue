<script setup lang="ts">
/** <PanelStart label="Start content" failed="Could not start content." :start="start">
 *    No content yet. Start, and you get collections to write in.</PanelStart>
 *  A module's panel for a project it does nothing for yet: what starting gives, and the button.
 *  `start` makes it (a request); the panel refreshes itself after. */
const props = defineProps<{ label: string; failed: string; start: () => Promise<unknown> }>()
const { pending, error, submit } = useSubmit()
</script>

<template>
  <div class="stack gap-3">
    <EmptyState><slot /></EmptyState>
    <p>
      <button
        type="button"
        class="btn"
        data-size="s"
        :disabled="pending"
        :aria-busy="pending || undefined"
        @click="submit(props.start)"
      >
        {{ label }}
      </button>
    </p>
    <AppAlert v-if="error" :title="failed">{{ error }}</AppAlert>
  </div>
</template>
