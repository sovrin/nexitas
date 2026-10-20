// What a module gives the core. A module is a Nuxt layer that extends nexitas: its pages, API
// routes and components join the app as usual, and these interfaces are how it plugs into what
// the core owns. The server half is registered from a Nitro plugin (registerModule); the page
// half goes into app.config under `nexitas`.
import type { H3Event } from 'h3'
import type { DatabaseSync } from 'node:sqlite'

/** The server half of a module. */
export interface NexitasModule {
  /** Names the module in the database, so it never changes. Lowercase letters and dashes. */
  id: string
  /** Schema steps, oldest first: step n brings the module to version n. Never edit a released
   *  step; add one. Each runs in the same transaction as its version bump. */
  migrations?: readonly string[]
  /** For an app that kept its schema in PRAGMA user_version before it moved onto nexitas: its
   *  steps continue from that version instead of running again. */
  adoptsUserVersion?: boolean
  /** Routes outside /api that anyone may call, such as a tracker's beacon or a form's post. */
  publicRoutes?: readonly PublicRoute[]
  /** What this module adds to the status line under every page. */
  status?: (db: DatabaseSync) => readonly StatusItem[]
}

/** A public route. Matched on the path without its query, before the route's own handler. */
export interface PublicRoute {
  /** The exact path, or a pattern for one with parameters. */
  path: string | RegExp
  /** The largest body it accepts, in bytes. 64 kB when left out. */
  maxBody?: number
  /** Answer errors as JSON, never as a page: for routes that scripts on other sites call. */
  json?: boolean
  /** Checks a request before its handler: an origin, CORS headers. Throw to refuse it; return
   *  a value to answer it here, as a preflight is answered. */
  guard?: (event: H3Event, match: RegExpExecArray | null) => unknown
}

/** One part of the status line, such as "3 new" or "2 sites". */
export interface StatusItem {
  text: string
  /** Where it links to. */
  to?: string
  /** Colours the line's marker; the first item with a tone sets it. */
  tone?: 'success' | 'warning' | 'danger'
}

/** A section in the main nav. */
export interface NavEntry {
  to: string
  label: string
  /** Further path prefixes that belong to the section, besides `to` itself. */
  paths?: readonly string[]
}

/** The page half: what an app or module puts into app.config under `nexitas`. Nav entries from
 *  every layer are joined, the app's first. */
export interface NexitasAppConfig {
  nav: NavEntry[]
  /** The sign-in page's lines. */
  text: {
    /** Under the setup heading: what the owner account is for. */
    setup: string
    /** Under the sign-in heading. */
    signIn: string
    /** The closing line on setup, about where the data stays. */
    promise: string
  }
}
