<script setup lang="ts">
import type { FieldIssue } from '../../shared/contracts'
/** <FormIssues :error="error" :issues="issues" failed="Could not save the project." />
 *  Why a form was not taken, from useSubmit(): its issues by field, or the one error. */
defineProps<{ error: string; issues: readonly FieldIssue[]; failed: string }>()
</script>

<template>
  <div v-if="issues.length || error" class="alert" data-tone="danger" role="alert">
    <div>
      <template v-if="error"
        ><strong>{{ failed }}</strong> {{ error }}</template
      >
      <template v-else>
        <strong>Check these fields.</strong>
        <ul>
          <li v-for="issue in issues" :key="issue.path">
            <span class="font-mono">{{ issue.path }}</span
            >: {{ issue.message }}
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>
