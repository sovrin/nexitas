import { describe, expect, it } from 'vitest'
import { createLimiter, isPrivateAddress, senderNetwork } from '../../server/core/limits'

describe('limits', () => {
  it('allow a set number of hits per window, then forget everyone', () => {
    const limit = createLimiter(3, 60_000)
    for (let i = 0; i < 3; i++) expect(limit.hit('a', 1000)).toBe(true)
    expect(limit.allows('a', 2000)).toBe(false)
    expect(limit.hit('a', 2000)).toBe(false)
    expect(limit.hit('b', 2000)).toBe(true)
    expect(limit.allows('a', 61_000)).toBe(true)
    expect(limit.hit('a', 61_000)).toBe(true)
  })

  it('count an IPv6 sender by its /64, and IPv4 as it is', () => {
    expect(senderNetwork('2001:db8:1:2:a:b:c:d')).toBe('2001:db8:1:2::/64')
    expect(senderNetwork('2001:db8:1:2::5')).toBe('2001:db8:1:2::/64')
    expect(senderNetwork('2001:DB8::5')).toBe('2001:db8:0:0::/64')
    expect(senderNetwork('fe80::1%eth0')).toBe('fe80:0:0:0::/64')
    expect(senderNetwork('203.0.113.7')).toBe('203.0.113.7')
    expect(senderNetwork('::ffff:203.0.113.7')).toBe('203.0.113.7')
  })

  it('trust a forwarded address only from the host or a private network', () => {
    for (const proxy of [
      '127.0.0.1',
      '::1',
      '::ffff:127.0.0.1',
      '10.0.0.2',
      '172.18.0.3',
      '192.168.1.5',
      'fd00::2',
    ])
      expect(isPrivateAddress(proxy)).toBe(true)
    for (const caller of ['203.0.113.7', '172.32.0.1', '::ffff:8.8.8.8', '2001:db8::1', 'fe80::1'])
      expect(isPrivateAddress(caller)).toBe(false)
  })
})
