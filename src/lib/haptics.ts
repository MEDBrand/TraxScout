// Haptic feedback via Vibration API
// Falls back silently on unsupported devices
export const haptic = {
  light: () => navigator?.vibrate?.(10),
  medium: () => navigator?.vibrate?.(25),
  success: () => navigator?.vibrate?.([10, 50, 20]),
  error: () => navigator?.vibrate?.([50, 30, 50]),
  listening: () => navigator?.vibrate?.([10, 100, 10, 100, 10]),
};
