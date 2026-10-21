import { describe, expect, it } from 'vitest'
import { formatAge, formatDelta, plural } from '../../app/lib/format'

describe('format', () => {
  it('names a count with its noun', () => {
    expect(plural(1, 'key')).toBe('1 key')
    expect(plural(0, 'key')).toBe('0 keys')
    expect(plural(1204, 'entry', 'entries')).toBe('1,204 entries')
  })

  it('says how long ago, minute-grained, then the day', () => {
    const now = Date.UTC(2026, 9, 21, 12)
    expect(formatAge(now + 5000, now)).toBe('just now')
    expect(formatAge(now - 5 * 60_000, now)).toBe('5 min ago')
    expect(formatAge(now - 3 * 3_600_000, now)).toBe('3 h ago')
    expect(formatAge(Date.UTC(2026, 6, 3), now)).toBe('3 Jul')
    expect(formatAge(Date.UTC(2025, 6, 3), now)).toBe('3 Jul 2025')
    expect(formatAge(null, now)).toBe('—')
  })

  it('compares with before only when there was something', () => {
    expect(formatDelta(5, 0)).toBeNull()
    expect(formatDelta(15, 10)).toEqual({ text: '+50%', trend: 'up' })
  })
})
