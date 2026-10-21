import type { z } from 'zod'
import type { FieldIssue } from '../../shared/contracts'

/** A 400 listing each problem by field, for the form to show beside it (useSubmit). Takes a
 *  schema's error, or issues a module found itself, such as an entry's fields. */
export function invalid(problems: z.ZodError | FieldIssue[]) {
  const issues = Array.isArray(problems)
    ? problems
    : problems.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
  return createError({ statusCode: 400, statusMessage: 'Check these fields.', data: { issues } })
}
