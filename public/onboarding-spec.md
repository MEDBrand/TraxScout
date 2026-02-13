# Traxscout Onboarding Wizard — Full Spec
Design: Jony | Feb 12, 2026
Mockup: /public/onboarding-flow.png (1200×2400, all 4 steps)

---

## When It Triggers
- First login after signup (any tier)
- Route: `/onboarding` — redirect here after first auth
- Can be skipped entirely (defaults applied)
- Can be revisited from Settings > Preferences

## Defaults (if skipped)
- DJ Type: Resident
- Genres: Tech House, Deep House, House
- BPM: 120–130
- Sources: none connected (prompt on dashboard instead)

---

## Step 1: DJ Type
**Route:** `/onboarding/step-1`
**Progress:** 25%

**Heading:** What kind of DJ are you?
**Subtitle:** This helps us tailor your discovery feed.

### Cards (select one)

| Card | Icon | Title | Description | Effect on Dashboard |
|------|------|-------|-------------|-------------------|
| 1 | 🎛️ | Resident | Weekly gigs at a venue. Need fresh tracks constantly without repeats. | Default: "New This Week" feed, 20-track daily cap, dedup against last 30 days |
| 2 | ✈️ | Touring | On the road. Need quick, trusted curation between flights. | Default: "Top Picks" compact view, mobile-optimized, save-for-later queue |
| 3 | 🎧 | Building | Growing your library. Want to discover your sound and learn. | Default: "Explore" browse view, genre deep-dives, "Similar to" recommendations |

### Interaction
- Tap to select (purple border + glow + subtle background tint)
- Only one selectable
- Default: none selected (must pick or skip)
- "Continue →" button (right-aligned, purple #7C3AED)
- "Skip for now" link (left-aligned, muted, underlined)

### Design Tokens
- Cards: bg #141414, border #2A2A2A, radius 12px, padding 28px 24px
- Selected: border #7C3AED, bg rgba(124,58,237,0.08), shadow 0 0 24px rgba(124,58,237,0.15)
- Icon: 36px, centered above title
- Title: Inter 600, 18px, #F5F5F5
- Description: Inter 400, 13px, #A3A3A3, line-height 1.5

---

## Step 2: Genres
**Route:** `/onboarding/step-2`
**Progress:** 50%

**Heading:** Pick your genres.
**Subtitle:** Select all that fit your sound. You can always change these later.

### Genre Pills (multi-select)

Row 1: Tech House | Deep House | Minimal / Deep Tech | Afro House
Row 2: House | Melodic House | Progressive House | Disco / Nu-Disco
Row 3: Techno | Melodic Techno | Indie Dance | Jackin House
Row 4: Funky House | Organic House | Electro | Breaks
Row 5: UKG / Speed Garage | Bass House

### Interaction
- Tap to toggle (multi-select)
- Selected: border #7C3AED, bg rgba(124,58,237,0.15), text #C4B5FD
- Unselected: border #2A2A2A, bg #141414, text #F5F5F5
- Minimum 1 genre to continue (or skip)

### Design Tokens
- Pills: padding 10px 20px, radius 9999px (full round), font Inter 500 14px
- Grid: flex-wrap, gap 10px, centered, max-width 700px

---

## Step 3: BPM Range
**Route:** `/onboarding/step-3`
**Progress:** 75%

**Heading:** Set your BPM range.
**Subtitle:** We'll prioritize tracks in this range. You'll still see tracks outside it.

### BPM Display
- Large number: "122 — 128" (JetBrains Mono 700, 72px, #F5F5F5)
- Label below: "BEATS PER MINUTE" (15px, #6B6B6B, uppercase, letter-spacing 1px)

### Dual-Thumb Slider
- Track: full width, 6px height, #1A1A1A, radius 3px
- Fill (between thumbs): #7C3AED
- Thumbs: 20px circles, #F5F5F5, shadow 0 2px 8px rgba(0,0,0,0.5)
- Range: 100–150 BPM
- Step: 1 BPM
- Default: 122–128

### Quick Presets (below slider)
| Preset | Range | 
|--------|-------|
| Deep House | 118–122 |
| Tech House | 122–128 (default selected) |
| Techno | 128–135 |
| Afro House | 118–125 |

- Preset pills: padding 8px 16px, radius 8px, border #2A2A2A, bg #141414
- Selected: border #7C3AED, text #C4B5FD, bg rgba(124,58,237,0.1)
- Tapping a preset sets the slider to that range

---

## Step 4: Connect Sources
**Route:** `/onboarding/step-4`
**Progress:** 100%

**Heading:** Connect your sources.
**Subtitle:** Link your accounts to start discovering. AES-256 encrypted. Disconnect anytime.

### Source Rows

| Platform | Icon Color | Badge | Description | Auth Type |
|----------|-----------|-------|-------------|-----------|
| Beatport | #00D4AA (teal) | B | Charts, new releases, purchase history | OAuth 1.0a redirect |
| Traxsource | #3B82F6 (blue) | T | Underground house, exclusive tracks | Credential (email/password inline form) |
| Inflyte | #7C3AED (purple) | I | Label promos and pre-releases | Credential (email/password inline form) |
| Trackstack | #22C55E (green) | TS | Producer demos and direct promos | Credential (email/password inline form) |
| Promo Box | #E11D48 (rose) | PB | DJ promo pool, pre-release tracks | Credential (email/password inline form) |
| Label Worx | #F97316 (orange) | LW | Label distribution promos, white labels | Credential (email/password inline form) |

### Interaction
- "Connect" button → opens inline credential form (Traxsource/Inflyte/Trackstack/Promo Box/Label Worx) or redirects to OAuth (Beatport)
- On successful connect: row gets green border, button changes to "✓ Connected" (green), description updates with count: "Found 47 new tracks"
- Minimum 0 sources required (can skip entirely)
- "I'll do this later" skip link

### Connected State
- Row: border #22C55E, bg rgba(34,197,94,0.05)
- Button: border #22C55E, text #22C55E, bg rgba(34,197,94,0.1)

### Credential Form (inline expand)
```
┌─────────────────────────────────────────────┐
│ [Icon] Traxsource                           │
│                                             │
│  Email    [________________________]        │
│  Password [________________________]        │
│                                             │
│  🔒 Encrypted with AES-256. Never stored    │
│     in plaintext. Disconnect anytime.       │
│                                             │
│           [Cancel]  [Connect]               │
└─────────────────────────────────────────────┘
```

### Final CTA
- "Start Discovering 🔥" button (gold #F59E0B, text #000000, bold)
- This replaces the standard purple "Continue →"
- Routes to `/dashboard`

---

## Global Elements (all steps)

### Progress Bar
- Position: top of viewport, full width, 3px height
- Track: #1A1A1A
- Fill: #7C3AED
- Animates on step transition

### Logo
- "TRAXSCOUT" — Inter 700, 14px, #8A8A8A, letter-spacing 3px
- Position: top-left, 24px from top, 48px from left

### Step Label
- "STEP X OF 4" — 12px, #555, uppercase, letter-spacing 2px
- Centered above heading

### CTA Button
- Position: bottom-right
- Padding: 14px 32px, radius 10px
- Background: #7C3AED (steps 1-3), #F59E0B (step 4)
- Text: #fff (steps 1-3), #000 (step 4)
- Font: Inter 600, 15px

### Skip Link
- Position: bottom-left
- Font: 13px, #6B6B6B, underlined, underline-offset 3px

### Page Background
- #0A0A0A throughout

### Transitions
- Step transitions: 300ms ease, slide left
- Selection states: 200ms ease
- Progress bar: 300ms ease

---

## Mobile Adaptation (< 768px)
- Cards stack vertically (1 column)
- Genre pills: 3 per row max
- BPM display: 48px instead of 72px
- Source rows: full width, no horizontal padding change
- CTA and skip: full width, stacked at bottom
- Step content: padding 24px 20px
