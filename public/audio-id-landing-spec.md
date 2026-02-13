# Audio ID — Landing Page Feature Positioning
Design: Jony | Feb 12, 2026

---

## The Problem
Audio ID (mic button → identify track → buy/save) is Traxscout's 10x feature. 
It's currently **not mentioned anywhere on the landing page.** That needs to change.

---

## Where It Lives
**Between the hero section and the pricing cards.** It gets its own full-width section.

Why here: The hero sells the concept ("Dig smarter, not harder"). The feature grid sells the daily workflow (scanning, curation, digest). Audio ID is the WOW moment — the thing that makes someone say "wait, it does THAT?" It needs space to breathe, not a bullet point in a feature list.

---

## Section Layout

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                   Hear it. Know it. Own it.              │
│                                                          │
│     Hear a track at a club? Tap the mic. Traxscout       │
│     identifies it in seconds — then shows you where      │
│     to buy it and which DJs are playing it.              │
│                                                          │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │              │  │              │  │              │    │
│   │  1. TAP      │  │  2. MATCH   │  │  3. OWN     │    │
│   │              │  │              │  │              │    │
│   │  [mic icon]  │  │  [waveform] │  │  [cart icon] │    │
│   │              │  │              │  │              │    │
│   │  Tap the mic │  │  Identified  │  │  Buy on      │    │
│   │  button.     │  │  in under   │  │  Beatport or │    │
│   │  Hold your   │  │  5 seconds. │  │  Traxsource  │    │
│   │  phone up.   │  │  Artist,    │  │  with one    │    │
│   │              │  │  title,     │  │  tap. Add to │    │
│   │              │  │  label,     │  │  your crate. │    │
│   │              │  │  BPM, key.  │  │              │    │
│   └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│          "They can hide the screen.                      │
│           They can't hide the sound."                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Copy

### Headline
**Hear it. Know it. Own it.**

### Body
Hear a track at a club? Tap the mic. Traxscout identifies it in seconds — then shows you where to buy it and which DJs are playing it.

### Three Steps

**1. Tap**
Tap the mic button. Hold your phone up for 5 seconds.

**2. Match**
Identified in under 5 seconds. Artist, title, label, BPM, key — all verified.

**3. Own**
Buy on Beatport, Traxsource, Promo Box, or Label Worx with one tap. Add to your crate instantly.

### Closing Line
*"They can hide the screen. They can't hide the sound."*
(Italicized, centered, #8A8A8A — this is the emotional hook)

---

## Design Spec

### Section Background
- #0A0A0A base with a very subtle radial gradient from #7C3AED at 3% opacity, centered behind the three cards
- Creates a gentle purple "glow" that signals this section is special

### Headline
- Inter 700, 36px (desktop) / 28px (mobile)
- #F5F5F5
- Centered

### Body Text
- Inter 400, 16px, #A3A3A3
- Max-width 560px, centered
- Line-height 1.6

### Step Cards
- Background: #141414
- Border: 1px solid #2A2A2A
- Radius: 12px
- Padding: 32px 24px
- Width: 3-column grid, gap 20px (stack on mobile)

### Step Number
- "1. TAP" — Inter 700, 12px, #7C3AED, uppercase, letter-spacing 2px

### Step Icon
- 48px, centered
- Mic icon: purple #7C3AED
- Waveform icon: gold #F59E0B
- Cart icon: green #22C55E

### Step Description
- Inter 400, 14px, #A3A3A3, centered, line-height 1.5

### Closing Line
- Inter 400 Italic, 16px, #6B6B6B
- Centered, margin-top 40px

---

## Mobile (< 768px)
- Cards stack vertically with 12px gap
- Headline: 28px
- Icons: 40px
- Section padding: 48px 20px

---

## What This Replaces
The current landing page has these feature bullets:
- "Multi-store scanning"
- "AI vibe matching"
- "Daily digest"

Audio ID is more compelling than all three. It should be the SECOND thing a visitor sees after the hero. The feature bullets can stay below it.

---

## Also: Fix the Current Feature Claims

The landing page currently advertises:
- "AI vibe matching" — NOT shipping at launch
- "AI smart curation" — NOT shipping at launch
- "AI track descriptions" — NOT shipping at launch

**These need to be either:**
1. Removed entirely, or
2. Marked "Coming soon" with a subtle badge

Never promise features you can't deliver on day one. Trust is everything with a new product.

**Replace with features that ARE shipping:**
- Audio ID (this section)
- Multi-platform scanning (user-auth connected accounts)
- 20 daily curated picks
- Offline crates (PWA)
- Verified BPM & key data
