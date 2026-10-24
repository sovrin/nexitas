// Fills two sample projects (and only those, replacing them on a rerun) with data in every module, so the pages can be seen and worked on as
// they look in use: usage counted over three months, feedback in every state, errors with traces,
// content, translations. Development only. It signs itself in with a session made directly in the
// database, sends everything through the app's own API (the owner's and the public routes sites
// call), and writes only what that API cannot backdate (earlier days' counts and timestamps)
// straight into the database. Run it against a running app; it never touches other projects.
//   node --env-file-if-exists=.env --import tsx scripts/seed.ts nexitas [port] --confirm
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createSession } from '../server/core/auth'

const [name, port = process.env.PORT || '3000'] = process.argv
  .slice(2)
  .filter((a) => !a.startsWith('-'))
if (!name) {
  console.error('Name the app: seed.ts <name> [port] --confirm.')
  process.exit(1)
}
if (!process.argv.includes('--confirm')) {
  console.error('This adds sample projects to the app at that port. Run it with --confirm.')
  process.exit(1)
}
const prefix = name.toUpperCase()
const base = `http://localhost:${port}`
const origin = process.env[`${prefix}_ORIGIN`] || base
const db = new DatabaseSync(resolve(process.env[`${prefix}_DATA_DIR`] || '.data', `${name}.sqlite`))
const cookie = `${name}_session=${createSession(db).token}`
const DAY = 24 * 60 * 60 * 1000
const now = Date.now()
const utcDay = (offset: number) => new Date(now - offset * DAY).toISOString().slice(0, 10)
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

/** The owner's API: the session, and the app's origin as every write needs. */
async function api<T = unknown>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${base}/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { cookie, origin, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok && response.status !== 409)
    throw new Error(`${path}: ${response.status} ${await response.text()}`)
  return (await response.json().catch(() => null)) as T
}

/** A public route, as a site of the project calls it. */
function site(
  path: string,
  siteOrigin: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      origin: siteOrigin,
      'content-type': 'application/json',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

// Every module on: a sample shows them all.
for (const module of await api<{ id: string }[]>('/modules'))
  await api(`/modules/${module.id}`, { enabled: true })

const radio = { id: 'sample-radio', name: 'Sample radio', origins: ['https://radio.example.com'] }
const shop = { id: 'sample-shop', name: 'Sample shop', origins: ['https://shop.example.com'] }
// A rerun starts over: the sample projects go, with all their modules keep, and come back.
for (const project of [radio, shop]) {
  await fetch(`${base}/api/projects/${project.id}/delete`, {
    method: 'POST',
    headers: { cookie, origin, 'content-type': 'application/json' },
    body: '{}',
  })
  await api('/projects', project)
}
const p = `/p/${radio.id}`

// censitas: what the site may send, then three months of counts, so every range compares. Beacons only count today, so the
// days before are written as the counter would have left them.
await api(`${p}/sites`, {
  events: {
    pageview: {},
    play: { track: ['intro', 'episode', 'outro'] },
    download: { format: ['mp3', 'ogg'] },
  },
})
const { site: censitasSite } = await api<{ site: { id: string } }>(`${p}/sites`)
const siteId = censitasSite.id
const count = db.prepare(
  `INSERT INTO counts (site, day, event, prop, value, count) VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT DO UPDATE SET count = excluded.count`,
)
for (let offset = 90; offset >= 1; offset--) {
  const day = utcDay(offset)
  const weekend = [0, 6].includes(new Date(`${day}T00:00:00Z`).getUTCDay())
  const views = Math.round((weekend ? 620 : 980) * (1 + Math.sin(offset / 3) / 5) - offset * 3)
  const plays = Math.round(views * 0.31)
  const downloads = Math.round(views * 0.06)
  count.run(siteId, day, 'pageview', '', '', views)
  count.run(siteId, day, 'play', '', '', plays)
  count.run(siteId, day, 'play', 'track', 'episode', Math.round(plays * 0.7))
  count.run(siteId, day, 'play', 'track', 'intro', Math.round(plays * 0.2))
  count.run(siteId, day, 'play', 'track', 'outro', Math.round(plays * 0.1))
  count.run(siteId, day, 'download', '', '', downloads)
  count.run(siteId, day, 'download', 'format', 'mp3', Math.round(downloads * 0.8))
  count.run(siteId, day, 'download', 'format', 'ogg', Math.round(downloads * 0.2))
}
db.prepare(
  `INSERT INTO refusals (site, day, reason, count) VALUES (?, ?, 'event', 14), (?, ?, 'value', 3)
  ON CONFLICT DO UPDATE SET count = excluded.count`,
).run(siteId, utcDay(2), siteId, utcDay(1))
// Today, through the beacon route itself, each from its own sender.
let sender = 0
const beacon = (event: string, props?: Record<string, string>) =>
  site(
    '/v1/e',
    radio.origins[0]!,
    { site: siteId, event, props },
    {
      'x-forwarded-for': `10.0.${Math.floor(++sender / 200)}.${sender % 200}`,
    },
  )
for (let i = 0; i < 40; i++) await beacon('pageview')
for (let i = 0; i < 12; i++) await beacon('play', { track: i % 4 ? 'episode' : 'intro' })
for (let i = 0; i < 3; i++) await beacon('download', { format: 'mp3' })

// collatas: the form, feedback sent through it as visitors would, then the owner's reading.
await api(`${p}/feedback/form/create`, {})
const form = await fetch(`${base}/v1/apps/${radio.id}/form`, {
  headers: { origin: radio.origins[0]! },
}).then((response) => response.json() as Promise<{ token: string }>)
await sleep(3500) // the form refuses anything sent faster than a person could
const FEEDBACK = [
  [
    'problem',
    'The player stops after a few seconds on my phone. Safari on iOS 18, it happened three times today.',
    '/episodes/142',
    0.2,
  ],
  ['idea', 'Could the episode list remember where I stopped listening?', '/episodes', 1.5],
  [
    'problem',
    'The download button gives me an ogg file even though I picked mp3.',
    '/episodes/139',
    5,
  ],
  ['other', 'Lovely little station. The new player is much nicer than the old one.', '/', 20],
  ['idea', 'A dark mode for the site would be great for late listening.', '/', 30],
  ['problem', 'Search finds nothing for “Werkstatt”, but the episode exists.', '/search', 52],
  ['other', 'Buy cheap followers now!!! Best prices, fast delivery!!!', '/', 75],
  [
    'idea',
    'Please add a transcript under each episode, I am hard of hearing.',
    '/episodes/120',
    140,
  ],
] as const
// Each from its own visitor: the form limits what one sender may send.
for (const [kind, message, page] of FEEDBACK)
  await site(
    `/v1/apps/${radio.id}/feedback`,
    radio.origins[0]!,
    { token: form.token, kind, message, page: `${radio.origins[0]}${page}` },
    { 'x-forwarded-for': `10.1.0.${++sender % 250}` },
  )
const { items } = await api<{ items: { id: string; message: string }[] }>(
  `${p}/feedback?filter=all`,
)
const age = db.prepare('UPDATE feedback SET created_at = ?, updated_at = ? WHERE id = ?')
for (const [, message, , hours] of FEEDBACK) {
  const item = items.find((candidate) => candidate.message === message)
  if (!item) continue
  age.run(now - hours * 3600_000, now - hours * 3600_000, item.id)
  const status =
    hours > 100 ? 'done' : message.includes('followers') ? 'spam' : hours > 10 ? 'seen' : null
  if (status) await api(`${p}/feedback/${item.id}/status`, { status })
}

// erratas: a browser and a server stack, and reports from each.
for (const stack of [
  { name: 'web', platform: 'javascript' },
  { name: 'api', platform: 'node' },
])
  await api(`${p}/errors/stacks`, stack)
const stacks = await api<{ id: string; name: string; publicKey: string }[]>(`${p}/errors/stacks`)
const frame = (filename: string, func: string, lineno: number, colno = 9) => ({
  filename,
  function: func,
  lineno,
  colno,
})
const REPORTS = [
  [
    'web',
    'error',
    'TypeError',
    "Cannot read properties of undefined (reading 'track')",
    [
      frame('https://radio.example.com/assets/vendor.js', 'HTMLFormElement.dispatch', 2, 4410),
      frame('https://radio.example.com/assets/player.js', 'Player.start', 97),
      frame('https://radio.example.com/assets/player.js', 'loadTrack', 142, 23),
      frame('https://radio.example.com/assets/analytics.js', 'Object.emit', 88, 12),
    ],
    37,
  ],
  [
    'web',
    'warning',
    'Error',
    'Unhandled promise rejection: Failed to fetch',
    [frame('https://radio.example.com/assets/feed.js', 'refreshFeed', 31)],
    9,
  ],
  [
    'api',
    'error',
    'SqliteError',
    'database is locked',
    [
      frame('/srv/radio/api/db.js', 'Statement.run', 214),
      frame('/srv/radio/api/routes/plays.js', 'recordPlay', 58),
    ],
    4,
  ],
  [
    'web',
    'info',
    'Notice',
    'Autoplay was blocked by the browser',
    [frame('https://radio.example.com/assets/player.js', 'Player.autoplay', 51)],
    2,
  ],
] as const
for (const [stackName, level, type, value, frames, times] of REPORTS) {
  const stack = stacks.find((candidate) => candidate.name === stackName)!
  for (let i = 0; i < times; i++)
    await site(
      `/v1/errors/${stack.id}?erratas_key=${stack.publicKey}`,
      stackName === 'web' ? radio.origins[0]! : '',
      {
        v: 1,
        level,
        environment: 'production',
        release: '2.4.1',
        exception: { type, value, frames },
      },
      { 'content-type': 'text/plain' },
    )
}
const issues = await api<{ id: string; title: string }[]>(`${p}/errors`)
const seen = db.prepare('UPDATE issues SET first_seen = ?, last_seen = ? WHERE id = ?')
for (const [index, issue] of issues.entries()) {
  seen.run(now - (index + 1) * 2.7 * DAY, now - index * 3.1 * 3600_000, issue.id)
  if (issue.title.startsWith('Notice'))
    await api(`${p}/errors/issues/${issue.id}`, { status: 'ignored' })
  if (issue.title.startsWith('SqliteError'))
    await api(`${p}/errors/issues/${issue.id}`, { status: 'resolved' })
}

// veritas: two collections, entries published and drafts.
await api(`${p}/content`, {})
await api(`${p}/content/collections`, {
  slug: 'episodes',
  name: 'Episodes',
  fields: [
    { key: 'summary', label: 'Summary', type: 'markdown' },
    { key: 'number', label: 'Number', type: 'number' },
    { key: 'airDate', label: 'Air date', type: 'date' },
  ],
})
await api(`${p}/content/collections`, {
  slug: 'pages',
  name: 'Pages',
  fields: [{ key: 'body', label: 'Body', type: 'markdown' }],
})
const EPISODES = [
  ['werkstatt', 'Werkstatt', 142, true],
  ['night-trains', 'Night trains', 141, true],
  ['the-quiet-shop', 'The quiet shop', 140, true],
  ['harbour-voices', 'Harbour voices', 143, false],
] as const
for (const [slug, title, number, published] of EPISODES)
  await api(`${p}/content/collections/episodes/entries`, {
    slug,
    title,
    published,
    fields: {
      summary: `${title}: an hour of stories from the neighbourhood.`,
      number,
      airDate: utcDay(143 - number),
    },
  })
await api(`${p}/content/collections/pages/entries`, {
  slug: 'about',
  title: 'About the station',
  published: true,
  fields: { body: 'A small station run by neighbours, on air since 2019.' },
})

// linguitas: English, German and French; published once, then changed, so something waits.
await api(`${p}/translations`, {})
for (const locale of ['de', 'fr', 'it', 'es', 'nl', 'pl'])
  await api(`${p}/translations/languages`, { locale })
const KEYS: [string, string, string, string][] = [
  ['nav.home', 'Home', 'Start', 'Accueil'],
  ['nav.episodes', 'Episodes', 'Folgen', 'Épisodes'],
  ['player.play', 'Play', 'Abspielen', 'Lire'],
  ['player.pause', 'Pause', 'Pause', ''],
  ['player.download', 'Download {format}', 'Herunterladen', 'Télécharger {format}'],
  [
    'search.empty',
    'Nothing found for “{query}”.',
    'Nichts gefunden für „{query}“.',
    'Rien trouvé pour « {query} ».',
  ],
  // Deeper keys, one of them a key with keys below it.
  ['general.foo', 'A foo', 'Ein Foo', 'Un foo'],
  ['general.foo.bar', 'A foobar', 'Ein Foobar', ''],
  ['checkout.title', 'Checkout', 'Kasse', 'Paiement'],
  ['checkout.form.submit', 'Pay now', 'Jetzt zahlen', 'Payer'],
  ['checkout.form.errors.card', 'Card declined', 'Karte abgelehnt', 'Carte refusée'],
  ['checkout.form.errors.email.missing', 'Enter an email', '', 'Saisissez un e-mail'],
  ['checkout.form.errors.email.invalid', 'Not an email address', 'Keine E-Mail-Adresse', ''],
]
// Italian well along, Spanish half done, Dutch begun, Polish not yet: the strip shows a pattern.
const MORE: Record<string, Record<string, string>> = {
  'nav.home': { it: 'Home', es: 'Inicio', nl: 'Home', pl: 'Start' },
  'nav.episodes': { it: 'Episodi', es: 'Episodios', nl: 'Afleveringen' },
  'player.play': { it: 'Riproduci', es: 'Reproducir', nl: 'Afspelen' },
  'player.pause': { it: 'Pausa', es: 'Pausa' },
  'player.download': { it: 'Scarica {format}', es: 'Descargar' },
  'search.empty': { it: 'Nessun risultato per «{query}».' },
  'general.foo': { it: 'Un foo', es: 'Un foo', nl: 'Een foo' },
  'checkout.title': { it: 'Cassa', es: 'Pago', nl: 'Afrekenen' },
  'checkout.form.submit': { it: 'Paga ora', es: 'Pagar ahora' },
  'checkout.form.errors.card': { it: 'Carta rifiutata' },
}
for (const [key, en, de, fr] of KEYS)
  await api(`${p}/translations/keys`, {
    key,
    texts: { en, ...(de ? { de } : {}), ...(fr ? { fr } : {}), ...MORE[key] },
  })
await api(`${p}/translations/publish`, {})
await api(`${p}/translations/keys/nav.episodes`, { texts: { en: 'All episodes' } })

console.info(`Seeded ${radio.name} (${base}/p/${radio.id}) and ${shop.name}.`)
