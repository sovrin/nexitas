<script setup lang="ts">
import { errorMessage } from '../lib/format'
// What this install does: every module in the build, each switched on or off by the owner. Off,
// a module runs nothing and answers nothing; its data stays for when it is on again.
useHead({ title: `Modules · ${useRuntimeConfig().public.nexitas.name}` })
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
  <div class="stack gap-5">
    <div class="stack gap-2">
      <h1 class="text-l weight-600">Modules</h1>
      <p class="text-muted">Only what is on runs. Switching a module off keeps its data.</p>
    </div>
    <div v-if="error" class="alert" data-tone="danger" role="alert">
      <div><strong>Could not switch the module.</strong> {{ error }}</div>
    </div>
    <ul v-if="modules.length" data-variant="plain" aria-label="Modules">
      <li v-for="module in modules" :key="module.id" class="py-3 hairline-b">
        <div class="cluster gap-3 flex-nowrap items-start">
          <div class="stack gap-1 flex-1 min-w-0">
            <span class="cluster gap-2">
              <span class="weight-600"><ModuleLabel :module="module.id" /></span>
              <span class="font-mono text-xs text-muted">{{ module.id }}</span>
            </span>
            <span class="text-s text-muted">{{ module.description }}</span>
            <span class="text-s text-muted">{{
              state(module.id)?.enabled
                ? 'On'
                : state(module.id)?.hasData
                  ? 'Off · its data is kept'
                  : 'Off'
            }}</span>
          </div>
          <input
            type="checkbox"
            role="switch"
            :checked="state(module.id)?.enabled"
            :disabled="pending === module.id"
            :aria-busy="pending === module.id || undefined"
            :aria-label="module.label"
            @change="toggle(module.id, ($event.target as HTMLInputElement).checked)"
          />
        </div>
      </li>
    </ul>
    <p v-else class="text-muted">This build has no modules.</p>
  </div>
</template>
