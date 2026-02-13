# Traxscout PWA — Native App Feel Spec
Design: Jony | Feb 12, 2026

The goal: When a DJ opens Traxscout on iPhone, it should feel indistinguishable from a native App Store app. No "this is a website" vibes. Ever.

---

## 1. Add to Home Screen Experience

### Manifest Requirements (verify with Duda)
```json
{
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0A0A0A",
  "background_color": "#0A0A0A",
  "start_url": "/dashboard",
  "scope": "/"
}
```
- `standalone` removes Safari chrome (no URL bar, no tabs)
- `theme_color` matches our OLED black — status bar blends seamlessly
- `start_url` goes straight to dashboard, not landing page

### Splash Screen
- Background: #0A0A0A
- Center: Traxscout logomark (waveform + magnifying glass) at 120px
- Below: "TRAXSCOUT" wordmark, Inter 700, 16px, #8A8A8A
- Apple requires `apple-touch-startup-image` meta tags for proper splash on iOS
- Need splash images for all iPhone sizes (1170×2532, 1284×2778, 1290×2796, etc.)

### App Icon
- Already delivered: icon-512.png, icon-192.png, icon-72.png
- Add `apple-touch-icon` meta tag pointing to 180×180 version (need to render this)
- Icon should NOT have rounded corners baked in — iOS adds them automatically

---

## 2. Navigation — No Browser Patterns

### Bottom Tab Bar (native iOS pattern)
```
┌──────────────────────────────────────┐
│                                      │
│         [Page Content]               │
│                                      │
├──────────────────────────────────────┤
│  🏠       🔍       🎙️      📦     ⚙️  │
│ Home   Discover  Audio ID  Crate  Settings│
└──────────────────────────────────────┘
```
- Position: fixed bottom, 56px height + safe area inset
- Background: #141414 with top border #1A1A1A (subtle, not heavy)
- Active tab: #7C3AED icon + label
- Inactive: #555 icon + label
- Labels: 10px, Inter 500
- Icons: 24px
- **CRITICAL:** Use `env(safe-area-inset-bottom)` for iPhone notch/home indicator spacing

### No Pull-to-Refresh Bounce
```css
html, body {
  overscroll-behavior-y: none;
}
```
Implement custom pull-to-refresh with controlled animation instead of Safari's rubber-band effect.

### No Text Selection on UI Elements
```css
button, .tab-bar, .nav, .card {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

### No Tap Highlight
```css
* {
  -webkit-tap-highlight-color: transparent;
}
```

---

## 3. Transitions & Animations

### Page Transitions
- Slide left/right for navigation depth (like iOS push/pop)
- Duration: 300ms
- Easing: cubic-bezier(0.25, 0.1, 0.25, 1) — iOS default curve
- No fade-in from white. Ever. All transitions on #0A0A0A.

### Skeleton Loading
- Never show a blank white screen or spinner
- Use skeleton placeholders (animated shimmer on #141414 surfaces)
- Track cards: gray rectangles pulsing where content will appear
```css
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #141414 25%, #1A1A1A 50%, #141414 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite;
}
```

### Micro-Interactions
- Button press: scale(0.97) on touchstart, scale(1) on touchend — 100ms
- Save action: brief checkmark animation (Lottie or CSS)
- Tab switch: crossfade content, 200ms
- Swipe card: physics-based spring animation for snap-back or dismiss

---

## 4. Touch & Gesture

### Swipe Gestures
- Swipe right on track card = save to crate
- Swipe left = skip
- Swipe right from left edge = back (iOS convention)
- All gestures need velocity tracking for natural feel

### Touch Targets
- Minimum 44×44px for all interactive elements (Apple HIG)
- Mic button: 64px — thumb-friendly, center-bottom placement
- Bottom tab bar icons: 48px tap zones with 44px minimum

### Haptic Feedback (if available)
```javascript
if ('vibrate' in navigator) {
  navigator.vibrate(10); // light tap on save
}
```
Note: iOS Safari doesn't support vibrate API, but Taptic Engine works via CSS:
```css
.save-btn:active {
  -webkit-tap-highlight-color: transparent;
}
```
For true haptics on iOS PWA, we'd need a workaround. Mark as nice-to-have.

---

## 5. Audio Player — The Critical Piece

### Fixed Bottom Player (above tab bar)
```
┌──────────────────────────────────────┐
│  ▶  Title — Artist   ═══●═══  1:23  │
├──────────────────────────────────────┤
│  🏠    🔍    🎙️    📦    ⚙️          │
└──────────────────────────────────────┘
```
- Mini player: 48px height, sits above tab bar
- Tap to expand to full-screen player view
- Waveform scrubbing with touch (not just tap-to-seek)
- Audio must continue playing during navigation (no reload/restart)
- Background audio when phone is locked (requires audio element, not Web Audio API)

### Full Screen Player (expanded)
```
┌──────────────────────────────────────┐
│  ∨ (collapse)           ⋮ (options) │
│                                      │
│         [Album Artwork]              │
│          400×400px                   │
│                                      │
│      Track Title                     │
│      Artist — Label                  │
│                                      │
│  [126 BPM]  [6A]  [Tech House]      │
│                                      │
│  ═══════════════●══════════  2:15    │
│  [Waveform with scrub]              │
│                                      │
│    [⏮]    [▶/⏸]    [⏭]            │
│                                      │
│  [♥ Save]  [🛒 Buy]  [≈ Similar]   │
│                                      │
│  Also played by: Marco Carola, +2   │
│  Why: "Matched your BPM + genre"    │
│                                      │
└──────────────────────────────────────┘
```

---

## 6. Offline & Performance

### Service Worker Caching
- Cache all static assets (CSS, JS, fonts, icons)
- Cache last 50 viewed track cards (metadata only)
- Cache saved crate data for offline access
- Offline fallback page with Traxscout branding (not Chrome dinosaur)

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse PWA score: 100
- No layout shift (CLS < 0.1)

### Font Loading
```css
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Never block rendering for fonts */
  src: url('/fonts/inter-var.woff2') format('woff2');
}
```
Bundle Inter as a variable font file — don't load from Google Fonts (adds DNS lookup + render blocking).

---

## 7. iOS-Specific Polish

### Status Bar
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```
`black-translucent` makes the status bar overlay the content with a transparent background — content goes edge-to-edge like native apps.

### Safe Areas
```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Prevent Zoom on Input Focus
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### No Bounce on Scroll Boundaries
```css
body {
  position: fixed;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}
```
Use a scroll container pattern — prevents the whole page from bouncing but keeps smooth scroll within content areas.

---

## 8. "Install App" Prompt

### Custom Install Banner (not browser default)
After 2nd visit, show a subtle banner:
```
┌──────────────────────────────────────┐
│ 📱 Add Traxscout to your home screen │
│     for the full app experience.     │
│                          [Install]   │
└──────────────────────────────────────┘
```
- Background: #141414, border-top #7C3AED
- Dismissible (don't show again for 7 days)
- On iOS: Show instructions ("Tap Share → Add to Home Screen") since iOS doesn't support beforeinstallprompt

---

## Summary: Native vs Web Tells to Eliminate

| "This is a website" Tell | Fix |
|--------------------------|-----|
| URL bar visible | `display: standalone` in manifest |
| White flash on load | Splash screen + #0A0A0A everywhere |
| Rubber band overscroll | `overscroll-behavior: none` + custom pull-to-refresh |
| Text selection on buttons | `-webkit-user-select: none` |
| Blue tap highlights | `-webkit-tap-highlight-color: transparent` |
| Page reload on navigate | SPA with client-side routing (Next.js already does this) |
| Slow transitions | 300ms iOS curves, skeleton loaders |
| No bottom nav | Fixed tab bar with safe-area padding |
| Audio stops on navigate | Persistent audio element, never unmount |
| Spinner loading states | Shimmer skeletons |
| Zoom on input focus | `maximum-scale=1` viewport meta |
| Bouncy scroll everywhere | Fixed body + scroll container pattern |
