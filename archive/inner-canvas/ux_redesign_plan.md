# Inner Canvas — UX Redesign Plan

## ✨ Design Inspiration

The reference image features **luminous celestial whales** swimming through deep space, decorated with golden sakura flowers and glowing stardust. Key visual qualities to extract:

| Quality | How We'll Use It |
|---|---|
| **Deep cosmic black** (`#050510`) | Background — richer, more blue-black than current flat `#0a0a0f` |
| **Luminous blues** (`#4a7bd4`, `#6ba3e8`) | Primary accent — replaces lavender for a celestial feel |
| **Golden particles** (`#f4d03f`, `#e8b84d`) | Particle system — stardust floating across the canvas |
| **Soft pinks/sakura** (`#e8a0bf`, `#f5b7b1`) | Secondary accent — warm floral undertones |
| **Glowing horizon line** | Bottom glow gradient — anchoring the scene |
| **Stardust density** | Ambient particles — denser, multi-layered, more alive |

---

## 🚫 Problems with Current UX

1. **Greeting is too intimate** — "Can't sleep? Let it out" feels like a therapy app
2. **Landing is too empty** — just a text + textarea on black, no atmosphere or wow-factor
3. **No visual identity** — nothing tells the user "this is special" before they type
4. **Flat, lifeless background** — subtle grain overlay is invisible; no sense of depth

---

## 🎨 New Design Direction: "Celestial Reflection"

### Tone Shift
- **From**: Quiet therapy session ("Let it out")
- **To**: Cosmic creative ritual ("Your words become light")
- The app should feel like entering a **planetarium**, not a therapist's office

### New Greeting Copy (neutral, inspiring, not intimate)
Instead of time-of-day intimacy, use **universal invitations**:
- "What's on your mind?" ← simple, clean
- "Your thoughts paint the sky." 
- "Write something. Watch it glow."
- **Selected**: cycle between a few poetic-but-neutral options

---

## 📐 Screen-by-Screen Redesign

### Screen 1: Celestial Landing (currently: Entry Screen)

````carousel
**Current State** 
- Plain black background  
- Italic greeting: "Can't sleep? Let it out"  
- Glass-bordered textarea  
- "Feel This" button appears after typing  

Nothing visual, nothing atmospheric.
<!-- slide -->
**New Design**

- **Animated starfield background** — golden + blue particles drifting upward (30-50 particles, varied sizes, some with bloom)
- **Subtle bottom horizon glow** — a warm gold-to-transparent gradient across the bottom 15% (inspired by the glowing city line in the whale image)
- **App title**: "Inner Canvas" in large, elegant serif — fades in on load
- **Subtitle**: "Write something. Watch it glow." — smaller, secondary color
- **Textarea** — slightly larger, centered, with a soft golden border glow on focus (not lavender)
- **"Create" button** — replaces "Feel This" — gold accent, pill shape
- **Floating decorative elements** — 2-3 very faint, large, blurred circular shapes in blue/gold drifting slowly (like distant nebulae, evoking the whale silhouettes without literally being whales)

Layout:
```
┌─────────────────────────────────────┐
│            ✧  ·  ✦                  │  ← starfield particles
│                                     │
│         I N N E R  C A N V A S      │  ← title (Cormorant Garamond, 300)
│      Write something. Watch it glow │  ← subtitle (Inter, light)
│                                     │
│    ┌────────────────────────────┐    │
│    │                            │    │  ← textarea (golden glow focus)
│    │   Start writing...         │    │
│    │                            │    │
│    └────────────────────────────┘    │
│                                     │
│             [ Create ]              │  ← gold accent button
│                                     │
│  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │  ← horizon glow line
└─────────────────────────────────────┘
```
````

### Screen 2: Constellation Ceremony (currently: Generation Ceremony)

> [!NOTE]
> User said they **like** the loading ball. We keep the orb + ripple mechanic but enhance visuals.

**Changes:**
- Orb gets a **cosmic gradient** (blues + golds instead of lavender)
- Particle system **intensifies** during ceremony (50→80 particles, faster drift)
- **Nebula blobs** pulse in the background  
- Status text becomes more evocative:
  - "Listening to your words..." → "Reading the starlight..."
  - "Finding the colors..." → "Painting your constellation..."
  - "Almost there..." → "Almost formed..."

### Screen 3: Reveal (no major structural changes)

- Keep the art materializing + typewriter reflection (these work great)
- Update **color wash** to use more saturated blues/golds  
- Add a **subtle star burst** around the art frame when it fully materializes
- Update action button styling to match gold accent

---

## 🔧 Implementation Plan

### Files to Modify

| File | Changes |
|---|---|
| `styles/index.css` | New color palette, new CSS variables, updated bg |
| `styles/layout.css` | Add nebula blobs, horizon glow, update spacing |
| `styles/components.css` | Restyle textarea focus, button, greeting → title/subtitle |
| `styles/animations.css` | New keyframes: nebula drift, horizon pulse, title entrance |
| `index.html` | Add title + subtitle elements, rename button text, add horizon/nebula DOM elements |
| `js/app.js` | Replace `getGreeting()` with fixed title/subtitle, update submit logic |
| `js/api.js` | Update greeting function |
| `js/particles.js` | Default colors → gold/blue, increase initial ambient count |
| `js/ceremony.js` | Update status phrases |

### What We Keep (unchanged)
- ✅ Orb breathing + burst mechanic  
- ✅ Art materialization reveal  
- ✅ Typewriter reflection question  
- ✅ Particle system architecture  
- ✅ Backend (no changes needed)
- ✅ Timeline / save functionality

### Implementation Order
1. **CSS tokens** — swap color palette from lavender→celestial  
2. **HTML structure** — add title, subtitle, horizon glow, nebula layers  
3. **Particles** — gold/blue defaults, increase count, auto-start on load  
4. **Landing page atmosphere** — nebula blobs, horizon, animations  
5. **Component restyle** — textarea, button, status text  
6. **Ceremony updates** — status phrases, enhanced orb colors  
7. **Polish** — test flow end-to-end, tune timings  

---

## 🎯 Expected Result

When you open the app, instead of a barren dark page with "Can't sleep?", you see:

> A deep cosmic canvas alive with drifting golden stardust. The title **"Inner Canvas"** appears in elegant serif type. Below it, a soft invitation: *"Write something. Watch it glow."* The textarea has a warm golden shimmer on focus. Faint nebula shapes drift behind. A warm horizon glow anchors the bottom edge. The whole experience feels like stepping into a planetarium — cosmic, beautiful, and inspiring.
