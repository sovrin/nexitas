<script setup lang="ts">
/** <DataTable label="Feedback"><thead>…</thead><tbody>…</tbody></DataTable>
 *  A table at the suite's size, scrolling sideways on its own when it must. Attributes such as
 *  data-fixed go to the table. */
defineOptions({ inheritAttrs: false })
defineProps<{ label?: string }>()
</script>

<template>
  <div class="table-scroll">
    <table class="table" data-size="s" :aria-label="label" v-bind="$attrs">
      <slot />
    </table>
  </div>
</template>
