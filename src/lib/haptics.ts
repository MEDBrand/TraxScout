// Haptic Feedback Utility
// Apple-style tactile responses for mobile interactions

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Check if haptic feedback is available
export function supportsHaptics(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}

// Trigger haptic feedback
export function haptic(style: HapticStyle = 'light'): void {
  if (!supportsHaptics()) return;

  // Vibration patterns (in milliseconds)
  const patterns: Record<HapticStyle, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 20],
    warning: [20, 40, 20, 40, 20],
    error: [50, 30, 50],
    selection: 5,
  };

  try {
    navigator.vibrate(patterns[style]);
  } catch {
    // Silently fail if vibration not supported
  }
}

// Hook for haptic feedback on interactions
export function useHaptic() {
  return {
    light: () => haptic('light'),
    medium: () => haptic('medium'),
    heavy: () => haptic('heavy'),
    success: () => haptic('success'),
    warning: () => haptic('warning'),
    error: () => haptic('error'),
    selection: () => haptic('selection'),
  };
}

// Higher-order component for adding haptics to click handlers
export function withHaptic<T extends (...args: unknown[]) => unknown>(
  handler: T,
  style: HapticStyle = 'light'
): T {
  return ((...args: unknown[]) => {
    haptic(style);
    return handler(...args);
  }) as T;
}
