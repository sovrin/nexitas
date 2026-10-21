<script setup lang="ts">
/** <AppAlert title="Could not delete the entry.">{{ error }}</AppAlert>
 *  A message in its tone: danger (what failed, said first in bold), success ("Saved."), warning or
 *  info. Danger and warning interrupt a screen reader; the others wait. `actions` holds a button. */
const props = withDefaults(
  defineProps<{ title: string; tone?: 'danger' | 'warning' | 'success' | 'info' }>(),
  { tone: 'danger' },
)
const role = computed(() => (['danger', 'warning'].includes(props.tone) ? 'alert' : 'status'))
</script>

<template>
  <div class="alert" :data-tone="tone" :role="role">
    <div>
      <strong>{{ title }}</strong> <slot />
    </div>
    <slot name="actions" />
  </div>
</template>
