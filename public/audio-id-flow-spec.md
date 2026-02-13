# Audio ID Flow — Complete Specification
**Design: Jony | Feb 13, 2026**
**Core Insight: Same device. No second phone.**

---

## THE FLOW (v2 — Mic Primary)

```
┌─────────────┐
│  Audio ID   │  ← User taps Audio ID tab
│    Home     │
└──────┬──────┘
       │
       ├──→ TAP BIG BUTTON (primary, one tap, Shazam-style)
       │    │
       │    ├─ Mic activates instantly
       │    ├─ Sonar rings + waveform visualizer + 15s timer ring
       │    └─ → MATCH FOUND or NO MATCH
       │
       ├──→ PASTE LINK (secondary, below fold)
       │    │
       │    ├─ SoundCloud, YouTube, Spotify, Instagram, TikTok, Beatport
       │    ├─ Preview card → Identify
       │    └─ → MATCH FOUND or NO MATCH
       │
       └──→ SHARE TAB AUDIO (desktop only, secondary)
            │
            ├─ Browser tab picker via getDisplayMedia()
            └─ → MATCH FOUND or NO MATCH
```

**Mobile: mic is primary. One tap. No menus, no choices. Tap → listen → match.**
**Paste link + tab audio are below the fold as secondary options.**

---

## SCREEN 1: AUDIO ID HOME — TAP TO LISTEN

### Layout (top to bottom)
- Eyebrow: "AUDIO ID" (13px, 600, #48484A, uppercase, 2px tracking)
- Tagline: "Hear it. **Know it.** Own it." (24px, 800 weight, "Know it" gradient purple)
- **THE BIG MIC BUTTON** — 160px diameter, center of screen
- "Tap to listen" label below (15px, 600, rgba white 0.7)
- "or" divider
- Secondary cards: "Paste a link" + "Share tab audio" (desktop)
- Recent identifications list

### The Big Button — Spec
```
Size: 160×160px, border-radius: 50%
Background: linear-gradient(145deg, #8B5CF6, #6D28D9, #5B21B6)
Box-shadow:
  0 4px 8px rgba(0,0,0,0.4)        — depth
  0 12px 40px rgba(124,58,237,0.3)  — purple glow
  inset 0 2px 0 rgba(255,255,255,0.12) — top highlight
  inset 0 -2px 0 rgba(0,0,0,0.15)     — bottom shadow

Inner ring: 6px inset, 0.5px rgba(255,255,255,0.08) border
Highlight arc: 50×24px blur(8px) rgba(255,255,255,0.06) top-left

Ambient rings (static, behind button):
  r1: inset -24px, rgba(124,58,237,0.04)
  r2: inset -52px, rgba(124,58,237,0.04)
  r3: inset -84px, rgba(124,58,237,0.04)
  r4: inset -120px, rgba(124,58,237,0.04)

Background glow: 300×300px radial gradient rgba(124,58,237,0.12), blur(40px)
```

### Idle Pulse Animation (Framer Motion)
```tsx
// Gentle pulse on the glow — invites the tap
const glowVariants = {
  pulse: {
    scale: [1, 1.08, 1],
    opacity: [0.12, 0.18, 0.12],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
}

// Outer rings breathe slightly
const ringVariants = (i: number) => ({
  pulse: {
    scale: [1, 1.02, 1],
    opacity: [0.04, 0.06, 0.04],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }
  }
})
```

### Tap Behavior
- One tap → instant mic activation
- No confirmation, no menu, no choices
- Button scales down (0.95) on press, haptic light
- Transition to Screen 2 (Listening)

### Secondary Methods (below fold)
```
┌─────────────────────────────────────┐
│ 🔗  Paste a link                   › │
│     SoundCloud, YouTube, Spotify...  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🔊  Share tab audio     [Desktop]  › │
│     Capture from another tab         │
└─────────────────────────────────────┘
```
- 40px icon square (10px radius, tinted bg)
- Link icon: gold tint, Tab icon: blue tint
- Cards: rgba(255,255,255,0.02) bg, 0.5px border, 14px radius

### Recent Identifications
- Shows last 2-3 identified tracks below secondary options
- 40px album art + title + artist + time ago
- Tapping opens match result

### Deep Link Support
- `traxscout://audio-id` → opens this screen
- `traxscout://audio-id?url=...` → opens paste flow with URL pre-filled
- `traxscout://audio-id?listen=true` → auto-starts mic

---

## SCREEN 2: LINK PASTED — PREVIEW

### Trigger
URL detected in input (regex match or paste event)

### Preview Card
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │     [Album Art BG]       │ │
│ │  SoundCloud              │ │  ← source badge, top-left
│ │                          │ │
│ │  Out of My Mind          │ │  ← title, bottom overlay
│ │  Joshwa · 3:42           │ │
│ └─────────────────────────┘ │
│                             │
│ [Identify This Track] [Clear]│
└─────────────────────────────┘
```
- Card slides up with spring animation (stiffness 300, damping 25)
- Art area: 200px height, gradient bg as placeholder until metadata loads
- Bottom gradient overlay for text readability
- Source badge: top-left, pill with backdrop blur, source brand color
- "Identify This Track" — full purple CTA
- "Clear" — secondary ghost button

### URL Detection & Metadata Fetch

```typescript
// Supported URL patterns
const PATTERNS = {
  soundcloud: /soundcloud\.com\/[\w-]+\/[\w-]+/,
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
  spotify: /open\.spotify\.com\/track\/[\w]+/,
  instagram: /instagram\.com\/(?:p|reel)\/[\w-]+/,
  tiktok: /tiktok\.com\/@[\w.]+\/video\/\d+/,
  beatport: /beatport\.com\/track\/[\w-]+\/\d+/,
}

// On URL match → fetch oEmbed/metadata
async function fetchTrackMeta(url: string): Promise<TrackMeta> {
  const platform = detectPlatform(url)
  // Server-side: call oEmbed endpoint or scrape Open Graph
  const res = await fetch(`/api/audio-id/meta?url=${encodeURIComponent(url)}`)
  return res.json()
  // Returns: { title, artist, duration, artworkUrl, platform }
}
```

### Animation
```
0ms   — URL pasted, input border glows purple
100ms — Preview card slides up (y: 40→0, opacity: 0→1, spring)
200ms — Source badge fades in
300ms — Title/artist text fades in
400ms — Action buttons scale in (0.95→1)
```

---

## SCREEN 3: ANALYZING

### Trigger
User taps "Identify This Track" (paste) or listening window starts (mic)

### Visual
- Pulsing concentric rings (4 rings, decreasing opacity outward)
- Center orb with waveform visualization bars (11 bars, gradient purple)
- "Identifying..." text + "Matching audio fingerprint" subtitle
- Source context card below: small art + title + URL
- Progress bar: thin (3px), gradient purple fill, animated

### Ring Animation
```tsx
// 4 concentric rings pulsing outward
const ringVariants = {
  pulse: {
    scale: [1, 1.15, 1],
    opacity: [0.15, 0.08, 0.15],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}
// Stagger: each ring 0.3s delay
```

### Waveform Bars (inside orb)
```tsx
// 11 bars, heights driven by audio analysis or randomized
const barVariants = (i: number) => ({
  animate: {
    height: [12, 20 + Math.random() * 24, 12],
    transition: {
      duration: 0.3 + Math.random() * 0.4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
})
```

### Progress States
```
0-20%  — "Fetching audio..."
20-60% — "Analyzing fingerprint..."
60-90% — "Searching database..."
90-100% — "Almost there..."
```

### Technical Flow (Paste Link)
```typescript
async function identifyFromUrl(url: string) {
  // 1. Send URL to server
  const { jobId } = await fetch('/api/audio-id/identify', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }).then(r => r.json())

  // 2. Server-side: extract audio → fingerprint → match
  //    - YouTube/SoundCloud: yt-dlp audio extraction
  //    - Spotify: 30s preview URL
  //    - Instagram/TikTok: video audio extraction
  //    - Beatport: preview clip extraction
  //    → AcoustID / Chromaprint fingerprinting
  //    → Match against: Beatport, Traxsource, Promo Box, Label Worx, Discogs

  // 3. Poll for result
  const result = await pollResult(jobId) // SSE or polling
  return result // { matched: true, track: {...} } or { matched: false }
}
```

---

## SCREEN 4: MATCH FOUND

### Transition from Analyzing
```
0ms   — Rings collapse inward (scale→0, 200ms)
100ms — Orb morphs into album art (border-radius: 50%→24px, scale up)
200ms — "Match Found" badge fades in with green glow
300ms — Track title slides up
400ms — Artist + label fade in
500ms — Metadata chips cascade in (BPM, key, genre) 
600ms — Waveform draws left to right (stroke animation feel)
700ms — "Also played by" section slides up
800ms — Action buttons scale in
```
Haptic: success pattern `[10, 50, 10]`

### Layout
- "Match Found" badge: green dot + text, green-tinted pill
- Album art: 280×280px, 24px radius, box-shadow, color bleed glow behind
- Track title: 24px, 800 weight
- Artist: 16px, #8E8E93
- Label + release date: 13px, #48484A
- Metadata chips: BPM (purple), Key (gold), Genre (gray) — each in 12px radius card
- Waveform: 48px height, purple for played portion, gray for unplayed — scrubbable
- "Also played by": DJs who've played this track (from 1001Tracklists data, Phase 2)
- Action row: "Save to Crate" (purple CTA) + "Buy $1.49" (secondary)
- Source availability: "Available on Beatport · Traxsource" links

### "Also Played By" Section
```
┌─────────────────────────────────────┐
│ ALSO PLAYED BY                       │
│                                     │
│ (FC)   (JC)   (LP)   (CS)          │
│ Fisher  James  LP G.  Claude        │
└─────────────────────────────────────┘
```
- 40px circular avatars with initials
- Name below each, 10px
- Scrollable if >4 DJs
- Data source: 1001Tracklists cache (Phase 2)
- If no data: hide section entirely

### Buy Flow
- Tap "Buy" → bottom sheet with store options (Beatport, Traxsource, Juno, Promo Box, Label Worx)
- Each store shows price
- Tap store → opens in external browser / in-app browser
- After purchase detected (Phase 3): auto-add to crate

---

## SCREEN 5: MIC LISTENING

### Trigger
User taps "Listen with mic" card

### Visual
- Large purple orb (140px) with CSS mic icon
- 3 sonar rings expanding outward (animated)
- "Listening..." text + "Hold your phone near the speaker"
- Cancel button below

### Mic Animation
```tsx
// Sonar rings expanding
const sonarVariants = {
  listening: {
    scale: [1, 2.5],
    opacity: [0.15, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
}
// 3 rings staggered: 0s, 0.5s, 1s
```

### Technical Flow (Mic)
```typescript
async function identifyFromMic() {
  // 1. Request mic permission
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  // 2. Record 15 seconds
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
  const chunks: Blob[] = []
  recorder.ondataavailable = e => chunks.push(e.data)
  recorder.start()

  // 3. After 15s, stop and send
  await new Promise(r => setTimeout(r, 15000))
  recorder.stop()
  stream.getTracks().forEach(t => t.stop())

  // 4. Send audio blob to server for fingerprinting
  const blob = new Blob(chunks, { type: 'audio/webm' })
  const formData = new FormData()
  formData.append('audio', blob)

  const result = await fetch('/api/audio-id/identify-audio', {
    method: 'POST',
    body: formData,
  }).then(r => r.json())

  return result
}
```

### States
- Permission prompt → standard browser dialog
- If denied → show message: "Microphone access is required" + settings link
- Listening → 15s countdown (circular progress on orb edge)
- Analyzing → transition to Screen 3
- Timeout → "Couldn't capture enough audio. Try moving closer."

---

## SCREEN 6: NO MATCH

### Visual
- Large "?" icon in muted circle (80px)
- "No match found" title
- Explanation: "We couldn't identify this track. It might be an unreleased edit, a mashup, or not in our database yet."
- "Try Again" (purple CTA) + "Try a Different Method" (secondary)

### Animation
```
0ms   — Analyzing orb shakes (x: [-4, 4, -3, 3, 0], 300ms)
200ms — Orb fades to "?" icon (crossfade, 300ms)
300ms — Title slides up
400ms — Description fades in
500ms — Buttons scale in
```
Haptic: error pattern `[30, 50, 30, 50, 30]`

### "Try a Different Method"
- Returns to Screen 1 with a suggestion:
  - If they used paste → suggest mic
  - If they used mic → suggest paste
  - Animated arrow pointing to the other method

---

## TAB AUDIO SHARING (Desktop Only)

### Detection
```typescript
// Only show this option on desktop
const isDesktop = !('ontouchstart' in window) && window.innerWidth > 768
```

### Flow
```typescript
async function identifyFromTab() {
  // 1. Request tab audio capture
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: false,
    audio: true,
    // @ts-ignore — Chrome-specific
    preferCurrentTab: false,
    selfBrowserSurface: 'exclude',
    systemAudio: 'include',
  })

  // 2. Record 15 seconds of tab audio
  // Same as mic flow from here
}
```

### UI
- Shows browser's native tab picker
- Once sharing: show the analyzing screen with "Capturing tab audio..." text
- After 15s: stop capture, analyze

### Limitations
- Chrome/Edge only (Firefox partial, Safari no support)
- Show browser compatibility note on hover
- If unsupported: gray out with "Chrome/Edge required" tooltip

---

## CLIPBOARD INTELLIGENCE

```typescript
// On Audio ID tab focus, check clipboard
async function checkClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    const platform = detectPlatform(text)
    if (platform) {
      // Show suggestion banner above input
      showClipboardSuggestion(text, platform)
    }
  } catch {
    // Permission denied or empty — silent fail
  }
}
```

### Clipboard Banner
```
┌─────────────────────────────────────┐
│ 📋  Paste from clipboard?          │
│     soundcloud.com/joshwa-uk/...    │
│                          [Paste]    │
└─────────────────────────────────────┘
```
- Slides down from top of input area
- Auto-dismisses after 5s if not tapped
- Tap "Paste" → auto-fills input → shows preview

---

## API ENDPOINTS

```
POST /api/audio-id/meta
  Body: { url: string }
  Returns: { title, artist, duration, artworkUrl, platform }

POST /api/audio-id/identify
  Body: { url: string }
  Returns: { jobId: string }

POST /api/audio-id/identify-audio
  Body: FormData (audio blob)
  Returns: { jobId: string }

GET /api/audio-id/status/:jobId
  Returns: { status: 'processing'|'complete'|'failed', result?: TrackMatch }

// TrackMatch
{
  matched: boolean,
  track?: {
    title: string,
    artist: string,
    label: string,
    releaseDate: string,
    bpm: number,
    key: string,
    genre: string,
    artworkUrl: string,
    waveformData: number[],
    sources: { platform: string, url: string, price: string }[],
    playedBy?: { name: string, initials: string }[],
  }
}
```

---

## IMPLEMENTATION PRIORITY

1. **Paste Link flow** (launch critical) — URL input, meta fetch, server-side fingerprinting
2. **Match Found screen** — the payoff, must be beautiful
3. **No Match screen** — graceful failure
4. **Mic Listening** (launch) — getUserMedia, 15s record, upload
5. **Clipboard detection** (nice-to-have at launch)
6. **Tab Audio** (post-launch) — Chrome-specific, lower priority
7. **"Also played by"** (Phase 2) — requires 1001Tracklists data

---

## MOCKUP

**v2 (mic-primary): 4 screens at 390px in `audio-id-v2.png`**
- Screen 1: Idle — big mic button, "Tap to listen", secondary options below
- Screen 2: Listening — sonar rings, waveform viz, timer ring, 15s countdown
- Screen 3: Match Found — album art with color bleed, metadata, waveform, also played by, save/buy
- Screen 4: No Match — X icon, explanation, "Try Again" + "Try Pasting a Link"

v1 (paste-primary, deprecated): `audio-id-flow.png`
