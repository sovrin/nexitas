<script setup lang="ts">
import type { Project } from '../../shared/contracts'
import { errorMessage } from '../lib/format'

/** Adds a project, or changes one: its name and the origins its pages are served from. What each
 *  module does for it is set on the project's page, in the module's panel. */
const props = defineProps<{ project?: Project }>()
const emit = defineEmits<{ saved: [Project] }>()

const name = ref(props.project?.name ?? '')
const id = ref(props.project?.id ?? '')
const idTouched = ref(!!props.project)
// A new project's id follows its name until it is edited by hand.
watch(name, (value) => {
  if (!idTouched.value)
    id.value = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^[^a-z]+|-+$/g, '')
      .slice(0, 40)
})
const origins = ref(props.project?.origins.join('\n') ?? '')

const pending = ref(false)
const error = ref('')
const issues = ref<{ path: string; message: string }[]>([])
const fieldError = (path: string) =>
  issues.value.find((issue) => issue.path === path || issue.path.startsWith(`${path}.`))?.message

async function save() {
  pending.value = true
  error.value = ''
  issues.value = []
  const settings = {
    name: name.value,
    origins: origins.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  }
  try {
    const saved = await $fetch<Project>(
      props.project ? `/api/projects/${props.project.id}` : '/api/projects',
      { method: 'POST', body: props.project ? settings : { ...settings, id: id.value } },
    )
    emit('saved', saved)
  } catch (cause) {
    const data = (cause as { data?: { data?: { issues?: typeof issues.value } } }).data?.data
    if (data?.issues?.length) issues.value = data.issues
    else error.value = errorMessage(cause)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <form class="stack gap-5" @submit.prevent="save">
    <fieldset :disabled="pending" class="stack gap-5">
      <dl class="properties">
        <dt><label for="name">Name</label></dt>
        <dd class="field items-stretch">
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
        </dd>
        <dt><label for="id">Id</label></dt>
        <dd class="field items-stretch">
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
        </dd>
        <dt><label for="origins">Sites</label></dt>
        <dd class="field items-stretch">
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
        </dd>
      </dl>
    </fieldset>

    <div v-if="issues.length || error" class="alert" data-tone="danger" role="alert">
      <div>
        <template v-if="error"><strong>Could not save the project.</strong> {{ error }}</template>
        <template v-else>
          <strong>Check these settings.</strong>
          <ul>
            <li v-for="issue in issues" :key="issue.path">
              <span class="font-mono">{{ issue.path }}</span
              >: {{ issue.message }}
            </li>
          </ul>
        </template>
      </div>
    </div>

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
