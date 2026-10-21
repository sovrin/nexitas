import type { FieldIssue } from '../../shared/contracts'
import { errorMessage } from '../lib/format'

/** A form's request: pending while it runs, then what went wrong, either the server's issues by
 *  field (see invalid()) or one message. `submit` answers what the request did, or undefined when
 *  it failed; <FormIssues> shows both kinds, `fieldError` one field's beside it. */
export function useSubmit() {
  const pending = ref(false)
  const error = ref('')
  const issues = ref<FieldIssue[]>([])
  const fieldError = (path: string) =>
    issues.value.find((issue) => issue.path === path || issue.path.startsWith(`${path}.`))?.message

  async function submit<T>(request: () => Promise<T>): Promise<T | undefined> {
    pending.value = true
    error.value = ''
    issues.value = []
    try {
      return await request()
    } catch (cause) {
      const data = (cause as { data?: { data?: { issues?: FieldIssue[] } } }).data?.data
      if (data?.issues?.length) issues.value = data.issues
      else error.value = errorMessage(cause)
      return undefined
    } finally {
      pending.value = false
    }
  }

  return { pending, error, issues, fieldError, submit }
}
