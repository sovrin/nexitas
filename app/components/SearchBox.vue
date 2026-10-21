<script setup lang="ts">
/** <SearchBox v-model="text" label="Search feedback: words, a sender tag" @search="go" />
 *  A list's search: Enter, or clearing the field, searches. `mono` for a query syntax one types
 *  as in a terminal (status:unresolved); the `hint` slot says what it understands, under the
 *  field while one types; other attributes go to the field. */
defineOptions({ inheritAttrs: false })
const text = defineModel<string>({ required: true })
withDefaults(
  defineProps<{ label: string; maxlength?: number; placeholder?: string; mono?: boolean }>(),
  {
    maxlength: undefined,
    placeholder: 'Search',
  },
)
const emit = defineEmits<{ search: [] }>()
const slots = defineSlots<{ hint?: () => unknown }>()
const hint = useId()
</script>

<template>
  <form role="search" class="search-box" @submit.prevent="emit('search')">
    <input
      v-model="text"
      class="input text-s"
      :class="{ 'font-mono': mono }"
      data-size="s"
      type="search"
      :placeholder="placeholder"
      :aria-label="label"
      :maxlength="maxlength"
      :aria-describedby="slots.hint ? hint : undefined"
      v-bind="$attrs"
      @search="emit('search')"
    />
    <small v-if="slots.hint" :id="hint" class="field-hint text-muted"><slot name="hint" /></small>
  </form>
</template>
