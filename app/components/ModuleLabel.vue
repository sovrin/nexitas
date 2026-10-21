<script setup lang="ts">
/** <ModuleLabel module="collatas" />
 *  A module's icon and name, from its app.config. `icon-only` keeps the name for screen readers
 *  and the tooltip, where a line has no room for it. */
const props = defineProps<{ module: string; iconOnly?: boolean }>()
const { modules } = useAppConfig().nexitas
// A module without an entry still shows, under its id.
const entry = computed(
  () => modules.find((known) => known.id === props.module) ?? { label: props.module, icon: 'box' },
)
</script>

<template>
  <span class="cluster gap-1 flex-nowrap">
    <i
      v-if="iconOnly"
      class="icon"
      :data-icon="entry.icon"
      role="img"
      :aria-label="entry.label"
      :data-tip="entry.label"
    ></i>
    <template v-else>
      <i class="icon" :data-icon="entry.icon" aria-hidden="true"></i>
      {{ entry.label }}
    </template>
  </span>
</template>
