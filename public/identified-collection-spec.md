# Identified Collection — Trophy Case Spec
**Design: Jony | Feb 13, 2026**
**Location: Dashboard → "Identified" section card → Full view**

---

## ACCESS POINTS

1. **Dashboard section** — "Identified" card showing last 2-3 IDs with "See All" link
2. **Audio ID tab** → "Recent" at bottom of idle screen (already in audio-id-v2)
3. **Direct nav** — dedicated view accessible from both

---

## HEADER

- Back chevron: "‹ Home" (#7C3AED)
- Large title: "Identified" (34px, 800 weight, -1px tracking)
- Count: "23 tracks" (JetBrains Mono, 14px, #48484A) — right-aligned

---

## STATS STRIP

Three mini cards in a row:

| Stat | Color | Token |
|------|-------|-------|
| Total IDs | #A78BFA (purple) | Total identified tracks |
| Saved | #4ADE80 (green) | IDs saved to crate |
| Purchased | #FBBF24 (gold) | IDs bought from stores |

- 20px JetBrains Mono bold value
- 9px uppercase label
- Accent line on top (gradient, 1px)
- Cards: rgba(255,255,255,0.02) bg, 14px radius

---

## FILTER PILLS

Horizontal row: `All` | `Saved` | `Unsaved` | `Purchased`

- Active: rgba(124,58,237,0.15) bg, #C4B5FD text, purple border
- Inactive: rgba(255,255,255,0.02) bg, #48484A text
- 12px, 600 weight, 20px radius, 7px 14px padding

---

## DATE GROUPING

Cards grouped by date:
- "Today" / "Yesterday" / "Last Week" / "February 2026" / etc.
- 11px, 600 weight, #2C2C2E, uppercase, 1.5px tracking
- Sticky on scroll (optional — nice-to-have)

---

## ID CARD — ANATOMY

Each card contains 4 zones:

### Zone 1: Track Info (top)
```
┌──────────────────────────────────────┐
│ [72×72 art]  Title                   │
│              Artist                  │
│              Label                   │
│              [126] [7A] [Tech House] │
└──────────────────────────────────────┘
```
- Art: 72×72px, 16px radius, box-shadow
- Title: 17px, 700 weight
- Artist: 14px, #8E8E93
- Label: 12px, #48484A
- Tags: same system as track cards (BPM purple, Key gold, Genre gray)

### Zone 2: Context Row
```
🎙 Mic · 3s match  •  📍 LIV Miami  •  2:34 AM
```
- How it was identified: 🎙 Mic / 🔗 Link (+ source) / 🔊 Tab
- Match speed: "3s match" (how fast the fingerprint matched)
- Location: venue name (if location services enabled)
- Time: when it was ID'd
- All 11px, #3A3A3C, dot dividers

### Zone 3: Waveform + Sources
- Mini waveform: 20px height, purple bars at 15% opacity
- Source pills: colored badges showing where the track is available
  - Beatport (#00D4AA), Traxsource (#3B82F6), Promo Box (#E11D48), etc.

### Zone 4: Action Bar
Three equal buttons separated by 0.5px borders:
```
[ ♥ Save ]  [ ↗ Buy $1.49 ]  [ ··· More ]
```

**States:**
- Unsaved: "♥ Save" in #A78BFA
- Saved: "✓ Saved" in #4ADE80
- Purchased: "✓ Purchased" in #4ADE80
- Buy: "↗ Buy $X.XX" in #F5F5F5
- More: "··· More" in #636366

**"More" long-press menu (bottom sheet):**
- Add to playlist
- Share
- Play preview
- View on [source]
- Remove from history

---

## CARD VARIANTS

### Latest Card (most recent)
- Purple gradient accent: `linear-gradient(135deg, rgba(124,58,237,0.04), transparent 60%)`
- Purple border: `rgba(124,58,237,0.08)`
- Top accent line: gradient purple
- Waveform visible

### Standard Card
- Default surface: `rgba(255,255,255,0.015)`
- Subtle border: `rgba(255,255,255,0.03)`
- No waveform (saves vertical space)

---

## LOCATION DATA

```typescript
// When Audio ID matches, capture location if permitted
interface AudioIdResult {
  trackId: string
  matchedAt: Date
  matchMethod: 'mic' | 'link' | 'tab'
  matchDuration?: number  // seconds to match (mic only)
  linkSource?: string     // 'soundcloud' | 'youtube' etc (link only)
  location?: {
    lat: number
    lng: number
    venueName?: string    // reverse geocoded or user-tagged
    city?: string
  }
}

// Venue name resolution:
// 1. Check against known venue database (clubs, festivals)
// 2. Reverse geocode via Google Places
// 3. Fallback: city name
// 4. If location denied: omit entirely
```

### Known Venues (seed list for Miami)
```typescript
const KNOWN_VENUES = [
  { name: 'LIV Miami', lat: 25.8019, lng: -80.1222 },
  { name: 'E11EVEN Miami', lat: 25.7744, lng: -80.1905 },
  { name: 'Space Miami', lat: 25.7820, lng: -80.1966 },
  { name: 'Club Space', lat: 25.7820, lng: -80.1966 },
  { name: 'Do Not Sit', lat: 25.7903, lng: -80.1340 },
  { name: 'Floyd Miami', lat: 25.7664, lng: -80.1930 },
  // Expand via community submissions
]
// Match if user is within 200m of known venue coordinates
```

---

## DASHBOARD INTEGRATION

Add to the Dashboard (between "Today's Picks" and "Trending"):

```
┌──────────────────────────────────────┐
│ Identified                  See All  │
│                                      │
│ [art] Out of My Mind · 2:34 AM       │
│       🎙 LIV Miami          [Saved]  │
│                                      │
│ [art] Freaks · 11:20 PM             │
│       🔗 SoundCloud          [Save]  │
└──────────────────────────────────────┘
```

- Show last 2 IDs in compact format
- "See All" → navigates to full Identified view
- Compact cards: 48px art, single-line title + time, method + venue, action badge

---

## ANIMATIONS

### Card Entrance (on page load)
```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 25 }
  }
}
// Stagger: 0.06s per card
```

### New ID Notification
When a new track is identified and the user is on this page:
```
0ms   — Card slides in from top (y: -60→0, spring)
100ms — Green "NEW" badge pulses
200ms — Other cards shift down (layout animation)
```

### Save Action
- Heart bounces (same particle burst as track cards)
- "Save" text crossfades to "✓ Saved"
- Row color shifts slightly green

### Delete (swipe left)
- Card slides left, red "Remove" revealed underneath
- Confirm → card collapses (height → 0, 200ms)

---

## EMPTY STATE

When no tracks have been identified yet:
- Mic icon in a subtle purple orb with outer ring
- "No tracks identified yet"
- "Tap the mic to start discovering"
- Purple CTA: "🎙 Start Listening" → navigates to Audio ID tab

---

## MOCKUP

Rendered at 390px: `identified-collection.png`
5 cards showing all variants: latest, saved, purchased, unsaved, link-identified
