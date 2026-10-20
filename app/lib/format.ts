/** What a failed request says: the server's own message, or that it could not be reached. */
export function errorMessage(error: unknown) {
  const response = error as { data?: { statusMessage?: string } }
  return response?.data?.statusMessage || 'Could not reach the server. Please try again.'
}
