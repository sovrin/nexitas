# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Self-hosting developers who run their own small sites and apps, and want to know how those are
used, what people tell them about them, and (soon) what breaks in them. The author runs the suite
for their own sites (sonotas among them); others install the same apps on their own servers, so
every admin page has to make sense to someone who did not build it. Each install has exactly one
user: its owner.

## Product Purpose

A suite of small self-hosted services that share one core (nexitas): sign-in, the page shell, live
updates and the database. Each module answers one question about the owner's sites:

- **censitas**: how are my sites used? Named events counted per site and UTC day, with the share of
  each allowed prop value. Nothing that tells visitors apart.
- **collatas**: what do people tell me? An embeddable feedback form per app, and one inbox for all
  of them, with status (new, seen, done, spam), retention and limits.
- **erratas** (planned): what breaks in my sites?

Success is an owner who opens the suite, sees at a glance what changed since last time, and acts on
it in a few seconds.

## Positioning

Privacy is the product. censitas stores counters only (site, day, event, prop value, count): no IP
address, user agent, time of day, page address, referrer or identifier, so no two counts can be
joined into one visit, and no consent banner is needed. Everything runs on the owner's own server,
behind their own proxy, with one owner account. A neighbouring analytics or feedback tool that
profiles visitors, or runs as a hosted service, cannot truthfully say this.

## Operating Context

- The owner checks the suite between other work, on a laptop and on a phone, and leaves tabs open:
  pages update live as counts and feedback arrive.
- Sites embed a module's script by URL (the censitas tracker, the collatas form). Setup is copying a
  snippet from the module's settings page into the site.
- Each module can run on its own (its own subdomain, container and data file), or later together in
  one suite app. Existing embeds on other people's sites need not be kept working when that changes.

## Capabilities and Constraints

- Built with Nuxt as layers: nexitas is the core, each module a layer on it. Modules plug in through
  the interfaces in `shared/modules.ts` (migrations, public routes, status line, nav).
- UI is built from aequitas (`../aequitas`): its classes, tokens and `data-*` variants. A redesign
  may add shared components or patterns aequitas lacks, in nexitas, but aequitas stays the base.
- One owner per install; sign-in with an installation key on first setup.
- Live updates over server-sent events; every view that shows data refreshes by itself.
- Modules will link up per site and UTC day (later also per release): page views, feedback and
  errors side by side.
- Data is plain SQLite per install. censitas settings list every event, prop and value a site may
  send; anything else is refused and counted only by reason.

## Brand Commitments

- The names: nexitas (the core), censitas, collatas, erratas. Lowercase, Latin, ending in -tas.
- Each module has its own small mark (censitas: a tally of five; collatas: an open tray with a
  square dropping in).
- Voice: plain, short, honest sentences that say what happens ("Changes count from the next event
  on."), never marketing.

## Evidence on Hand

- Real local data: one site (sonotas) with a few days of counts; one app (sonotas) with about ten
  pieces of feedback. No customers, testimonials or usage numbers exist; none may be invented.
- READMEs in each repository describe what is stored and why.

## Product Principles

1. Store and show only what the owner needs; never anything that tells one visitor from another.
2. Answer "what changed?" first: today against before, new against seen.
3. Every module looks and works the same way, so learning one teaches the others.
4. Quiet by default: colour and emphasis only where the owner has to act.
5. Self-explanatory for a stranger who installed it, without docs.

## Accessibility & Inclusion

Usable by keyboard and screen reader, readable for low vision and at 200% zoom, and usable one
handed on a phone. No specific standard has been set beyond WCAG 2.2 AA as the working floor.
