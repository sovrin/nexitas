<script setup lang="ts">
import { setTheme } from '@aequitas/aequitas.js'

/** <ThemeSwitch v-model="theme" />
 *  aequitas' segmented choice of three; the current one is checked. Pass the server-known mode (the `ae-theme`
 *  cookie) so it paints in its final state. Changing it calls setTheme(), which updates
 *  <html data-theme>, localStorage and the cookie. */
type Mode = 'light' | 'dark' | 'auto'

const mode = defineModel<Mode>({ default: 'auto' })

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'auto', label: 'System' },
  { value: 'dark', label: 'Dark' },
] as const

function change(next: Mode) {
  mode.value = next
  setTheme(next)
}
</script>

<template>
  <div class="segmented" role="radiogroup" aria-label="Theme" data-size="s">
    <label v-for="option in OPTIONS" :key="option.value"
      ><input
        type="radio"
        name="theme"
        :checked="mode === option.value"
        @change="change(option.value)"
      /><span>{{ option.label }}</span></label
    >
  </div>
</template>
