# Traxscout UI Overhaul — Complete Specification
**Design: Jony | Feb 13, 2026**
**Target: Spotify × Shazam — Premium, Dark, DJ-Grade**
**Implementation: Next.js + Framer Motion + Tailwind**

---

## TABLE OF CONTENTS
1. Design Tokens (updated)
2. Page Transitions
3. Micro-Interactions & Animations
4. Track Cards (complete redesign)
5. Bottom Sheets & Modals
6. Native Feel Systems
7. Typography System
8. Spacing & Layout Grid
9. Glass Morphism & Depth
10. Component Library

---

## 1. DESIGN TOKENS (MASTER)

```typescript
// tokens.ts — single source of truth
export const tokens = {
  // Colors
  color: {
    bg: '#000000',
    surface: {
      1: 'rgba(255,255,255,0.015)',  // cards, lowest elevation
      2: 'rgba(255,255,255,0.025)',  // elevated cards
      3: 'rgba(255,255,255,0.04)',   // modals, sheets
      4: 'rgba(255,255,255,0.06)',   // hover states
    },
    border: {
      subtle: 'rgba(255,255,255,0.03)',
      default: 'rgba(255,255,255,0.05)',
      strong: 'rgba(255,255,255,0.08)',
      separator: '#1C1C1E',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#8E8E93',
      tertiary: '#636366',
      quaternary: '#48484A',
      muted: '#3A3A3C',
    },
    accent: {
      purple: '#7C3AED',
      purpleLight: '#A78BFA',
      purpleMuted: '#C4B5FD',
      purpleDim: 'rgba(124,58,237,0.12)',
      gold: '#F59E0B',
      goldLight: '#FBBF24',
      goldDim: 'rgba(245,158,11,0.1)',
      green: '#22C55E',
      greenLight: '#4ADE80',
      greenDim: 'rgba(34,197,94,0.1)',
      red: '#EF4444',
      redDim: 'rgba(239,68,68,0.1)',
    },
    // Source platform brand colors
    source: {
      beatport: '#00D4AA',    // teal
      traxsource: '#3B82F6',  // blue
      inflyte: '#7C3AED',     // purple
      trackstack: '#22C55E',  // green
      promoBox: '#E11D48',    // rose
      labelWorx: '#F97316',   // orange
    },
    glass: {
      bg: 'rgba(28,28,30,0.88)',
      bgHeavy: 'rgba(28,28,30,0.95)',
      blur: '30px',
      blurHeavy: '40px',
    },
  },

  // Typography
  type: {
    family: {
      sans: "'Inter', -apple-system, 'SF Pro Display', sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', monospace",
    },
    size: {
      hero: '72px',     // big numbers (daily drop "20")
      display: '34px',  // page titles
      h1: '28px',       // section hero
      h2: '22px',       // section titles
      h3: '20px',       // subsection titles
      body: '16px',     // primary text
      bodySmall: '15px',// track titles
      caption: '13px',  // secondary text, artists
      micro: '11px',    // labels, badges
      nano: '10px',     // tags (BPM, key)
      tiny: '9px',      // source badges
    },
    weight: {
      black: 900,
      bold: 700,
      semibold: 600,
      medium: 500,
      regular: 400,
      light: 300,
    },
    tracking: {
      tighter: '-1px',    // hero numbers
      tight: '-0.5px',    // display headings
      normal: '-0.2px',   // body text
      wide: '0.5px',      // small caps
      wider: '1px',       // micro labels
      widest: '2px',      // eyebrow text
    },
  },

  // Spacing (4px base grid)
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
    page: '16px',       // horizontal page padding
    pageWide: '24px',   // header padding
    cardGap: '4px',     // between track cards
    sectionGap: '32px', // between sections
  },

  // Radius
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '20px',
    '4xl': '24px',
    hero: '28px',
    full: '9999px',
  },

  // Shadows (dark mode — mostly glow-based)
  shadow: {
    card: '0 2px 8px rgba(0,0,0,0.4)',
    elevated: '0 4px 20px rgba(0,0,0,0.5)',
    glow: {
      purple: '0 4px 16px rgba(124,58,237,0.25)',
      purpleStrong: '0 8px 32px rgba(124,58,237,0.3)',
      gold: '0 4px 16px rgba(245,158,11,0.2)',
      green: '0 4px 16px rgba(34,197,94,0.2)',
    },
    button: `0 2px 4px rgba(0,0,0,0.3),
             0 8px 24px rgba(124,58,237,0.25),
             inset 0 1px 0 rgba(255,255,255,0.15),
             inset 0 -1px 0 rgba(0,0,0,0.1)`,
  },

  // Motion
  motion: {
    spring: {
      snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
      default: { type: 'spring', stiffness: 300, damping: 25 },
      gentle: { type: 'spring', stiffness: 200, damping: 20 },
      bouncy: { type: 'spring', stiffness: 500, damping: 25, mass: 0.5 },
    },
    ease: {
      default: [0.25, 0.1, 0.25, 1],
      out: [0, 0, 0.2, 1],
      in: [0.4, 0, 1, 1],
      inOut: [0.4, 0, 0.2, 1],
    },
    duration: {
      instant: 0.1,
      fast: 0.2,
      default: 0.3,
      slow: 0.5,
      glacial: 0.8,
    },
  },
}
```

---

## 2. PAGE TRANSITIONS

### 2A. Navigation Stack (Push/Pop)

iOS-native navigation feel. New pages slide in from right, old page scales back.

```tsx
// components/PageTransition.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/router'

const variants = {
  // Forward navigation (push)
  enter: {
    x: '100%',
    opacity: 0.8,
    scale: 1,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  // Back navigation (pop)
  exit: {
    x: '-25%',
    opacity: 0.6,
    scale: 0.95,
  },
}

// For back navigation, reverse the animation
const backVariants = {
  enter: {
    x: '-25%',
    opacity: 0.6,
    scale: 0.95,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    scale: 1,
  },
}

export function PageTransition({ children, direction = 'forward' }) {
  const router = useRouter()
  const v = direction === 'forward' ? variants : backVariants

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.pathname}
        variants={v}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 2B. Tab Switching (Crossfade)

Tabs don't push/pop — they crossfade with a subtle vertical shift.

```tsx
// components/TabTransition.tsx
const tabVariants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.99,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
}

export function TabView({ activeTab, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 2C. Slide-In Panels (Detail Views)

Track detail, source connection, filter panels slide up from bottom.

```tsx
// components/SlidePanel.tsx
const panelVariants = {
  hidden: {
    y: '100%',
    opacity: 0.5,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export function SlidePanel({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="panel-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />
          <motion.div
            className="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose()
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '92vh',
              background: tokens.color.glass.bgHeavy,
              backdropFilter: `blur(${tokens.color.glass.blurHeavy})`,
              borderRadius: '20px 20px 0 0',
              zIndex: 50,
              overflowY: 'auto',
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 36, height: 5, borderRadius: 3,
              background: 'rgba(255,255,255,0.2)',
              margin: '10px auto 0',
            }} />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

## 3. MICRO-INTERACTIONS & ANIMATIONS

### 3A. Skeleton Loaders

```tsx
// components/Skeleton.tsx
import styles from './Skeleton.module.css'

export function SkeletonTrack() {
  return (
    <div className={styles.trackSkeleton}>
      <div className={`${styles.shimmer} ${styles.art}`} />
      <div className={styles.info}>
        <div className={`${styles.shimmer} ${styles.title}`} />
        <div className={`${styles.shimmer} ${styles.subtitle}`} />
        <div className={styles.tags}>
          <div className={`${styles.shimmer} ${styles.tag}`} />
          <div className={`${styles.shimmer} ${styles.tag}`} />
        </div>
      </div>
      <div className={`${styles.shimmer} ${styles.action}`} />
    </div>
  )
}
```

```css
/* Skeleton.module.css */
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.02) 0%,
    rgba(255,255,255,0.05) 40%,
    rgba(255,255,255,0.02) 80%
  );
  background-size: 800px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 8px;
}

.trackSkeleton {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 18px;
}

.art {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title { width: 65%; height: 14px; }
.subtitle { width: 45%; height: 12px; }
.tag { width: 36px; height: 18px; border-radius: 5px; }
.tags { display: flex; gap: 5px; }
.action { width: 38px; height: 38px; border-radius: 12px; }
```

### Skeleton → Content Transition

```tsx
// When data loads, crossfade skeleton to real content
function TrackList({ tracks, isLoading }) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonTrack key={i} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, staggerChildren: 0.06 } }}
        >
          {tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3B. Button Press States

Every interactive element needs immediate physical feedback.

```tsx
// components/PressableButton.tsx
export function PressableButton({ children, variant = 'primary', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

```css
/* Button styles */
.btn {
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  letter-spacing: -0.1px;
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 15px;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.btn-primary {
  background: linear-gradient(135deg, #7C3AED, #6D28D9);
  color: #fff;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.3),
    0 8px 24px rgba(124,58,237,0.25),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.1);
}

.btn-secondary {
  background: rgba(255,255,255,0.025);
  border: 0.5px solid rgba(255,255,255,0.05);
  color: #8E8E93;
}

.btn-ghost {
  background: transparent;
  color: #7C3AED;
}

/* Ripple on tap (CSS-only fallback) */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--tap-x, 50%) var(--tap-y, 50%),
    rgba(255,255,255,0.15), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn:active::after {
  opacity: 1;
  transition: opacity 0s;
}
```

### 3C. Card Press & Hover

```tsx
// Every card gets this wrapper
export function PressableCard({ children, onClick, featured = false }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.04)' }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      style={{
        borderRadius: 18,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </motion.div>
  )
}
```

### 3D. List Entrance Cascade

```tsx
// Stagger children on mount
const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 25 },
  },
}

function AnimatedList({ children }) {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible">
      {React.Children.map(children, child => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  )
}
```

### 3E. Number Counter Animation

```tsx
// components/AnimatedNumber.tsx
import { useMotionValue, useTransform, animate, motion } from 'framer-motion'

export function AnimatedNumber({ value, color }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1],
    })
    return controls.stop
  }, [value])

  return (
    <motion.span style={{ color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
      {rounded}
    </motion.span>
  )
}
```

---

## 4. TRACK CARDS — COMPLETE REDESIGN

### 4A. Standard Track Card

```tsx
// components/TrackCard.tsx
export function TrackCard({ track, featured = false }) {
  const [saved, setSaved] = useState(track.saved)

  return (
    <PressableCard featured={featured}>
      <div className={`track ${featured ? 'track--featured' : ''}`}>
        {/* Purple left accent for featured */}
        {featured && <div className="track__accent" />}

        {/* Album art */}
        <div className="track__art">
          <img
            src={track.artworkUrl}
            alt=""
            loading="lazy"
            className="track__art-img"
          />
          {/* Play overlay on hover/tap */}
          <motion.div
            className="track__play-overlay"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            whileTap={{ opacity: 1 }}
          >
            <div className="track__play-icon" />
          </motion.div>
        </div>

        {/* Info */}
        <div className="track__info">
          <div className="track__title">{track.title}</div>
          <div className="track__artist">
            {track.artist} · {track.label}
          </div>
          <div className="track__tags">
            <span className="tag tag--bpm">{track.bpm}</span>
            <span className="tag tag--key">{track.key}</span>
            <span className="tag tag--genre">{track.genre}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="track__actions">
          <SaveButton saved={saved} onToggle={() => setSaved(!saved)} />
          <span className="track__source">{track.source}</span>
        </div>
      </div>
    </PressableCard>
  )
}
```

```css
/* TrackCard.module.css */
.track {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.015);
}

.track--featured {
  background: linear-gradient(135deg, rgba(124,58,237,0.05), transparent 60%);
  border: 0.5px solid rgba(124,58,237,0.1);
}

.track__accent {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2.5px;
  background: linear-gradient(180deg, #7C3AED, #A78BFA);
  border-radius: 2px;
}

.track__art {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.track__art-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track__play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.track__play-icon {
  width: 0;
  height: 0;
  border-left: 12px solid rgba(255,255,255,0.95);
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  margin-left: 3px;
}

.track__info {
  flex: 1;
  min-width: 0;
}

.track__title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
  color: #F5F5F5;
}

.track__artist {
  font-size: 13px;
  color: #636366;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.track__tags {
  display: flex;
  gap: 5px;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.tag--bpm {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(124,58,237,0.1);
  color: #A78BFA;
  border: 0.5px solid rgba(124,58,237,0.15);
}

.tag--key {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(245,158,11,0.08);
  color: #FCD34D;
  border: 0.5px solid rgba(245,158,11,0.1);
}

.tag--genre {
  background: rgba(255,255,255,0.03);
  color: #48484A;
  border: 0.5px solid rgba(255,255,255,0.04);
  font-weight: 500;
}

.track__source {
  font-size: 9px;
  font-weight: 600;
  color: #2C2C2E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### 4B. Save Button with Particle Burst

```tsx
// components/SaveButton.tsx
export function SaveButton({ saved, onToggle }) {
  const [particles, setParticles] = useState([])

  const handleSave = () => {
    if (!saved) {
      // Generate particles
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 60) * (Math.PI / 180) + (Math.random() - 0.5) * 0.5,
        distance: 18 + Math.random() * 12,
        size: 3 + Math.random() * 2,
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 500)

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
    }
    onToggle()
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0,
              x: Math.cos(p.angle) * p.distance,
              y: Math.sin(p.angle) * p.distance,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: '#A78BFA',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Heart button */}
      <motion.button
        className={`heart-btn ${saved ? 'heart-btn--saved' : ''}`}
        onClick={handleSave}
        animate={saved ? {
          scale: [1, 1.3, 0.9, 1.1, 1],
        } : { scale: 1 }}
        transition={{
          duration: 0.5,
          times: [0, 0.2, 0.4, 0.6, 1],
        }}
        whileTap={{ scale: 0.85 }}
      >
        {saved ? '♥' : '♡'}
      </motion.button>
    </div>
  )
}
```

```css
.heart-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  background: rgba(255,255,255,0.03);
  border: 0.5px solid rgba(255,255,255,0.05);
  color: #3A3A3C;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.heart-btn--saved {
  background: rgba(124,58,237,0.12);
  border-color: rgba(124,58,237,0.18);
  color: #A78BFA;
}
```

### 4C. Swipeable Track Card (Discover / Tinder Mode)

```tsx
// components/SwipeableTrack.tsx
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

const SWIPE_THRESHOLD = 120
const ROTATION_FACTOR = 0.08

export function SwipeableTrack({ track, onSave, onSkip }) {
  const x = useMotionValue(0)

  // Visual feedback based on drag position
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12])
  const saveOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const skipOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const overlayBg = useTransform(
    x,
    [-200, 0, 200],
    [
      'rgba(239,68,68,0.15)',
      'transparent',
      'rgba(124,58,237,0.15)',
    ]
  )

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) {
      onSave(track)
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500) {
      onSkip(track)
    }
  }

  return (
    <motion.div
      style={{
        x,
        rotate,
        cursor: 'grab',
        position: 'relative',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      // Exit animation on swipe
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        rotate: x.get() > 0 ? 15 : -15,
        transition: { type: 'spring', stiffness: 200, damping: 20 },
      }}
    >
      {/* Save overlay */}
      <motion.div
        style={{
          opacity: saveOpacity,
          position: 'absolute',
          inset: 0,
          background: 'rgba(124,58,237,0.12)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          border: '1.5px solid rgba(124,58,237,0.3)',
          pointerEvents: 'none',
        }}
      >
        <span style={{
          fontSize: 48,
          fontWeight: 900,
          color: '#A78BFA',
          letterSpacing: 4,
          textShadow: '0 2px 12px rgba(124,58,237,0.5)',
        }}>
          ♥ SAVE
        </span>
      </motion.div>

      {/* Skip overlay */}
      <motion.div
        style={{
          opacity: skipOpacity,
          position: 'absolute',
          inset: 0,
          background: 'rgba(239,68,68,0.1)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          border: '1.5px solid rgba(239,68,68,0.25)',
          pointerEvents: 'none',
        }}
      >
        <span style={{
          fontSize: 48,
          fontWeight: 900,
          color: '#EF4444',
          letterSpacing: 4,
        }}>
          ✕ SKIP
        </span>
      </motion.div>

      {/* The actual track card — large format for swipe */}
      <SwipeTrackContent track={track} />
    </motion.div>
  )
}

// Large format card for swipe mode
function SwipeTrackContent({ track }) {
  return (
    <div style={{
      width: '100%',
      borderRadius: 20,
      overflow: 'hidden',
      background: '#0A0A0A',
      border: '0.5px solid rgba(255,255,255,0.05)',
    }}>
      {/* Large album art */}
      <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
        <img
          src={track.artworkUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay for text */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
        }} />
        {/* Source badge */}
        <div style={{
          position: 'absolute',
          top: 16, left: 16,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          color: '#F5F5F5',
          letterSpacing: 0.5,
          border: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          {track.source}
        </div>
        {/* Waveform preview at bottom of art */}
        <WaveformPreview style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
        }} />
      </div>

      {/* Track info below art */}
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{
          fontSize: 22, fontWeight: 700, letterSpacing: -0.5,
          marginBottom: 4,
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 15, color: '#636366', marginBottom: 14,
        }}>
          {track.artist} · {track.label}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="tag tag--bpm" style={{ fontSize: 12, padding: '5px 10px' }}>
            {track.bpm} BPM
          </span>
          <span className="tag tag--key" style={{ fontSize: 12, padding: '5px 10px' }}>
            {track.key}
          </span>
          <span className="tag tag--genre" style={{ fontSize: 12, padding: '5px 10px' }}>
            {track.genre}
          </span>
        </div>
      </div>
    </div>
  )
}
```

### 4D. Card Stack (behind current swipe card)

```tsx
// components/CardStack.tsx
export function CardStack({ tracks, currentIndex, onSave, onSkip }) {
  const visibleCards = tracks.slice(currentIndex, currentIndex + 3)

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '0.75' }}>
      <AnimatePresence>
        {visibleCards.map((track, i) => {
          const isTop = i === 0
          return (
            <motion.div
              key={track.id}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 3 - i,
              }}
              initial={{
                scale: 1 - i * 0.04,
                y: i * -14,
                opacity: 1 - i * 0.25,
              }}
              animate={{
                scale: 1 - i * 0.04,
                y: i * -14,
                opacity: 1 - i * 0.25,
                transition: { type: 'spring', stiffness: 300, damping: 25 },
              }}
            >
              {isTop ? (
                <SwipeableTrack track={track} onSave={onSave} onSkip={onSkip} />
              ) : (
                <SwipeTrackContent track={track} />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Counter */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 13,
          color: '#48484A',
          fontWeight: 500,
        }}
      >
        <AnimatedNumber value={currentIndex + 1} color="#8E8E93" />
        <span> of </span>
        <span>{tracks.length}</span>
      </motion.div>
    </div>
  )
}
```

### 4E. Waveform Preview Component

```tsx
// components/WaveformPreview.tsx
export function WaveformPreview({ data, progress = 0, height = 32, style }) {
  const bars = 48 // number of bars across the width

  // Generate bars from audio data or random if no data
  const barHeights = useMemo(() =>
    data || Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8),
    [data]
  )

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height,
      ...style,
    }}>
      {barHeights.map((h, i) => {
        const played = i / bars < progress
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: 1,
              background: played
                ? 'rgba(124,58,237,0.8)'
                : 'rgba(255,255,255,0.2)',
              transition: 'background 0.15s',
            }}
          />
        )
      })}
    </div>
  )
}
```

---

## 5. BOTTOM SHEETS & MODALS

### 5A. Track Detail Bottom Sheet

Opens when tapping a track card. Drag down to dismiss.

```tsx
// components/TrackDetail.tsx
export function TrackDetailSheet({ track, isOpen, onClose }) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '20px 20px 40px' }}>
        {/* Large album art */}
        <div style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 20,
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <img src={track.artworkUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Track info */}
        <h2 style={{
          fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4,
        }}>
          {track.title}
        </h2>
        <p style={{ fontSize: 16, color: '#8E8E93', marginBottom: 20 }}>
          {track.artist} · {track.label}
        </p>

        {/* Waveform with scrubbing */}
        <WaveformPreview data={track.waveform} progress={0.35} height={48} />

        {/* Metadata grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          margin: '20px 0',
        }}>
          <MetaCard label="BPM" value={track.bpm} color="#A78BFA" />
          <MetaCard label="Key" value={track.key} color="#FCD34D" />
          <MetaCard label="Genre" value={track.genre} color="#8E8E93" />
        </div>

        {/* Source info */}
        <div style={{
          padding: 16,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.025)',
          border: '0.5px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, color: '#636366' }}>Source</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{track.source}</div>
          </div>
          <PressableButton variant="ghost">View on {track.source} →</PressableButton>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <PressableButton variant="primary" style={{ flex: 1 }}>
            ♥ Save to Crate
          </PressableButton>
          <PressableButton variant="secondary" style={{ flex: 1 }}>
            Buy ${track.price}
          </PressableButton>
        </div>
      </div>
    </SlidePanel>
  )
}

function MetaCard({ label, value, color }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '14px 8px',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.02)',
      border: '0.5px solid rgba(255,255,255,0.03)',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono',
        fontSize: 18,
        fontWeight: 700,
        color,
        marginBottom: 2,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: '#3A3A3C',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      }}>
        {label}
      </div>
    </div>
  )
}
```

### 5B. Filter Bottom Sheet

```tsx
// components/FilterSheet.tsx
export function FilterSheet({ isOpen, onClose, onApply }) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '24px 20px 40px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Filters</h3>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#7C3AED',
            fontSize: 14,
            fontWeight: 500,
          }}>
            Reset
          </button>
        </div>

        {/* Genre pills — wrap layout */}
        <SectionLabel>Genres</SectionLabel>
        <GenrePills />

        {/* BPM slider */}
        <SectionLabel>BPM Range</SectionLabel>
        <DualThumbSlider min={100} max={160} />

        {/* Sources toggles */}
        <SectionLabel>Sources</SectionLabel>
        <SourceToggles />

        <PressableButton
          variant="primary"
          onClick={onApply}
          style={{ width: '100%', marginTop: 24 }}
        >
          Apply Filters
        </PressableButton>
      </div>
    </SlidePanel>
  )
}
```

---

## 6. NATIVE FEEL SYSTEMS

### 6A. Pull to Refresh

```tsx
// components/PullToRefresh.tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'

const PULL_THRESHOLD = 80

export function PullToRefresh({ onRefresh, children }) {
  const y = useMotionValue(0)
  const [refreshing, setRefreshing] = useState(false)

  const pullProgress = useTransform(y, [0, PULL_THRESHOLD], [0, 1])
  const indicatorRotation = useTransform(pullProgress, [0, 1], [0, 180])
  const indicatorScale = useTransform(pullProgress, [0, 0.5, 1], [0.5, 0.8, 1])

  const handleDragEnd = async () => {
    if (y.get() >= PULL_THRESHOLD) {
      setRefreshing(true)
      if (navigator.vibrate) navigator.vibrate(15)
      await onRefresh()
      setRefreshing(false)
    }
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Pull indicator */}
      <motion.div
        style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          y,
          scale: indicatorScale,
        }}
      >
        {refreshing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            style={{
              width: 24, height: 24,
              border: '2.5px solid rgba(124,58,237,0.2)',
              borderTopColor: '#7C3AED',
              borderRadius: '50%',
            }}
          />
        ) : (
          <motion.div
            style={{
              rotate: indicatorRotation,
              fontSize: 20,
              color: '#7C3AED',
            }}
          >
            ↓
          </motion.div>
        )}
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.4, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  )
}
```

### 6B. Haptic Feedback Utility

```typescript
// utils/haptics.ts
export const haptics = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(15),
  heavy: () => navigator.vibrate?.(25),
  success: () => navigator.vibrate?.([10, 50, 10]),
  error: () => navigator.vibrate?.([30, 50, 30, 50, 30]),
  selection: () => navigator.vibrate?.(5),
}

// Usage: haptics.light() on save, haptics.success() on match found
```

### 6C. Smooth Momentum Scroll

```css
/* Global scroll behavior */
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scroll-behavior: smooth;
}

/* Hide scrollbar but keep functionality */
.scroll-container::-webkit-scrollbar {
  display: none;
}
.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Horizontal scroll with snap */
.h-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  overscroll-behavior-x: contain;
}

.h-scroll > * {
  scroll-snap-align: start;
}
```

### 6D. Toast Notifications

```tsx
// components/Toast.tsx
const toastVariants = {
  hidden: {
    y: 100,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 28 },
  },
  exit: {
    y: 80,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
}

export function Toast({ message, icon = '♥', visible, onDismiss }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'fixed',
            bottom: 100, // above mini player + tab bar
            left: 16,
            right: 16,
            padding: '14px 20px',
            borderRadius: 14,
            background: 'rgba(124,58,237,0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 200,
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}
        >
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 6E. Persistent Mini Player

```tsx
// components/MiniPlayer.tsx
export function MiniPlayer({ track, isPlaying, onPlayPause, onExpand }) {
  if (!track) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onExpand}
      style={{
        position: 'fixed',
        bottom: 92, // above tab bar (88px) + 4px gap
        left: 8,
        right: 8,
        height: 64,
        borderRadius: 16,
        background: 'rgba(28,28,30,0.92)',
        backdropFilter: 'blur(30px)',
        border: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 12,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        cursor: 'pointer',
      }}
    >
      {/* Album art */}
      <motion.div
        style={{
          width: 42, height: 42, borderRadius: 10,
          overflow: 'hidden', flexShrink: 0,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <img src={track.artworkUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </motion.div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#F5F5F5',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 11, color: '#636366',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {track.artist}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={e => e.stopPropagation()}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onPlayPause}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#F5F5F5',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 14, right: 14,
        height: 2,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 1,
      }}>
        <motion.div
          style={{
            height: '100%',
            background: '#7C3AED',
            borderRadius: 1,
            width: '35%', // bind to actual progress
          }}
        />
      </div>
    </motion.div>
  )
}
```

---

## 7. TYPOGRAPHY SYSTEM

```css
/* typography.css — import globally */

/* Large Title (iOS) — page headers */
.type-largeTitle {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
}

/* Title 1 — section headers */
.type-title1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

/* Title 2 — card headers */
.type-title2 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1.2;
}

/* Headline — track titles */
.type-headline {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  line-height: 1.3;
}

/* Body */
.type-body {
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -0.2px;
  line-height: 1.5;
}

/* Callout — descriptions */
.type-callout {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.1px;
  line-height: 1.4;
}

/* Caption 1 — artist names, secondary info */
.type-caption1 {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.3;
  color: #636366;
}

/* Caption 2 — labels */
.type-caption2 {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #48484A;
}

/* Mono — BPM, key, technical data */
.type-mono {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Hero number — daily drop "20" */
.type-hero {
  font-size: 72px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 0.85;
  background: linear-gradient(180deg, #F5F5F5 0%, rgba(245,245,245,0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Gradient accent text */
.type-gradient {
  background: linear-gradient(135deg, #C4B5FD, #7C3AED, #A78BFA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Eyebrow — section pre-labels */
.type-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
```

---

## 8. SPACING & LAYOUT GRID

```css
/* layout.css */

/* Page-level layout */
.page {
  padding: 0 16px;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
}

/* When mini player is visible, add its height */
.page--with-player {
  padding-bottom: calc(88px + 68px + env(safe-area-inset-bottom));
}

/* Section spacing rhythm */
.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 8px;
  margin-bottom: 16px;
}

/* Card gaps */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 4px; /* tight — cards form a visual group */
}

.card-list--loose {
  gap: 8px; /* settings-style */
}

/* Safe areas for notch + home indicator */
.safe-top {
  padding-top: env(safe-area-inset-top, 54px);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 34px);
}

/* Tab bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(54px + env(safe-area-inset-bottom, 34px));
  padding-bottom: env(safe-area-inset-bottom, 34px);
  padding-top: 10px;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 0.5px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  z-index: 100;
}
```

---

## 9. GLASS MORPHISM & DEPTH

### Material Layers (z-order)

```
Layer 0: Background (#000 + grain + ambient glow)
Layer 1: Cards (surface.1 + subtle border)
Layer 2: Elevated cards, featured items (surface.2 + accent border)
Layer 3: Bottom sheet panels (glass.bg + heavy blur)
Layer 4: Mini player (glass.bg + medium blur + shadow)
Layer 5: Tab bar (glass.bg + heavy blur)
Layer 6: Toasts, alerts (accent bg + blur)
Layer 7: Full-screen overlays
```

### Grain Overlay (global)

```css
/* Apply to body::after or a fixed overlay */
.grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
  background-size: 256px;
  mix-blend-mode: overlay;
}
```

### Ambient Glow (per-page, color-extracted)

```tsx
// components/AmbientGlow.tsx
export function AmbientGlow({ color = '#7C3AED', intensity = 0.14 }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -120,
        left: -80,
        width: 600,
        height: 500,
        background: `radial-gradient(ellipse at 40% 30%, ${color}${Math.round(intensity * 255).toString(16).padStart(2,'0')}, transparent 55%)`,
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }}
    />
  )
}
```

### Gradient Border Utility

```css
/* Gradient border via mask-composite */
.gradient-border {
  position: relative;
}
.gradient-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid transparent;
  background: linear-gradient(135deg,
    rgba(124,58,237,0.35),
    rgba(255,255,255,0.06),
    rgba(245,158,11,0.15)
  ) border-box;
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### Accent Top Line (stat cards)

```css
.accent-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1.5px;
  border-radius: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--accent-color),
    transparent
  );
}

.accent-line::after {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color);
  opacity: 0.2;
  filter: blur(10px);
}
```

---

## 10. COMPONENT LIBRARY SUMMARY

| Component | File | Description |
|-----------|------|-------------|
| PageTransition | PageTransition.tsx | Push/pop + crossfade between views |
| TabView | TabTransition.tsx | Crossfade between tabs |
| SlidePanel | SlidePanel.tsx | Bottom sheet with drag-to-dismiss |
| PressableButton | PressableButton.tsx | Scale-on-tap buttons |
| PressableCard | PressableCard.tsx | Scale-on-tap card wrapper |
| AnimatedList | AnimatedList.tsx | Staggered cascade entrance |
| AnimatedNumber | AnimatedNumber.tsx | Counter roll-up |
| TrackCard | TrackCard.tsx | Standard track card |
| SaveButton | SaveButton.tsx | Heart with particles |
| SwipeableTrack | SwipeableTrack.tsx | Tinder-style swipe card |
| CardStack | CardStack.tsx | Stacked card deck for Discover |
| WaveformPreview | WaveformPreview.tsx | Bar waveform with progress |
| TrackDetailSheet | TrackDetail.tsx | Full track detail bottom sheet |
| FilterSheet | FilterSheet.tsx | Genre/BPM/source filter panel |
| PullToRefresh | PullToRefresh.tsx | Custom pull-to-refresh |
| Toast | Toast.tsx | Spring-animated toast |
| MiniPlayer | MiniPlayer.tsx | Persistent playback bar |
| SkeletonTrack | Skeleton.tsx | Shimmer loading placeholder |
| AmbientGlow | AmbientGlow.tsx | Color-extracted background glow |

---

## PERFORMANCE CHECKLIST

- [ ] Only animate `transform` and `opacity` (never layout props)
- [ ] `will-change: transform` on frequently animated elements
- [ ] Remove `will-change` after animation completes
- [ ] Lazy load images below the fold (`loading="lazy"`)
- [ ] Use `<link rel="preload">` for Inter and JetBrains Mono fonts
- [ ] 60fps minimum on iPhone 12 (test with Safari dev tools)
- [ ] Respect `prefers-reduced-motion: reduce`
- [ ] Test on 3G throttled — skeleton loaders must appear instantly
- [ ] Images: WebP format, max 400px wide for track art, 800px for detail
- [ ] Tab bar and mini player render independently (no re-render on scroll)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## IMPLEMENTATION PRIORITY

**Week 1 (Pre-launch critical):**
1. Design tokens + typography system
2. Track cards (standard + featured)
3. Save button with particles
4. Skeleton loaders
5. Mini player
6. Tab bar + page transitions
7. Bottom sheet component
8. Grain overlay + ambient glow

**Week 2 (Launch polish):**
1. Swipe cards (Discover page)
2. Card stack
3. Pull to refresh
4. Toast notifications
5. Waveform preview
6. Track detail sheet
7. Filter sheet
8. Number counter animations

---

*This is the blueprint. Every component has code Duda can copy. Every animation has spring values tuned. Every color has a token. Build it exactly as spec'd and we're at 9.5.*

*The last 0.5 comes from real data + real device testing under club lighting.*
