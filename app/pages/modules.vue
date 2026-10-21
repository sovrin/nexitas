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
    <DataTable v-if="modules.length">
      <thead>
        <tr>
          <th scope="col">Module</th>
          <th scope="col">Id</th>
          <th scope="col">What it does</th>
          <th scope="col">State</th>
          <th scope="col"><span class="sr-only">On</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="module in modules" :key="module.id">
          <td class="weight-600"><ModuleLabel :module="module.id" /></td>
          <td class="font-mono text-s text-muted">{{ module.id }}</td>
          <td class="text-s text-muted">{{ module.description }}</td>
          <td class="text-s">
            <StateDot :tone="state(module.id)?.enabled ? 'success' : undefined">{{
              state(module.id)?.enabled
                ? 'On'
                : state(module.id)?.hasData
                  ? 'Off · its data is kept'
                  : 'Off'
            }}</StateDot>
          </td>
          <td>
            <input
              type="checkbox"
              role="switch"
              :checked="state(module.id)?.enabled"
              :disabled="pending === module.id"
              :aria-busy="pending === module.id || undefined"
              :aria-label="module.label"
              @change="toggle(module.id, ($event.target as HTMLInputElement).checked)"
            />
          </td>
        </tr>
      </tbody>
    </DataTable>
    <EmptyState v-else>This build has no modules.</EmptyState>
  </AppPage>
</template>
