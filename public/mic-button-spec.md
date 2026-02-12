# Audio ID Mic Button — Design Spec

## Dimensions
- **Button size**: 64px diameter (touch target: 72px)
- **Icon size**: 28px mic SVG
- **Border radius**: 50% (circle)

## States

### 1. Idle
- **Background**: `#7C3AED` (Purple)
- **Icon color**: `#FFFFFF`
- **Shadow**: `0 4px 16px rgba(124, 58, 237, 0.3)`
- **Behavior**: Static. Subtle scale on hover (1.05, 150ms ease-out)
- **Press**: Scale to 0.95, 120ms ease-out

### 2. Listening (Active)
- **Background**: `#7C3AED` with pulsing ring animation
- **Icon color**: `#FFFFFF`
- **Pulse ring**: 3 concentric rings expanding outward
  - Ring color: `rgba(124, 58, 237, 0.4)` → `rgba(124, 58, 237, 0)`
  - Ring scale: 1.0 → 2.0
  - Duration: 1.5s each, staggered 0.5s apart
  - Animation: `ease-out`, infinite loop
- **Inner glow**: `0 0 24px rgba(124, 58, 237, 0.5)`
- **Label**: "Listening..." in `#A1A1AA`, 13px, appears below button with fade-in (200ms)

### 3. Processing
- **Background**: `#5B21B6` (Purple Active, darker)
- **Icon**: Replace mic with a rotating waveform/spinner
  - 4 small bars (3px × varying height) doing a wave animation
  - Color: `#FFFFFF`
  - Animation: sequential height pulse, 800ms loop
- **Pulse rings**: Stop and fade out (300ms)
- **Shadow**: `0 0 16px rgba(124, 58, 237, 0.3)`
- **Label**: "Identifying..." in `#A1A1AA`, 13px

### 4. Success (Transient — 2s)
- **Background**: `#22C55E` (Success green)
- **Icon**: Checkmark, white
- **Scale**: Pop to 1.1, spring back to 1.0 (300ms)
- **Shadow**: `0 0 20px rgba(34, 197, 94, 0.4)`

### 5. Error (Transient — 2s)
- **Background**: `#EF4444` (Error red)
- **Icon**: X mark, white
- **Shake**: translateX ±4px, 3 cycles, 400ms
- **Shadow**: `0 0 20px rgba(239, 68, 68, 0.4)`

## Transitions
| From → To | Duration | Easing |
|-----------|----------|--------|
| Idle → Listening | 200ms | ease-out |
| Listening → Processing | 300ms | ease-in-out |
| Processing → Success | 200ms | spring(1, 80, 10) |
| Processing → Error | 200ms | ease-out |
| Success/Error → Idle | 400ms | ease-out (after 2s hold) |

## Placement
- Centered horizontally in the Audio ID panel
- 24px padding below the last content element
- FAB (floating action button) variant: fixed bottom-right, 24px from edges

## Mic SVG (Idle State)
```svg
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="1" width="6" height="12" rx="3"/>
  <path d="M5 10a7 7 0 0 0 14 0"/>
  <line x1="12" y1="17" x2="12" y2="22"/>
  <line x1="8" y1="22" x2="16" y2="22"/>
</svg>
```

## Accessibility
- `aria-label`: "Identify track" (idle), "Listening for audio" (listening), "Identifying track" (processing)
- `role="button"`
- Focus ring: 2px offset, `#7C3AED`, visible on keyboard nav
