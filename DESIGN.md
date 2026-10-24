---
name: nexitas
description: A dark-first working console on aequitas, where panes hold their place behind hairline seams and each module speaks in its own hue.
colors:
  graphite: 'oklch(0.78 0.01 255)'
  graphite-day: 'oklch(0.42 0.01 255)'
  censitas-teal: 'oklch(0.72 0.15 195)'
  collatas-orange: 'oklch(0.72 0.15 55)'
  erratas-pink: 'oklch(0.72 0.15 350)'
  veritas-indigo: 'oklch(0.72 0.15 280)'
  linguitas-green: 'oklch(0.72 0.15 150)'
  night-glass: 'oklch(0.14 0.008 255)'
  night-glass-sunken: 'oklch(0.115 0.006 255)'
  night-sheet: 'oklch(0.26 0.01 255)'
  moon-ink: 'oklch(0.96 0.005 255)'
  moon-grey: 'oklch(0.72 0.015 255)'
  seam: 'oklch(1 0 0 / 0.08)'
  seam-strong: 'oklch(1 0 0 / 0.16)'
  success: 'oklch(0.75 0.15 150)'
  warning: 'oklch(0.82 0.15 80)'
  danger: 'oklch(0.72 0.17 25)'
  info: 'oklch(0.76 0.12 235)'
typography:
  page-title:
    fontFamily: "ui-sans-serif, -apple-system, 'SF Pro Text', system-ui, 'Geist Variable', 'Segoe UI', sans-serif"
    fontSize: 'calc(clamp(0.88rem, 0.86rem + 0.1vw, 0.95rem) * 1.272)'
    fontWeight: 600
    lineHeight: 1.128
  body:
    fontFamily: "ui-sans-serif, -apple-system, 'SF Pro Text', system-ui, 'Geist Variable', 'Segoe UI', sans-serif"
    fontSize: 'clamp(0.88rem, 0.86rem + 0.1vw, 0.95rem)'
    fontWeight: 400
    lineHeight: 1.618
  meta:
    fontFamily: "ui-sans-serif, -apple-system, 'SF Pro Text', system-ui, 'Geist Variable', 'Segoe UI', sans-serif"
    fontSize: 'calc(clamp(0.88rem, 0.86rem + 0.1vw, 0.95rem) / 1.272)'
    fontWeight: 400
    lineHeight: 1.618
  pane-heading:
    fontFamily: "ui-sans-serif, -apple-system, 'SF Pro Text', system-ui, 'Geist Variable', 'Segoe UI', sans-serif"
    fontSize: 'max(calc(clamp(0.88rem, 0.86rem + 0.1vw, 0.95rem) / 1.272), 0.6875rem)'
    fontWeight: 560
    letterSpacing: '0.12em'
  mono:
    fontFamily: "ui-monospace, 'SF Mono', 'Geist Mono Variable', Menlo, Consolas, monospace"
    fontSize: '0.889em'
    fontFeature: "'tnum'"
rounded:
  square: '0px'
spacing:
  space-1: '3px'
  space-2: '5px'
  space-3: '8px'
  space-4: '13px'
  space-5: '20px'
  space-6: '33px'
  space-7: '53px'
components:
  button-primary:
    backgroundColor: '{colors.collatas-orange}'
    textColor: '{colors.night-glass}'
    rounded: '{rounded.square}'
    height: '26px'
    padding: '0 10px'
  button-tinted:
    backgroundColor: '{colors.night-sheet}'
    textColor: '{colors.moon-ink}'
    rounded: '{rounded.square}'
    height: '26px'
    padding: '0 10px'
  danger-action:
    textColor: '{colors.danger}'
    rounded: '{rounded.square}'
    height: '26px'
  input-small:
    backgroundColor: '{colors.night-sheet}'
    textColor: '{colors.moon-ink}'
    typography: '{typography.meta}'
    rounded: '{rounded.square}'
    height: '26px'
  pane-bar:
    backgroundColor: '{colors.night-glass}'
    textColor: '{colors.moon-ink}'
    typography: '{typography.page-title}'
    height: '49px'
    padding: '0 20px'
  pane-heading:
    textColor: '{colors.moon-grey}'
    typography: '{typography.pane-heading}'
  sidebar-link:
    textColor: '{colors.moon-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.square}'
    width: '17.944rem'
  state-dot:
    backgroundColor: '{colors.warning}'
    rounded: '{rounded.square}'
    size: '5px'
  inspector:
    backgroundColor: '{colors.night-glass}'
    width: '22.825rem'
    padding: '20px'
---

# Design System: nexitas

## Overview

**Creative North Star: "The Night Console"**

nexitas is the frame every module of the suite lives in: one dark working console, built entirely from aequitas (its classes, `data-*` variants, ARIA state and tokens). Nothing here redefines an aequitas token; nexitas chooses aequitas presets (`data-accent="graphite"`, `data-density="compact"`, dark by default) and adds, in `app/assets/nexitas.css`, only what aequitas lacks and every app shares, written in aequitas tokens. The colour, type and spacing values in the frontmatter are aequitas' own, resolved for the dark theme at compact density, so a reader can see them; the stylesheet always reads the `--ae-*` variable, never the literal.

The console is a set of panes that hold their place: the sidebar on the left, the page's pane in the middle, and an inspector pane on the right when an item or the page's settings are open. Panes are separated by 1px hairline seams on one ground, never by cards, gaps or shadows. The list stays where it is and the selected item opens beside it, so a module's item page is its list page with the inspector open. Density is compact because a console shows more rows, not more air.

Colour has two jobs and they never mix. A module's hue (one aequitas accent preset per module) says _where_ you are: its sidebar icon, its current link, its primary button, its links. The state tones (success, warning, danger, info) say _what needs you_, as a small square dot or a word in that tone, always beside a word or a figure. Everything else is moon ink on night glass.

**Key Characteristics:**

- Dark first (the owner can switch to light or the system's theme); light is aequitas' light side of the same tokens.
- Compact density, square corners throughout (aequitas' default radius of 0).
- Sidebar, pane and inspector divided by hairline seams; header bars of one height so the seam under them runs straight across.
- Small-caps headings for sidebar groups, sections, the inspector and table columns.
- Mono, tabular figures for anything one could type into a terminal: ids, origins, URLs, keys, values, days, counts.
- One accent hue per module; the core is graphite.
- Glass only where something floats: menus, dialogs, the ⌘K palette.
- One movement: the inspector eases in from its seam.

## Colors

A near-black, slightly blue ground carrying light ink, with exactly one module hue in a pane and state tones that sit beside words.

### Primary

- **Graphite** (graphite in the dark theme, graphite-day in light): the core's accent, set as `data-accent="graphite"` on `<html>`. It is a near-neutral, so the core's own pages (Projects, Modules, a project's overview) read as uncoloured. It also tints text selection (accent at 35%) and the caret.

### Secondary: the module hues

Each module names an aequitas accent preset in its `app/app.config.ts` (`accent`). The core sets that preset as `data-accent` on the module's sidebar entry, its ⌘K option, its `ModuleLabel`, and its pages (AppPage sets it on the pane and inspector), so `--ae-accent` resolves to the module's hue there and nowhere else.

- **Censitas Teal** (`teal`, hue 195): usage.
- **Collatas Orange** (`orange`, hue 55): feedback.
- **Erratas Pink** (`pink`, hue 350): errors.
- **Veritas Indigo** (`indigo`, hue 280): content.
- **Linguitas Green** (`green`, hue 150): translations.

A new module picks an unused aequitas preset; it never defines a hue of its own.

### Neutral

- **Night Glass** (`--ae-bg`): the one ground every pane shares, the sidebar included (nexitas removes aequitas' frosted sidebar fill so there is no second, bluer ground).
- **Night Glass Sunken** (`--ae-bg-sunken`): wells such as code snippets.
- **Night Sheet** (`--ae-surface`): what floats (menus, dialogs, the palette, a search's hint).
- **Moon Ink** (`--ae-text`): text, titles, the current filter.
- **Moon Grey** (`--ae-text-muted`): meta, captions, small-caps headings, the danger zone's explanation.
- **Seam** (`--ae-border`) and **Seam Strong** (`--ae-border-strong`): hairlines between panes and rows; the strong one is the scrollbar thumb.

### State

- **Success, Warning, Danger, Info** (`--ae-success`, `--ae-warning`, `--ae-danger`, `--ae-info`): state only, through `data-tone` on a dot, an alert or a quiet danger button.

### Named Rules

**The Two Jobs Rule.** A module's hue says where you are; a state tone says what needs you. A hue never reports state and a tone never marks a module.

**The Beside-a-Word Rule.** A state colour always sits next to the word or figure it qualifies (`<StateDot tone>3 new</StateDot>`, a sidebar figure with its dot). Colour alone never carries meaning.

**The Preset-Only Rule.** Hues come from aequitas accent presets named in app.config. No module writes an oklch value of its own.

## Typography

**Body Font:** aequitas' sans stack (ui-sans-serif, SF Pro Text, system-ui, Geist Variable, Segoe UI)
**Mono Font:** aequitas' mono stack (ui-monospace, SF Mono, Geist Mono Variable, Menlo, Consolas)

**Character:** aequitas' own type at compact density, untouched: a quiet working sans with mono for machine values. There is no display type; the largest thing on a page is its title in the pane bar.

### Hierarchy

- **Page title** (600, `text-l`, about 1.12–1.21rem): the page's `h1` in AppPage's header line, mono when it names a key or id. Dialog titles use the same.
- **Body** (400, `text-m`, 0.88–0.95rem compact): everything read, sidebar links, table cells.
- **Meta** (400, `text-s`): the subtitle beside the title (state: "2 open"), filters, pager, the danger zone, search fields.
- **Pane heading** (560, `text-xs`, +0.12em, uppercase, Moon Grey): aequitas' eyebrow style, used as the actual heading of a sidebar group (`h6`), a section (`AppSection`'s `h2`), the inspector (`aside-title`) and every table column (`th`).
- **Mono** (`font-mono`, tabular figures): ids, origins, URLs, keys, snippets, timestamps, counts, the version.

### Named Rules

**The Small-Caps Heading Rule.** Every heading inside a pane, group or table is the small-caps pane heading, and it is a real heading element that names what follows. It is never a decorative label over another heading.

**The Terminal Rule.** Anything a person could type into a terminal is mono; anything counted is tabular.

## Layout

The page is aequitas' `.shell` with `data-collapsible`: the sidebar (aequitas' φ⁶ width, about 17.9rem) beside `main`. Each page (AppPage) is a second `.shell` inside `main`: the page's pane, and with an `aside` an inspector pane on its right, a half step wider than aequitas' default (φ^6.5, about 22.8rem) so a key and its value share a row.

- **Pane bar:** every pane opens with a header bar of one height, the control size plus two `space-3` (49px compact), with a hairline under it, so the seam runs straight across the main pane and the inspector. The main bar holds the trail, a `/`, the title, its state and at its end the actions.
- **Filter row:** under the bar, a list's FilterLinks at the start and SearchBox at the end.
- **Pane body:** `space-5` (20px) padding and a `space-5` stack.
- **Danger zone:** the one destructive action sits alone at the pane's foot (the inspector's when there is one), pushed down by `margin-block-start: auto`, with a hairline above it and one muted line on what it removes.
- **Seams grid:** panels on a project's overview tile by `auto-fit` columns of at least 24rem, divided by hairlines drawn by the grid (top and start) and each panel (end and bottom), so a short last row leaves no hole.
- **Responsive:** under 64rem the sidebar becomes a rail (when it is under 7rem wide, only icons and the project mark remain); under 48rem it is a horizontal row that fades at the edge it can still scroll to, and the inspector drops below the pane. The ⌘K hint hides on touch.

**The Hold-Your-Place Rule.** The list never leaves its pane to show an item. The item opens in the inspector, and the item's URL renders the list too.

## Elevation & Depth

Flat. Docked panes sit on one ground and are separated only by 1px hairlines (drawn as inset box-shadows, so they never shift layout). There are no drop shadows between panes. Depth is reserved for what floats: menus, the project switcher, dialogs and the ⌘K palette are aequitas glass over the scrim.

**The Seam-Not-Shadow Rule.** Panes divide by a hairline seam on one ground, never by shadow, gap or a card's fill.

**The Glass-Floats Rule.** Glass and blur only on what floats above the console; never on a docked pane.

## Shapes

Square everywhere, which is aequitas' default (`--ae-radius-m` is 0): buttons, inputs, dots, the current-link marker, dialogs. nexitas never sets a radius; if a radius is ever wanted it comes from an aequitas preset, not a literal. State dots are squares (`space-2`, 5px compact).

## Components

The page kit in `app/components` draws every page, the core's and every module's. Pages compose the kit, never the markup it draws; `node scripts/drift.ts` (in `pnpm lint`) fails on a hand-built header, breadcrumb, alert, table frame, dot, aside, section heading, `h1` or `style=""`. What a module needs that the kit lacks is added to the kit.

### Shell

- **AppSidebar:** the project switcher (mark, the open project's name and mono id, opening a menu of projects), Search with its ⌘K hint, then PROJECT (Overview and each module: icon in its hue, label, and its live figure, mono and tabular, with a state dot when it has a tone), INSTALL (Projects, Modules), and at its foot the theme switch, the version and Sign out. The current link takes the module's hue as its edge and tint.
- **CommandPalette:** ⌘K / Ctrl K from anywhere; this project's sections, all projects, install pages and commands (theme, sign out). Glass.

### Page frame

- **AppPage:** every page. Slots: default, `subtitle` (state beside the title), `actions`, `filters`, `aside` (opens the inspector; `aside-title` names it when nothing inside does), `danger`. Sets the module hue, the trail and the tab title; a load error replaces the content with "Try again".
- **AppSection:** a named part of a pane under a small-caps heading, with `actions` at the heading's end. Never a card.
- **AsideLayout:** a column beside the main one for a component that needs it (a form's live preview); AppPage's inspector covers everything else.
- **Seams panel:** a module's panel on a project's overview, in the seams grid: what the module says, its snippet, or PanelStart.

### Data

- **DataTable:** a small table (`data-size="s"`) that scrolls sideways on its own; small-caps column headings, ids and values mono.
- **StateDot:** a square dot in its tone, always before its word.
- **EmptyState:** one muted line saying what will appear or how to start.
- **FilterLinks:** which part of a list shows, as links in the address; the current one in ink and underlined in the hue, the rest quiet.
- **SearchBox:** a small search field, mono for a query syntax; its hint shows under it while typing, floating, so the page never moves.
- **PagerNav:** Newer, "1–25 of 210" (tabular), Older.
- **EmbedCode / CopyButton:** a sunken mono snippet that wraps, with an icon button in its corner that says "Copied" for two seconds.

### Messages and actions

- **AppAlert:** a message in its tone (danger by default), title in bold first; danger and warning interrupt a screen reader.
- **FormIssues:** a form's issues by field, or its one error, above the form's action row.
- **Buttons:** aequitas tinted buttons at the small size; at most one primary per view, which takes the hue (a module's "Mark done" is orange in collatas). The form's primary sits at the end of a hairline-topped row.
- **DangerAction:** a quiet ghost button in the danger tone, then ConfirmDialog; `confirm-word` makes the owner type an id first. Only in the `danger` slot, never beside a primary.
- **ConfirmDialog:** a native modal `<dialog>`, focus starting on Cancel.

### Motion

Timing is aequitas' (`--ae-duration` 220ms, its fast step, `--ae-ease`); reduced motion stills all of it through aequitas. Nothing scales or bounces.

- The inspector eases in from its seam (fade plus a `space-5` slide) when an item opens beside its list: the console's one movement.
- Page changes cut: a View Transition froze the screen until the new page had its data.
- A live row drops in from just above, the rows below make room (an ease-in-out, the one easing nexitas adds), a leaving row fades out.
- Alerts fade in where they stand; a state dot's colour eases over.

## Do's and Don'ts

### Do:

- **Do** build from aequitas classes, `data-*` variants and ARIA state, and put in `nexitas.css` only what aequitas lacks and every app shares, in `--ae-*` tokens.
- **Do** frame every page with AppPage and compose the page kit; add to the kit what a module lacks.
- **Do** open an item in the inspector beside its list, and put the one destructive action alone at the pane's foot.
- **Do** name a module's hue as an aequitas accent preset in app.config.
- **Do** set ids, origins, URLs, keys, values and days in mono, and counts tabular.

### Don't:

- **Don't** use cards, panels with their own fill, gaps between panes or drop shadows to divide the console; use seams.
- **Don't** use colour on its own: a state tone sits beside its word, and a module's hue marks only that module.
- **Don't** put glass or blur on a docked pane.
- **Don't** hard-code a colour, radius, space or duration; read the aequitas token.
- **Don't** put a DangerAction next to a primary button, or more than one primary in a view.
- **Don't** hand-build a header, breadcrumb, alert, table frame, dot, aside, section heading, `h1` or `style=""` in a page.
