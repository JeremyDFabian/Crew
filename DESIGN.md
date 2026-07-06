# Design

Visual system for Crew. Restrained sage button on warm-neutral paper, confident display type, snappy purposeful motion. Anti-LMS by reflex. Light + dark, system-default.

## Color

**Sage carries one job: the primary call-to-action.** Everywhere else, the product is warm neutral — paper, ink, stone. Sage is rare on purpose. When the screen offers a single sage button, it reads as the obvious next move.

All colors in OKLCH. No `#000`, no `#fff`. Neutrals are warm stone (hue ~80), not green-tinted — tinting neutrals toward the brand muddies the moment when the brand actually appears.

### Brand

| Token | OKLCH (light) | Use |
|---|---|---|
| `--sage` | `oklch(0.46 0.06 138)` | **Filled primary CTA only.** Not on text, borders, focus rings, badges, or backgrounds. |
| `--sage-hover` | `oklch(0.40 0.07 138)` | Hover on primary CTA fill. |
| `--sage-press` | `oklch(0.36 0.07 138)` | Pressed state on primary CTA. |
| `--sage-on` | `oklch(0.99 0.005 95)` | Text on filled primary CTA (warm white). |

Sage in dark theme lifts: `--sage: oklch(0.62 0.07 138)`, `--sage-hover: oklch(0.68 0.08 138)`, `--sage-press: oklch(0.56 0.07 138)`, `--sage-on: oklch(0.14 0.01 138)`.

> Deprecated: `--sage-mid`, `--sage-soft`, `--sage-ink`. They existed to support sage decoration this system no longer permits. Treat as removed from the spec; the CSS will be cleaned up in a follow-up pass.

### Neutrals — Light theme

The page sits on a deep warm cream. Surfaces float on top of it, brighter, with elevation doing the work of dividing them. Three-tier depth: `--paper` (deep cream) → `--surface-highlight` (cream wash, grounded emphasis) → `--surface` (bright, floats highest). Don't compress this — when paper sits within 1% of surface, cards stop reading as cards.

| Token | OKLCH | Use |
|---|---|---|
| `--paper` | `oklch(0.95 0.014 85)` | Page background. Warm parchment cream. |
| `--surface` | `oklch(0.995 0.003 80)` | Raised surfaces, panels. The brightest tier — reserved for things that should float. |
| `--surface-sunk` | `oklch(0.92 0.012 85)` | Recessed areas, inputs at rest. Sits below paper. |
| `--surface-highlight` | `oklch(0.98 0.008 85)` | Cream wash. Featured / up-next sessions, "you're in" pill, quiet emphasis. Between paper and surface. |
| `--border` | `oklch(0.90 0.005 80)` | Default hairlines. |
| `--border-strong` | `oklch(0.76 0.006 80)` | Form controls, focused inputs, dividers that need to assert. |
| `--ink` | `oklch(0.18 0.005 80)` | Primary text. Warm near-black, no green. |
| `--ink-secondary` | `oklch(0.45 0.006 80)` | Secondary text, metadata. |
| `--ink-muted` | `oklch(0.60 0.006 80)` | Placeholder, disabled. |

### Neutrals — Dark theme

Same three-tier depth, inverted. Paper is the deepest pool; surfaces lift out of it.

| Token | OKLCH | Use |
|---|---|---|
| `--paper` | `oklch(0.13 0.006 80)` | Page background. Deep warm charcoal. |
| `--surface` | `oklch(0.20 0.005 80)` | Raised panels. Brightest tier. |
| `--surface-sunk` | `oklch(0.10 0.005 80)` | Recessed areas. Sits below paper. |
| `--surface-highlight` | `oklch(0.24 0.008 80)` | Featured / quiet emphasis in dark. |
| `--border` | `oklch(0.28 0.008 80)` | Default hairlines. |
| `--border-strong` | `oklch(0.42 0.010 80)` | Form controls. |
| `--ink` | `oklch(0.96 0.005 85)` | Primary text. Warm white. |
| `--ink-secondary` | `oklch(0.75 0.005 80)` | Secondary text. |
| `--ink-muted` | `oklch(0.58 0.008 80)` | Placeholder, disabled. |

### Functional

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--warning` | `oklch(0.72 0.14 60)` | `oklch(0.80 0.16 60)` | Amber. Real warning states only — and the live-session pulsing dot, which reads as "right now." Never decoratively. |
| `--danger` | `oklch(0.58 0.22 25)` | `oklch(0.68 0.22 25)` | Deep red. Destructive / error. |
| `--focus` | `oklch(0.30 0.012 80)` | `oklch(0.85 0.008 80)` | Neutral high-contrast focus ring. 2px solid, 2px offset. Replaces the sage focus outline everywhere. |

Affirmative states ("you're in," completed, accepted) do **not** get a color. They read through icon + neutral pill (`--surface-sunk` or `--surface-highlight` background + `--ink-secondary` text + a small check glyph). The design relies on form and copy to communicate completion, not a green wash.

### Rules

- Sage appears once per screen at most, on the primary CTA. If a moment feels like it needs a second accent — or even a second sage — cut the moment instead.
- Focus rings and text selection are neutral. Selection uses `--ink` background with `--paper` text.
- Warning amber appears only on real warning states and on the live-session pulsing dot. Never as decoration.
- Never paint a danger state in sage. Use `--danger`.

## Typography

Two families do everything. Personality lives in the display face; the body face stays out of the way.

### Stacks

```css
--font-display: 'Geist', 'GT Walsheim', 'Söhne', system-ui, sans-serif;
--font-body:    'Inter', 'Geist Sans', system-ui, sans-serif;
--font-mono:    'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
```

Use Geist for both display and body if loading two families is a concern — its weight range carries the full hierarchy.

### Scale (px, ratio ≥ 1.25)

| Token | Size | Line-height | Use |
|---|---|---|---|
| `--text-xs` | 12 | 1.4 | Metadata, eyebrows, timestamps. |
| `--text-sm` | 14 | 1.45 | Captions, dense UI, table cells. |
| `--text-base` | 16 | 1.5 | Default body. |
| `--text-md` | 18 | 1.5 | Emphasized body, lead paragraphs. |
| `--text-lg` | 22 | 1.35 | Section headers, card titles. |
| `--text-xl` | 28 | 1.25 | Page headers. |
| `--text-2xl` | 36 | 1.15 | Display, key UI moments ("This week"). |
| `--text-3xl` | 48 | 1.05 | Hero on landing/onboarding only. |
| `--text-4xl` | 64 | 1.0 | Reserved. |

### Weight

- `400` — body default.
- `500` — emphasized body, button text.
- `600` — display, section headers, card titles.
- `700` — hero moments, page-level "what's next" prompts. Sparingly.

Display sizes (`--text-lg` and up) use tight tracking: `letter-spacing: -0.01em` at `--text-lg`, `-0.02em` at `--text-xl` and above. Body stays at default tracking.

**Hero emphasis is typographic, not chromatic.** The highlighted word in the page hero (the `<em>` inside `.page-hero__title`) shifts to weight `700` against a surrounding `600`, with tracking pulled to `-0.04em`. No color change. Color on hero text is an anti-pattern — sage belongs to the button below it.

Body line length capped at 68ch.

## Layout

### Spacing scale (px, varied for rhythm)

`2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

Do not use the same padding everywhere. A session card uses 16/24 internally; the section it lives in uses 32; the page gutters are 24 on mobile, 48 on desktop. Spacing carries hierarchy.

**Hero owns its margin.** The page hero gets `48px` below it before the dashboard starts — one step above the inter-section gap (`32px`). The eye should land on the hero, breathe, then descend into the grid.

### Grid & gutters

- Mobile (≤640): single column, 20–24px gutters.
- Tablet (641–1024): 2-column hybrid, 24–32px gutters.
- Desktop (≥1025): 12-column where useful, 32–48px gutters. Content width capped at 1120–1200px for primary surfaces.

### Radius

`4 · 8 · 12 · 16 · 24`

- 8 — inputs, small chips, tags.
- 12 — buttons.
- 16 — cards, panels, session blocks. Larger radii read less LMS, more app.
- 24 — hero surfaces, modals, big moments.

### Elevation (shadows)

Shadows are subtle, warm, and never decorative.

- `--shadow-sm`: `0 1px 2px oklch(0.18 0.01 138 / 0.06)`
- `--shadow-md`: `0 4px 16px -2px oklch(0.18 0.01 138 / 0.08), 0 2px 4px oklch(0.18 0.01 138 / 0.04)`
- `--shadow-lg`: `0 12px 32px -6px oklch(0.18 0.01 138 / 0.12), 0 4px 8px oklch(0.18 0.01 138 / 0.05)`
- `--shadow-pop`: `0 8px 24px -4px oklch(0.46 0.06 138 / 0.28)` — sage-tinted, for the primary CTA when hovered. Used very rarely.

Shadow tints stay sage on `--shadow-pop` because it emanates from the sage CTA — that's the one place sage is allowed to extend past the button edge. Everywhere else, shadows are neutral ink-tinted. Dark theme shadows are deeper but keep the same hue.

## Components (starter patterns)

These are direction, not specs. Code lives in `client/src/components/*` once built.

### Button — primary

The only sage element on the screen.

- Sage fill, `--sage-on` text, `--radius: 12`, padding `12px 20px`.
- Display font, weight 500, `--text-md`.
- Hover: shift to `--sage-hover`, lift 1px, `--shadow-pop` appears.
- Active: no shadow, depress 1px.
- Focus: 2px sage outline at 2px offset. (The one place sage paints anything but the fill.)

### Button — secondary

- Transparent fill, `1.5px` border `--border-strong`, `--ink` text.
- Hover: background `--surface-sunk`, border darkens to `--ink-muted`.
- Focus: `--focus` outline at 2px offset. No sage.

### Button — ghost

- No border, no background. Hover: subtle `--surface-sunk` background, no border ever.
- Focus: `--focus` outline at 2px offset. No sage.

### Session card — three tiers of depth

Sessions stratify by urgency, and the visual tiers must match. Three tiers, not two: live (right now), featured (next-up / soon), regular (the rest). Each tier sits on a different surface at a different elevation. The squint test should reveal which session matters most before any text is read.

- **Regular session** — `--surface` background, `1px --border` border, `--r-xl` radius, `var(--sp-5)` padding. The default. Quiet.
- **Featured (up-next)** — `--surface-highlight` (cream wash) background, `1px --border-strong` border, `--r-xl` radius, `var(--sp-6)` padding, `--shadow-sm`. Grounded in cream so it reads as a held position, not a moving target.
- **Live (right now)** — `--surface` background (the brightest tier, the same crisp white the page sits beneath), `1px --ink` border, `--r-2xl` radius, `var(--sp-7) var(--sp-6)` padding, `--shadow-lg`. It floats highest off the paper. Pulsing amber dot top-right; monochrome `Live` pill.

Title in display, `--text-lg`, weight 600. Time in mono, `--text-sm`. People as overlapping avatar stack. Primary action (Join, Accept) is the sage button bottom-right — the only sage on the card. Secondary actions are ghost icons.

**Live & imminent treatment:**

Color belongs to the action you can take, not the state you're in. Live communicates through depth, elevation, and a single amber pulse — never a green wash.

- **Live session** — see above. Brightest surface, biggest shadow, biggest radius. Pulsing dot is `--warning`. "Live" pill is `--ink` filled with `--paper` text.
- **Imminent ("In 6 min")** — `--surface-highlight` background, `--ink` text. Time in mono.
- **"You're in" badge** — `--surface-sunk` background, `--ink-secondary` text, small check glyph. No color.
- **TopBar notification dot** — `--ink` for default presence. If the dot needs to read as unread, use `--warning` for counts ≥ 1.

### Input

- `--surface-sunk` background, `1.5px --border` border, `--radius: 12`, padding `10px 14px`.
- Focus: border `--focus`, shadow `0 0 0 4px oklch(0.30 0.012 80 / 0.15)`. No focus-jump. No sage.

### Avatar

- Circular. Initials in display font weight 600 on a saturated tint derived from the user's id-hash. Never gray default avatars.

## Motion

Energy: **medium — purposeful, snappy.**

### Durations

- `--motion-instant`: 100ms — hover/press feedback, tooltip in.
- `--motion-quick`: 180ms — small UI (chips, toggles, pill switches).
- `--motion-base`: 240ms — components (cards, dropdowns, drawer slides).
- `--motion-page`: 320ms — page-level transitions, modals, route changes.

### Easing

- `--ease-out`: `cubic-bezier(0.22, 1, 0.36, 1)` — ease-out-quart. Default for entries.
- `--ease-in`: `cubic-bezier(0.64, 0, 0.78, 0)` — for exits.
- `--ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — gentle overshoot for the join confirmation moment **only.** Never decorative bounce, never on layout.

### Rules

- Animate `transform` and `opacity`. Never animate layout properties (width, height, top, left, padding).
- Honor `prefers-reduced-motion`: fall back to opacity-only crossfades at `--motion-quick`. No translates beyond 4px, no scale changes.
- Reserve `--ease-spring` for one specific moment: confirming a session join. Everywhere else, ease-out-quart.

## Iconography

- Stroke icons at 1.75px, rounded caps. Lucide is a good starting library.
- Never mix stroke and filled icons in the same surface.
- Icon size matches the line-height of adjacent text: 16px for `--text-base`, 20px for `--text-md`, 24px for `--text-lg`.

## Anti-patterns (for this product specifically)

- **No card grids of identical session tiles.** Sessions vary in time, urgency, attendance — the layout should too. Today is larger than next-week; soon-starting pulls the eye.
- **No side-stripe borders on cards.** Today's session uses a full `--surface-highlight` background, not a 4px left border.
- **No gradient text, and no colored text.** The hero `<em>` carries weight through type, not color. Sage on text is an anti-pattern.
- **No glassmorphism.** Surfaces are flat with subtle ink-tinted shadow, never blurred.
- **No modals where an inline expand would do.** Accepting a session invite expands the card; it doesn't open a dialog.
- **No "Welcome back, [Name]" SaaS greetings.** The hero line is what's *next*, not who you are.
- **No second brand color, and no decorative brand color.** Sage appears once per screen at most, on the primary CTA. If a moment feels like it needs a second accent — or even a second sage — cut the moment instead.
- **No sage outside the primary CTA.** Not on text, not on borders, not on focus rings, not on "today" backgrounds, not on badges or pills. The primary button is the entire sage budget for a screen.
- **No colored "Live" or "You're in" pills.** Live reads through a pulsing amber dot plus a monochrome ink pill; "you're in" reads through a check glyph plus a neutral pill. Color belongs to the action you can take, not the state you're in.
- **No green-tinted neutrals.** Paper, ink, surfaces, and borders are warm stone (hue ~80), not sage-tinted (hue 138). Tinting neutrals toward the brand muddies the moment when the brand actually appears.
