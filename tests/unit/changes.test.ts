import { afterEach, describe, expect, it, vi } from 'vitest'
import { announceChange, onChange, pacedAnnouncer } from '../../server/utils/changes'

afterEach(() => vi.useRealTimers())

describe('live changes', () => {
  it('tell every listener at once about a change', () => {
    const heard = vi.fn()
    const stop = onChange(heard)
    announceChange()
    expect(heard).toHaveBeenCalledTimes(1)
    stop()
    announceChange()
    expect(heard).toHaveBeenCalledTimes(1)
  })

  it('pace a busy source: a burst is one announcement after the pace', () => {
    vi.useFakeTimers()
    const announce = pacedAnnouncer(3000)
    const heard = vi.fn()
    const stop = onChange(heard)
    for (let i = 0; i < 50; i++) announce()
    expect(heard).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(heard).toHaveBeenCalledTimes(1)
    announce()
    vi.advanceTimersByTime(3000)
    expect(heard).toHaveBeenCalledTimes(2)
    stop()
  })

  it('announce nothing while no tab is open', () => {
    vi.useFakeTimers()
    const announce = pacedAnnouncer(3000)
    announce()
    const heard = vi.fn()
    const stop = onChange(heard)
    vi.advanceTimersByTime(3000)
    expect(heard).not.toHaveBeenCalled()
    stop()
  })
})
