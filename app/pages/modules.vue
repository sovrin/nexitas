<script setup lang="ts">
import { errorMessage } from '../lib/format'
// What this install does: every module in the build, each switched on or off by the owner. Off,
// a module runs nothing and answers nothing; its data stays for when it is on again.
const { modules } = useAppConfig().nexitas
const { switches, refresh } = useModules()
useLive(refresh)
const state = (id: string) => switches.value.find((module) => module.id === id)

const pending = ref('')
const error = ref('')
async function toggle(id: string, enabled: boolean) {
  pending.value = id
  error.value = ''
  try {
    await $fetch(`/api/modules/${id}`, { method: 'POST', body: { enabled } })
    await refresh()
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    pending.value = ''
  }
}
</script>

<template>
  <AppPage title="Modules">
    <template #subtitle>Only what is on runs. Switching a module off keeps its data.</template>
    <AppAlert v-if="error" title="Could not switch the module.">{{ error }}</AppAlert>
    <!-- A switch per module is a preference, not a row to select: preference rows. -->
    <div v-if="modules.length" class="settings">
      <div v-for="module in modules" :key="module.id" class="setting">
        <div>
          <b :id="`module-${module.id}`"><ModuleLabel :module="module.id" /></b>
          <small :id="`module-${module.id}-what`"
            >{{ module.description }} <span class="font-mono">{{ module.id }}</span></small
          >
        </div>
        <span class="cluster gap-4 flex-nowrap text-s">
          <StateDot :tone="state(module.id)?.enabled ? 'success' : undefined">{{
            state(module.id)?.enabled
              ? 'On'
              : state(module.id)?.hasData
                ? 'Off · its data is kept'
                : 'Off'
          }}</StateDot>
          <input
            type="checkbox"
            role="switch"
            :checked="state(module.id)?.enabled"
            :disabled="pending === module.id"
            :aria-busy="pending === module.id || undefined"
            :aria-labelledby="`module-${module.id}`"
            :aria-describedby="`module-${module.id}-what`"
            @change="toggle(module.id, ($event.target as HTMLInputElement).checked)"
          />
        </span>
      </div>
    </div>
    <EmptyState v-else>This build has no modules.</EmptyState>
  </AppPage>
</template>
