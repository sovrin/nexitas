// How every page says things: counts, days, times and ages, the same in every module. All in en-GB
// and UTC, so the server's render and the hydrated page agree. Modules import them through
// #nexitas/app/lib/format.

/** What a failed request says: the server's own message, or that it could not be reached. */
export function errorMessage(error: unknown) {
  const response = error as { data?: { statusMessage?: string } }
  return response?.data?.statusMessage || 'Could not reach the server. Please try again.'
}

export const formatCount = (value: number) => new Intl.NumberFormat('en-GB').format(value)

/** 60, 1.2K, 3M: an axis tick. */
export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-GB', { notation: 'compact' }).format(value)

/** "1 key", "12 keys", "1,204 entries": a count with its noun. */
export const plural = (count: number, one: string, many = `${one}s`) =>
  `${formatCount(count)} ${count === 1 ? one : many}`

/** "19 Oct", or "Sun 19 Oct" with the weekday: a UTC day (2026-10-19) as a row shows it. */
export function formatDay(day: string, weekday = false) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(weekday ? { weekday: 'short' } : {}),
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`))
}

/** The change from `previous` to `current` as aequitas' .delta shows it: the sign in the text,
 *  the trend for its colour. Nothing to compare when there was nothing before. */
export function formatDelta(current: number, previous: number) {
  if (!previous) return null
  const change = Math.round(((current - previous) / previous) * 100)
  return {
    text: change > 0 ? `+${change}%` : change < 0 ? `−${-change}%` : '±0%',
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  }
}

/** "19 Oct, 14:32:05 UTC": one moment, exactly. */
export function formatTime(value: number | null) {
  if (!value) return '—'
  return (
    new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // Seconds, so entries sent in the same minute stay distinguishable.
      second: '2-digit',
      timeZone: 'UTC',
    }).format(value) + ' UTC'
  )
}

/** "5 min ago", "2 h ago", "3 d ago"; older than a week the day alone ("3 Jul", with the year
 *  once it is another), short enough for a row. Minute-grained, so the server render and the
 *  hydrated page agree. A clock ahead of this one reads as just now. */
export function formatAge(value: number | null, now = Date.now()) {
  if (!value) return '—'
  const minutes = Math.floor((now - value) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)} h ago`
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))} d ago`
  const sameYear = new Date(value).getUTCFullYear() === new Date(now).getUTCFullYear()
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(value)
}

/** "14:02": the time of day in UTC, for events already grouped under their day. */
export const formatClock = (value: number) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(
    value,
  )

/** "Today", "Yesterday", or "Sun 19 Oct": the UTC day a moment fell on, as a heading. */
export function formatDayName(value: number, now = Date.now()) {
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10)
  if (day(value) === day(now)) return 'Today'
  if (day(value) === day(now - 24 * 60 * 60 * 1000)) return 'Yesterday'
  return formatDay(day(value), true)
}
