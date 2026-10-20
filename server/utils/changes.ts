// Who is watching: one callback per open tab (see api/events.get.ts). Kept in memory, which holds
// because an app runs as a single process.
type Listener = () => void

const listeners = new Set<Listener>()

/** Hear about every change; returns how to stop. */
export function onChange(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Something the pages show has changed: tell every open tab to look again. */
export function announceChange() {
  for (const listener of listeners) listener()
}

/** For changes that can come all the time, such as a busy site's beacons: `announce()` tells the
 *  tabs at most once per `ms`, for everything that happened meanwhile, so they refresh at a steady
 *  pace however busy it gets. */
export function pacedAnnouncer(ms: number) {
  let pending: ReturnType<typeof setTimeout> | undefined
  return function announce() {
    if (pending || !listeners.size) return
    pending = setTimeout(() => {
      pending = undefined
      announceChange()
    }, ms)
  }
}
