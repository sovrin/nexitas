// What a module gives the core. A module is a Nuxt layer that extends nexitas: its pages, API
// routes and components join the app as usual, and these interfaces are how it plugs into what
// the core owns. A project holds everything: a module's pages live in app/pages/p/[project]/ and
// read it with useProject(); its API lives in server/api/p/[project]/ and reads it with
// requestProject(event) (#nexitas/server/utils/projects), which the core has found, or answered
// 404 for, before the handler runs. The server half is registered from a Nitro plugin (registerModule); the page
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
  /** Routes outside /api that anyone may call, such as a tracker's beacon or a form's post. */
  publicRoutes?: readonly PublicRoute[]
  /** Every path prefix the module serves: its pages, its /api routes and its public ones. A
   *  project's, /p/<id>/feedback and /api/p/<id>/feedback, count as /feedback and /api/feedback. While the owner has the module switched
   *  off, all of them answer 404. */
  paths?: readonly string[]
  /** The largest body, in bytes, a write to its own paths accepts, such as a long entry. 64 kB
   *  when left out. Public routes set theirs on the route. */
  maxBody?: number
  /** Runs once at start and every hour while the module is on, such as a cleanup. */
  hourly?: (db: DatabaseSync) => void
  /** What this module says about one project: on the overview, the project's page, and the
   *  status line while the project is open. Nothing for a project it is not used for. */
  projectStatus?: (db: DatabaseSync, projectId: string) => readonly StatusItem[]
  /** What happened in a project since `since` (ms), newest or oldest first, for its overview's
   *  "since you last looked": new feedback, a new issue, a publish. Only what the module keeps
   *  anyway; nothing about a visitor. Left out, the module says nothing there. */
  projectActivity?: (db: DatabaseSync, projectId: string, since: number) => readonly ActivityItem[]
  /** Removes what this module keeps for a project. Runs in the core's transaction, before the
   *  project itself goes. */
  deleteProject?: (db: DatabaseSync, projectId: string) => void
}

/** A public route. Matched on the path without its query, before the route's own handler. */
export interface PublicRoute {
  /** The exact path, or a pattern for one with parameters, anchored: `/^\/v1\/…/`. Never under
   *  /api, which is the owner's. */
  path: string | RegExp
  /** The largest body it accepts, in bytes. 64 kB when left out. */
  maxBody?: number
  /** Answer errors as JSON, never as a page: for routes that scripts on other sites call. */
  json?: boolean
  /** Checks a request before its handler: an origin, CORS headers. Throw to refuse it; return
   *  a value to answer it here, as a preflight is answered. */
  guard?: (event: H3Event, match: RegExpExecArray | null) => unknown
}

/** One part of a module's status, such as "3 new" or "2 sites". */
export interface StatusItem {
  text: string
  /** Where it links to. */
  to?: string
  /** Colours the line's marker; the first item with a tone sets it. */
  tone?: 'success' | 'warning' | 'danger'
  /** The short reading the sidebar shows beside the module's name, such as "1,284" or "18/21".
   *  One item a module says carries it; the rest of the line stays for the overview. */
  figure?: string
}

/** One thing that happened in a project, as its overview's timeline shows it. */
export interface ActivityItem {
  /** When it happened, in ms. */
  at: number
  /** What happened, in a few words: "New problem", "Published". */
  title: string
  /** What it was about, shown as text: an excerpt, an issue's title, an entry's name. */
  detail?: string
  /** Where it is. */
  to?: string
}

/** What one module says, under its own name: on the status line, or about one project. */
export interface ModuleStatus {
  /** The module's id, which finds its name and icon in app.config. */
  module: string
  items: StatusItem[]
}

/** A section in the main nav. */
export interface NavEntry {
  /** Where it goes. A module's section is a project's: `/feedback` goes to /p/<id>/feedback, for
   *  the project picked beside the sections, and its pages live in the module's
   *  app/pages/p/[project]/feedback/. */
  to: string
  label: string
  /** Further path prefixes that belong to the section, besides `to` itself. */
  paths?: readonly string[]
  /** The module it belongs to, whose icon it carries. */
  module?: string
}

/** aequitas' named accent hues. */
export type AccentPreset =
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'graphite'

/** How the shell names a module wherever it shows the module's part. */
export interface ModuleEntry {
  /** The NexitasModule's id. */
  id: string
  /** What it is about, in a word or two: "Feedback", "Usage". */
  label: string
  /** What it does, in one short line, for the setup and Modules pages. */
  description: string
  /** An aequitas icon (`data-icon`), different from every other module's. */
  icon: string
  /** An aequitas accent preset (`data-accent`) for the module's section: its pages and its place
   *  in the sidebar take this hue, the core's own pages stay graphite. Different from
   *  every other module's; left out, the module is graphite too. */
  accent?: AccentPreset
}

/** The page half: what an app or module puts into app.config under `nexitas`. Nav entries and
 *  modules from every layer are joined, the app's first. */
export interface NexitasAppConfig {
  nav: NavEntry[]
  /** Each module's name and icon, once. */
  modules: ModuleEntry[]
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
