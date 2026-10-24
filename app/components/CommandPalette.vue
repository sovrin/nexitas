<script setup lang="ts">
import { setTheme } from '@aequitas/aequitas.js'
import { idDiffers } from '../lib/projects'

/** ⌘K (Ctrl K elsewhere): every place in the install and what can be done from anywhere, found
 *  by typing. aequitas.js filters, highlights and runs the options; this decides what they do.
 *  `open()` lets the sidebar's Search open it too. */
const emit = defineEmits<{ signOut: [] }>()
const theme = useThemeMode()
const { project, projects, sections } = useSections()
const dialog = ref<HTMLDialogElement>()

function open() {
  if (!dialog.value?.open) dialog.value?.showModal()
}
function go(to: string) {
  dialog.value?.close()
  return navigateTo(to)
}
function pickTheme(mode: 'light' | 'dark' | 'auto') {
  theme.value = mode
  setTheme(mode)
}

function onKey(event: KeyboardEvent) {
  if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    if (dialog.value?.open) dialog.value.close()
    else open()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="palette" data-light-dismiss aria-label="Go to, or run a command">
    <i class="icon" data-icon="search"></i>
    <input
      class="input"
      placeholder="Go to a project or module, or run a command…"
      aria-label="Search"
      autofocus
    />
    <div role="listbox" aria-label="Places and commands">
      <div v-if="sections.length" role="group" aria-label="This project">
        <h6 aria-hidden="true">This project</h6>
        <div role="option" data-close @click="go(`/p/${project}`)">
          <i class="icon" data-icon="grid"></i> Overview <small>{{ project }}</small>
        </div>
        <div
          v-for="section in sections"
          :key="section.module"
          role="option"
          data-close
          :data-accent="section.accent"
          :data-keywords="section.module"
          @click="go(section.href)"
        >
          <i class="icon" :data-icon="section.icon"></i> {{ section.label }}
          <small>{{ section.module }}</small>
        </div>
      </div>
      <div role="group" aria-label="Projects">
        <h6 aria-hidden="true">Projects</h6>
        <div
          v-for="known in projects"
          :key="known.id"
          role="option"
          data-close
          :data-keywords="known.id"
          @click="go(`/p/${known.id}`)"
        >
          <i class="icon" data-icon="folder"></i> {{ known.name }}
          <small v-if="idDiffers(known)" class="font-mono">{{ known.id }}</small>
        </div>
        <div role="option" data-close data-keywords="new create" @click="go('/projects/new')">
          <i class="icon" data-icon="plus"></i> Add a project
        </div>
      </div>
      <div role="group" aria-label="Install">
        <h6 aria-hidden="true">Install</h6>
        <div role="option" data-close @click="go('/')">
          <i class="icon" data-icon="folder"></i> All projects
        </div>
        <div role="option" data-close data-keywords="switch on off" @click="go('/modules')">
          <i class="icon" data-icon="puzzle"></i> Modules
        </div>
        <div role="option" data-close data-keywords="theme appearance" @click="pickTheme('dark')">
          <i class="icon" data-icon="moon"></i> Dark theme
        </div>
        <div role="option" data-close data-keywords="theme appearance" @click="pickTheme('light')">
          <i class="icon" data-icon="sun"></i> Light theme
        </div>
        <div
          role="option"
          data-close
          data-keywords="theme appearance os"
          @click="pickTheme('auto')"
        >
          <i class="icon" data-icon="circle-half"></i> Theme from the system
        </div>
        <div role="option" data-close data-keywords="log out leave" @click="emit('signOut')">
          <i class="icon" data-icon="log-out"></i> Sign out
        </div>
      </div>
    </div>
    <div class="empty" hidden>
      <h4>Nothing for “<span data-term></span>”</h4>
      <p>Try a project's name or id, a module, or a command.</p>
    </div>
    <footer>
      <span><kbd>↑</kbd><kbd>↓</kbd>Move</span><span><kbd>↵</kbd>Open</span
      ><span><kbd>Esc</kbd>Close</span>
    </footer>
  </dialog>
</template>
