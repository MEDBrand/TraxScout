# Traxscout Animation System — 2026 Premium
Design: Jony | Feb 13, 2026
Implementation: Framer Motion (React) + CSS

The rule: every animation has a PURPOSE. It either guides attention, provides feedback, or creates delight. No animation for animation's sake.

---

## 1. PAGE TRANSITIONS

### Push/Pop Navigation (iOS style)
```jsx
// Framer Motion page variants
const pageVariants = {
  enter: { x: '100%', opacity: 0.8 },
  center: { x: 0, opacity: 1 },
  exit: { x: '-30%', opacity: 0.6 }
}
const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8
}
```
Spring physics, not linear easing. The page has weight — it decelerates naturally like a real object.

### Tab Switching
```jsx
// Crossfade with subtle scale
const tabVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
  }
}
```

---

## 2. THE DAILY DROP — HERO ANIMATION

When the user opens the app for the first time that day:

### Entrance Sequence (staggered, 800ms total)
```
0ms    — Background gradient fades in (opacity 0→1, 400ms)
100ms  — "☀ Today's Drop" label slides up + fades in
200ms  — "20 fresh tracks" title slides up, slightly larger scale→1
300ms  — Subtitle fades in
400ms  — CTA button scales from 0.9→1 with spring bounce
500ms  — Subtle pulse glow on purple gradient (looping, 3s cycle)
```

```jsx
const heroStagger = {
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}
const heroChild = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
}
```

### Ambient Glow (continuous)
```css
@keyframes ambientPulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.05); }
}
.hero-card::before {
  animation: ambientPulse 4s ease-in-out infinite;
}
```
Subtle breathing effect on the purple glow. Alive, not static.

---

## 3. TRACK CARDS

### List Entrance (staggered cascade)
```jsx
const listStagger = {
  visible: { transition: { staggerChildren: 0.06 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 25 }
  }
}
```
Cards cascade in from bottom, each 60ms apart. Fast enough to feel instant, slow enough to feel intentional.

### Save Heart Animation
```jsx
const heartVariants = {
  idle: { scale: 1 },
  saving: { 
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }
  }
}
```
Heart bounces with overshoot on save. Simultaneously:
- Color transitions from gray to purple (200ms)
- Small particle burst (3-5 tiny purple dots radiate outward and fade)
- Haptic tap (if available)

### Particle Burst on Save
```jsx
// Spawn 5 particles on save
const particles = Array.from({ length: 5 }, (_, i) => ({
  angle: (i * 72) * (Math.PI / 180),
  distance: 20 + Math.random() * 10,
}))

// Each particle: fly outward + fade + shrink over 400ms
const particleVariants = {
  hidden: { opacity: 1, scale: 1, x: 0, y: 0 },
  visible: (p) => ({
    opacity: 0,
    scale: 0,
    x: Math.cos(p.angle) * p.distance,
    y: Math.sin(p.angle) * p.distance,
    transition: { duration: 0.4, ease: 'easeOut' }
  })
}
```

### Track Card Press State
```jsx
whileTap={{ scale: 0.97, backgroundColor: 'rgba(255,255,255,0.06)' }}
transition={{ duration: 0.1 }}
```
Subtle press-down like iOS. Immediate feedback.

---

## 4. SWIPE INTERFACE (Discover Page)

### Card Stack
```jsx
// Cards stacked with perspective
const stackVariants = {
  top: { scale: 1, y: 0, opacity: 1, zIndex: 3 },
  middle: { scale: 0.95, y: -12, opacity: 0.7, zIndex: 2 },
  back: { scale: 0.9, y: -24, opacity: 0.4, zIndex: 1 }
}
```

### Swipe Gesture
```jsx
const swipeVariants = {
  swipeRight: {
    x: 400, rotate: 15, opacity: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
  swipeLeft: {
    x: -400, rotate: -15, opacity: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
}
```

### Swipe Feedback Overlay
```
Dragging right → Green glow appears on card + "♥ SAVE" text fades in
Dragging left  → Red glow appears on card + "✕ SKIP" text fades in
Release past threshold (100px) → card flies off + next card springs up
Release before threshold → card snaps back with spring
```

```jsx
// Dynamic glow based on drag position
const glowOpacity = useTransform(x, [-200, 0, 200], [0.3, 0, 0.3])
const glowColor = useTransform(x, [-200, 0, 200], 
  ['rgba(239,68,68,0.2)', 'transparent', 'rgba(124,58,237,0.2)']
)
```

### Card Exit + Entry
When card exits:
- Next card springs from scale 0.95→1, y -12→0 (spring, 300ms)
- Counter updates: "14 of 20" → "15 of 20" (number slides up)

---

## 5. AUDIO ID — MIC BUTTON

### Idle State
```css
@keyframes micPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
}
.mic-btn { animation: micPulse 2.5s ease-in-out infinite; }
```
Gentle pulse ring radiating outward. Invites touch.

### Listening State
```css
@keyframes listeningRing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}
/* Three rings, staggered */
.ring-1 { animation: listeningRing 1.5s ease-out infinite; }
.ring-2 { animation: listeningRing 1.5s ease-out infinite 0.5s; }
.ring-3 { animation: listeningRing 1.5s ease-out infinite 1s; }
```
Three concentric rings expanding outward like sonar/radar. Purple rings on black. This is the "Shazam moment."

### Waveform Visualizer (while listening)
```jsx
// Real-time audio amplitude bars
const bars = 24
// Each bar height driven by audio analyser frequency data
const barVariants = {
  listening: (i) => ({
    height: [4, 20 + Math.random() * 20, 4],
    transition: {
      repeat: Infinity,
      duration: 0.3 + Math.random() * 0.3,
      ease: 'easeInOut'
    }
  })
}
```
24 thin bars in a circular or linear arrangement, heights driven by actual microphone input amplitude. Purple gradient on bars.

### Match Found
```
0ms    — Rings collapse inward (scale 2.5→0, 200ms)
100ms  — Button morphs from circle to rounded rectangle (300ms spring)
200ms  — Checkmark draws itself inside the shape (SVG stroke animation, 400ms)
300ms  — Track info slides up from below (staggered: title, artist, tags)
400ms  — "Buy" and "Save" buttons fade + scale in
500ms  — Confetti burst (optional, subtle — 8-10 small purple + gold particles)
```

### No Match
```
0ms    — Rings slow down and fade
200ms  — Button shakes horizontally (x: [-4, 4, -3, 3, 0], 300ms)
300ms  — "Try again" text fades in below
```

---

## 6. SKELETON LOADING

### Shimmer Effect
```css
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(
    90deg, 
    rgba(255,255,255,0.03) 25%, 
    rgba(255,255,255,0.06) 50%, 
    rgba(255,255,255,0.03) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 8px;
}
```
Subtle light wave moving across placeholder elements. Not aggressive — barely noticeable, but the screen feels alive.

### Content Replace
```jsx
// Skeleton → real content
const contentVariants = {
  skeleton: { opacity: 0.5 },
  loaded: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}
```

---

## 7. PULL TO REFRESH

### Custom Pull Animation
```
Pull 0-60px   → Arrow rotates 0°→180°, opacity increases
Pull 60px+    → Arrow becomes spinner, purple color
Release       → Spinner rotates, content reloads
Complete      → Spinner morphs into checkmark, slides up and away
```

```jsx
const pullProgress = useTransform(pullDistance, [0, 60], [0, 1])
const rotation = useTransform(pullProgress, [0, 1], [0, 180])
```
No Safari rubber band. Custom controlled animation.

---

## 8. TRENDING CARDS SCROLL

### Horizontal Momentum Scroll
```jsx
<motion.div 
  drag="x" 
  dragConstraints={{ right: 0, left: -scrollWidth }}
  dragElastic={0.1}
  dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
>
```
Physics-based scroll with momentum and edge bounce. Cards slightly scale down as they approach the edge (parallax depth).

### Card Hover/Touch
```jsx
whileHover={{ y: -4, transition: { duration: 0.2 } }}
whileTap={{ scale: 0.97 }}
```

---

## 9. NOTIFICATION TOASTS

### Track Saved Toast
```
Slides up from bottom → holds 2s → slides down
Background: rgba(124,58,237,0.9) + blur
Content: "♥ Saved to Crate" + track title
```

```jsx
const toastVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 28 }
  },
  exit: { y: 100, opacity: 0, transition: { duration: 0.2 } }
}
```

---

## 10. STATS COUNTER ANIMATION

### Number Roll on Load
```jsx
// Count up from 0 to target
const count = useMotionValue(0)
const rounded = useTransform(count, Math.round)

useEffect(() => {
  const controls = animate(count, targetValue, {
    duration: 1.2,
    ease: [0.25, 0.1, 0.25, 1]
  })
  return controls.stop
}, [])
```
Stats numbers roll up from 0 on page load. 142 Discovered, 4 Sources, 38 In Crate — each counting up with a slight stagger.

---

## PERFORMANCE RULES

1. **Use `transform` and `opacity` ONLY** — never animate layout properties (width, height, padding, margin)
2. **`will-change: transform`** on elements that animate frequently
3. **60fps minimum** — test on iPhone 12 (lowest target device)
4. **Reduce motion** — respect `prefers-reduced-motion: reduce` media query. Disable all animations except essential feedback.
5. **No animation on first paint** — skeleton loads first, then content animates in
6. **GPU compositing** — use `translateZ(0)` or `translate3d` for hardware acceleration
7. **Framer Motion `layout` prop** — for smooth layout shifts when content loads

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## MOTION LANGUAGE SUMMARY

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Slide + spring | 300ms | spring(300, 30) |
| Card entrance | Fade up + scale | 250ms | spring(350, 25) |
| Save heart | Bounce + particles | 500ms | custom keyframes |
| Swipe card | Physics drag | gesture-driven | spring(200, 20) |
| Mic pulse | Ring expansion | 2.5s loop | ease-in-out |
| Listening rings | Sonar waves | 1.5s loop staggered | ease-out |
| Skeleton shimmer | Light sweep | 1.8s loop | ease-in-out |
| Toast notification | Slide up + spring | 300ms | spring(400, 28) |
| Number counter | Roll up | 1.2s | cubic-bezier |
| Tab switch | Crossfade + scale | 250ms | cubic-bezier |

The motion personality: **quick, confident, physical.** Things have weight. They spring, not slide. They bounce, not ease. Like flipping through vinyl — tactile and satisfying.
