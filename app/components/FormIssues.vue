<script setup lang="ts">
import type { FieldIssue } from '../../shared/contracts'
/** <FormIssues :error="error" :issues="issues" failed="Could not save the project." />
 *  Why a form was not taken, from useSubmit(): its issues by field, or the one error. */
defineProps<{ error: string; issues: readonly FieldIssue[]; failed: string }>()
</script>

<template>
  <AppAlert v-if="error" :title="failed">{{ error }}</AppAlert>
  <AppAlert v-else-if="issues.length" title="Check these fields.">
    <ul>
      <li v-for="issue in issues" :key="issue.path">
        <span class="font-mono">{{ issue.path }}</span
        >: {{ issue.message }}
      </li>
    </ul>
  </AppAlert>
</template>
