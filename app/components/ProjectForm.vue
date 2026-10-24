<script setup lang="ts">
import type { Project } from '../../shared/contracts'
import { suggestProjectId } from '../lib/projects'

/** Adds a project, or changes one: its name and the origins its pages are served from. What each
 *  module does for it is set on the project's page, in the module's panel. */
const props = defineProps<{ project?: Project }>()
const emit = defineEmits<{ saved: [Project] }>()

const name = ref(props.project?.name ?? '')
const id = ref(props.project?.id ?? '')
const idTouched = ref(!!props.project)
// A new project's id follows its name until it is edited by hand.
watch(name, (value) => {
  if (!idTouched.value) id.value = suggestProjectId(value)
})
const origins = ref(props.project?.origins.join('\n') ?? '')

const { pending, error, issues, fieldError, submit } = useSubmit()

async function save() {
  const settings = {
    name: name.value,
    origins: origins.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  }
  const saved = await submit(() =>
    $fetch<Project>(props.project ? `/api/projects/${props.project.id}` : '/api/projects', {
      method: 'POST',
      body: props.project ? settings : { ...settings, id: id.value },
    }),
  )
  if (saved) emit('saved', saved)
}
</script>

<template>
  <form class="stack gap-5" @submit.prevent="save">
    <fieldset :disabled="pending" class="stack gap-5">
      <div class="field">
        <label for="name">Name</label>
        <input
          id="name"
          v-model="name"
          class="input"
          data-size="s"
          required
          maxlength="60"
          placeholder="sonotas"
          autocomplete="off"
          :aria-invalid="!!fieldError('name') || undefined"
        />
        <span v-if="fieldError('name')" data-error>{{ fieldError('name') }}</span>
      </div>
      <div class="field">
        <label for="id">Id</label>
        <input
          id="id"
          v-model="id"
          class="input font-mono text-s"
          data-size="s"
          required
          maxlength="40"
          autocomplete="off"
          spellcheck="false"
          :readonly="!!project"
          :aria-invalid="!!fieldError('id') || undefined"
          aria-describedby="id-help"
          @input="idTouched = true"
        />
        <small id="id-help">{{
          project
            ? 'Fixed: the snippets in its pages refer to it.'
            : 'Used by the snippets in its pages. It cannot change later.'
        }}</small>
        <span v-if="fieldError('id')" data-error>{{ fieldError('id') }}</span>
      </div>
      <div class="field">
        <label for="origins">Sites</label>
        <textarea
          id="origins"
          v-model="origins"
          class="input font-mono text-s"
          required
          spellcheck="false"
          placeholder="https://sonotas.example.com"
          :aria-invalid="!!fieldError('origins') || undefined"
          aria-describedby="origins-help"
        ></textarea>
        <small id="origins-help">One per line. Only pages from these may call its modules.</small>
        <span v-if="fieldError('origins')" data-error>{{ fieldError('origins') }}</span>
      </div>
    </fieldset>

    <FormIssues :error="error" :issues="issues" failed="Could not save the project." />

    <div class="cluster gap-3 hairline-t pt-5">
      <button
        type="submit"
        class="btn end"
        data-size="s"
        data-variant="primary"
        :disabled="pending"
        :aria-busy="pending || undefined"
      >
        {{ project ? 'Save changes' : 'Add project' }}
      </button>
    </div>
  </form>
</template>
