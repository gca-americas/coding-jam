# City Pop — UX Style Reference

> **Year In Poetry** edition · last updated May 2026

---

## The feeling in one line

**A glossy summer evening on the Tokyo Bay coast in 1986, soundtracked by a song you can't name but already love — palm trees against a fading peach sky, a red sports car still warm from the highway, and a beautiful woman holding a martini, looking at you like she has somewhere better to be.**

The dominant emotion is **bittersweet leisure** — sunset nostalgia, urban affluence, romantic distance, glossy melancholy. Every design decision should serve this mood.

---

## Quick identity test

Before shipping any change, run these five checks:

| # | Test | Pass condition |
|---|------|---------------|
| 1 | **Sunset gradient** | Teal → cream → peach → pink → magenta is clearly present as the atmospheric canvas |
| 2 | **Palm silhouette** | If palms are present, they have curved fronds fanning from tall trunks — NOT vertical spikes (those are reeds) |
| 3 | **Glamour** | Does this feel *expensive and slightly aloof*, like an 80s perfume ad? If too friendly, push toward elegance |
| 4 | **Cel-animation feel** | Flat color, ink outlines, airbrushed shading — never 3D, never photorealistic |
| 5 | **Vaporwave veto** | No Greek statues, no Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ wide text, no glitch, no pink/cyan grid floor. City pop is *sincere* |

---

## What this aesthetic IS

- **Sunset gradient sky** — teal at top, fading through cream, peach, coral, hot pink to magenta at the horizon
- **The retro striped sun** — a large pale-cream sun with horizontal coral-pink scan-line stripes cutting across it
- **Palm tree silhouettes** — pure flat black, graphic shape, fronds visible as sharp silhouette spikes from a tall trunk (NOT detailed painted plants, NOT reeds or grass)
- **Hand-drawn cel animation feel** — visible ink lines, flat color fills with airbrushed gradient shading
- **Album-sleeve composition** — like a freeze-frame from a 1986 anime cologne commercial, or a vinyl record cover
- **Magazine-asymmetric layout** — never symmetric grids; content feels editorial, not dashboard

## What this aesthetic IS NOT

| Anti-pattern | Why it fails |
|---|---|
| Sunset gradient with no focal point | Decoration without subject — the #1 failure mode |
| Vaporwave (ironic nostalgia, neon grids, glitch) | City pop is the *sincere* version |
| Synthwave (Tron lines, laser horizons) | Wrong era, wrong geometry |
| Y2K dreamcore / Windows 98 chrome | Wrong decade entirely |
| Moe / kawaii / chibi | City pop women are *adult, sophisticated, slightly aloof* |
| Photorealism / 3D render | Breaks the hand-painted cel-animation contract |
| Sad / grungy / glitchy | The melancholy is *gentle and luxurious* |

---

## Design tokens

All tokens are defined as CSS custom properties in `frontend/style.css`. Reference them by variable name — never hard-code hex values in components.

### Color system

```
Sunset sky gradient (top → bottom)
──────────────────────────────────
--sky-teal        #5DC4C4    upper sky
--sky-cyan        #7FD4D4
--sky-cream       #F5DCAA    sun-glow band
--sky-peach       #F4A876
--sky-coral       #E87B7B
--sky-pink        #E6789B    hot pink
--sky-magenta     #C25D8A    deepest horizon

Sun + scan lines
────────────────
--sun-cream       #F5E1A8
--scanline        rgba(229, 120, 155, 0.6)

Objects / UI
────────────
--ferrari-red     #D63A2F    primary action color
--ferrari-shadow  #8B1F1A    hover / pressed state
--palm-silhouette #1A1A2E    near-black with hint of indigo

Surface / text
──────────────
--ink-deep        #2A1838    body copy on light surfaces
--cream-paper     #FAEBD7    off-white text on dark, or card surface
--card-bg         rgba(250, 235, 215, 0.85)   semi-transparent cream
--neon-accent     #FF4F8B    used SPARINGLY — highlights only
```

### The sunset gradient

Applied via `.bg-sunset` on the fixed background canvas. This is the single most recognizable element — every screen uses it.

```css
background: linear-gradient(180deg,
  var(--sky-teal) 0%,
  var(--sky-cyan) 25%,
  var(--sky-cream) 45%,
  var(--sky-peach) 60%,
  var(--sky-coral) 75%,
  var(--sky-pink) 90%,
  var(--sky-magenta) 100%);
```

### Calendar accent palette

Used to differentiate highlighted days and note cards across months. Cycles through in order:

```js
['#E87B7B', '#5DC4C4', '#F4A876', '#C25D8A', '#7FD4D4', '#E6789B']
```

---

## Typography

| Role | Family | Weight | Tracking | Usage |
|------|--------|--------|----------|-------|
| **Display** | `Italiana`, `Playfair Display` | 400 | `0.08em` | Hero titles, section headings, `text-transform: uppercase` |
| **Italic accent** | `Playfair Display Italic` | 400 | — | Connector words ("in", "of") inside titles; subtitle copy |
| **Japanese accent** | `Noto Serif JP` | 400–700 | — | Single kanji used as decorative flavor: 夜 海 夢 恋 街 |
| **Body** | `Inter` | 400–600 | — | All readable content, labels, buttons |

**Casing rules:**
- Hero titles → `ALL CAPS` with wide letter-spacing
- Section headings → `UPPERCASE` via `text-transform`
- Buttons → lowercase (`press play to begin`)
- Atmospheric small text → lowercase, italic
- Single kanji → decorative only, `opacity: 0.15–0.25`, never as content

All fonts are loaded via Google Fonts in `index.html`:
```
Italiana | Playfair Display (regular, bold, italic) | Noto Serif JP | Inter (400, 500, 600)
```

---

## Signature elements

### 1. The Striped Sun (`.city-pop-sun`)

Large pale-cream circle with horizontal coral scan-line stripes. Always a background element, never foreground. Positioned in the lower-right quadrant of the viewport. Has a warm glow halo via `box-shadow`.

Reacts to mouse position on the landing screen — subtle parallax (±15px).

```css
.city-pop-sun {
  width: 380px; height: 380px;
  border-radius: 50%;
  background-image:
    repeating-linear-gradient(180deg,
      transparent 0px, transparent 14px,
      var(--scanline) 14px, var(--scanline) 18px),
    radial-gradient(circle, var(--sun-cream), var(--sky-cream));
  box-shadow: 0 0 80px 20px rgba(245, 225, 168, 0.6);
}
```

### 2. Palm tree silhouettes

Inline SVGs in the background layer — one left, one mirrored right. **Must read as palm trees from silhouette alone**: tall trunk with curved fronds fanning from the top.

> ⚠️ A common generation failure: vertical spikes from the ground that look like reeds or grass. If the shape can't be identified as a palm by a child, it's wrong.

### 3. Ocean horizon

A dark-to-magenta gradient band at the bottom of the viewport, anchoring the sunset composition. Creates depth without literal water illustration.

### 4. Kanji accent

A single oversized kanji character (currently 夜 "night") positioned fixed in the upper-right corner at `12rem`, `opacity: 0.15`, as pure decorative texture. Never use multiple kanji scattered around — one is flavor, more is clutter.

### 5. Noise overlay

Fractal noise SVG at `opacity: 0.05` with `mix-blend-mode: overlay` — adds subtle grain texture to the gradient, preventing it from looking digitally flat.

---

## Component patterns

### Cards (`.moment-card`, `.note-card`, `.month-block`)

All content cards follow the same visual language:

| Property | Value | Notes |
|----------|-------|-------|
| Background | `var(--card-bg)` — semi-transparent cream | Not chrome, not glass |
| Border | `1px solid` in coral or subtle ink | Thin, defined edges |
| Border-radius | `0` | City pop is sharp — no rounded corners on cards |
| Shadow | `4px 4px 0px rgba(42, 24, 56, 0.1)` | Hard offset shadow, not blurred |
| Hover | `translate(-2px, -2px)` + deeper shadow | "Lift" effect — card pulls toward you |
| Accent stripe | Left-edge bar or top-edge gradient | Color identification |

**Moment cards** have a left coral accent stripe (4px `::before`), track numbering (`Track 01`), and animate in with `translateY(16px) → 0`.

**Month blocks** have a top rainbow gradient stripe (teal → peach → pink) and use Intersection Observer for scroll-triggered reveal.

**Note cards** slide in from left (`translateX(-16px) → 0`) with staggered delays per month.

### Buttons

**Primary** (`.btn-begin`, `.btn-generate`):
- Background: `var(--ferrari-red)` with cream text
- Border: `2px solid` matching background
- Border-radius: **0** (flat ink style)
- Shadow: `4px 4px 0px` hard offset
- Hover: deeper red + lift + gloss sweep (`::after` pseudo-element)
- Text: `Inter` weight 500, lowercase, `letter-spacing: 0.05em`

**Ghost/secondary** (`.suggestion-chip`, `.btn-download`):
- Transparent background with ink border
- Hover inverts to filled (ink bg, cream text)
- Same hard shadow on hover

**Text link** (`.btn-start-over`):
- No background, no border
- Underline with offset
- Coral on hover

### Form inputs (`.field-input`)

- Background: `rgba(250, 235, 215, 0.5)` — translucent cream
- Border-radius: `0` — sharp
- Focus: coral border + deeper cream background + hard shadow
- Placeholder: ink at 30% opacity, italic
- Date inputs use `color-scheme: light`

---

## Layout architecture

### Background canvas (fixed, z-index: 0)

```
┌─────────────────────────────────────┐
│  .bg-sunset     (full gradient)     │
│  .bg-noise      (grain overlay)     │
│  .city-pop-sun  (striped sun, abs)  │
│  .palm-left     (SVG silhouette)    │
│  .palm-right    (SVG mirrored)      │
│  .ocean-horizon (dark band, bottom) │
│  .bg-vignette   (subtle edge dim)   │
│  .kanji-accent  (fixed, decorative) │
└─────────────────────────────────────┘
```

All screens render on top of this shared background. The sunset is the constant canvas.

### Screen system

Four screens, only one active at a time. Transitions use opacity fade with a subtle `scale(0.98)` shrink on exit.

```
Landing → Input → Loading → Calendar
```

| Screen | Layout | Key characteristic |
|--------|--------|--------------------|
| **Landing** | Centered flex, content offset left | Magazine-asymmetric — title block lives left of center, sun lives right |
| **Input** | Centered column, 680px max-width | Card stack with fixed bottom action bar |
| **Loading** | Centered, full-screen canvas | Constellation animation + radio-themed status text |
| **Calendar** | Centered column, 860px max-width | Month blocks with scroll-triggered reveal + progress bar |

### Landing composition (album-sleeve layout)

```
┌──────────────────────────────────────────┐
│   [kanji 夜, fixed upper-right]          │
│                                          │
│      MY                                  │
│      YEAR              ┌────────────┐    │
│       in               │            │    │
│      MOMENTS           │   ● SUN ●  │    │
│      ──────────        │            │    │
│      subtitle copy     └────────────┘    │
│                                          │
│      [ press play to begin ]             │
│                                          │
│  🌴                                 🌴   │
│  ═══════ ocean horizon ═════════════     │
└──────────────────────────────────────────┘
```

The content is deliberately offset (`margin-left: -10vw`, `margin-top: -10vh`) to break symmetry. Title words stagger-animate in with `translateY(20px) → 0`.

---

## Animation & motion

### Easing

All animations use the custom easing curve:
```css
--ease-city: cubic-bezier(0.22, 1, 0.36, 1);
```
This produces a snappy start with a long, luxurious deceleration — it should feel like a car gliding to a stop.

### Motion inventory

| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Title words | `translateY(20px) → 0` + fade | 0.8s | Staggered: 0.2s, 0.35s, 0.5s, 0.65s |
| Landing line | `width: 0 → 300px` | 0.8s | 1.1s |
| Subtitle | Fade in | 0.6s | 1.4s |
| Begin button | `scale(0.95) → 1` + fade | 0.5s | 1.8s |
| Moment cards | `translateY(16px) → 0` + fade | 0.4s | On mount |
| Month blocks | `translateY(24px) → 0` + fade | 0.6s | On scroll intersection |
| Note cards | `translateX(-16px) → 0` + fade | 0.45s | Staggered after parent reveal |
| Button hover gloss | `left: -100% → 150%` skew sweep | 0.5s | On hover |
| Card hover | `translate(-2px, -2px)` lift | 0.3s | On hover |
| Sun parallax | `translate(±15px)` | Instant | On mousemove |
| Card removal | `scale(0.95)` + collapse height | 0.3s | On remove |

### Reduced motion

All animations collapse to `0.01ms` duration under `prefers-reduced-motion: reduce`.

---

## Voice & microcopy

The voice is **late-night FM radio** — warm, slightly detached, musical.

| Context | Copy | Tone |
|---------|------|------|
| Loading | `"tuning in... ♪"` → `"adjusting frequency..."` → `"recording to mixtape ♥"` | Radio DJ |
| Error | `"signal lost — try again ?"` | Gentle, not alarming |
| Empty month | `"the night is young..."` | Atmospheric |
| Begin button | `"press play to begin"` | Inviting, musical |
| Generate button | `"Generate ♪"` | Light |
| Restart | `"♪ create another year"` | Warm |
| Counter | `"3 tracks added"` | Uses "tracks" not "moments" in the counter |

**Casing conventions:**
- Hero titles: `ALL CAPS WIDE-TRACKED`
- Section headings: `UPPERCASE`
- Buttons and atmospheric text: `lowercase`
- Single kanji accents in margins only

---

## Responsive behavior

At `≤ 768px`:

| Element | Adaptation |
|---------|------------|
| Landing title | Drops to `3.5rem` |
| Month blocks | Padding shrinks to `24px` |
| Day cells | Smaller padding, `0.85rem` font |
| Note cards | Stack vertically (column direction) |
| Bottom action bar | Column layout with `16px 20px` padding |
| Striped sun | Shrinks to `250px`, repositions (`right: -50px`) |

---

## Scroll behavior

- `scroll-behavior: smooth` on `html`
- Scroll progress bar (`.scroll-progress`) appears only on the calendar screen — a `4px` `ferrari-red` bar at `position: fixed; top: 0`
- Month blocks reveal on scroll via `IntersectionObserver` at `threshold: 0.15`
- Note cards within each month stagger-reveal `200ms + (index × 150ms)` after parent enters viewport
- Closing section reveals at `threshold: 0.3`

---

## File map

```
year-in-poetry/
├── frontend/
│   ├── index.html       ← Structure, fonts, SVG palms, screen sections
│   ├── style.css        ← All tokens, components, layout, animation
│   └── app.js           ← Screen transitions, card management, API calls,
│                           calendar rendering, scroll observers
├── backend/
│   ├── main.py          ← FastAPI server, Gemini integration, static file serving
│   ├── .env             ← GEMINI_API_KEY
│   ├── pyproject.toml
│   └── requirements.txt
├── README.md
└── STYLE_GUIDE.md       ← This file
```

---

## Inspiration anchors

These are *flavor references*, not literal copies:

| Category | References |
|----------|------------|
| **Album art** | Mariya Takeuchi *Plastic Love*, Anri *Timely!!*, Tatsuro Yamashita *For You*, Junko Ohashi *Magical* |
| **Painters** | Hiroshi Nagai (definitive city pop landscape), Eizin Suzuki, Yu Nagaba |
| **Anime** | Cat's Eye, City Hunter, Maison Ikkoku — adult late-80s, NOT modern anime |
| **Mood** | Atami coastline, Odaiba waterfront pre-Rainbow Bridge, 80s Japanese imagination of Hawaii/Miami |
| **Print** | Popeye magazine 1984–1989, JJ magazine, an-an sunset issues |
| **Cars** | Ferrari Testarossa, Toyota Soarer, Nissan 300ZX |

---

## When in doubt

- Default to **elegance over friendliness** — this aesthetic is glossy, not cozy
- Cards are flat and sharp (0 border-radius), shadows are hard offset (not blurred)
- The sunset gradient is the canvas, not a decoration — everything lives on top of it
- One kanji is flavor; multiple is clutter
- If it could be tagged `#vaporwave` instead of `#citypop`, pull back toward sincerity
