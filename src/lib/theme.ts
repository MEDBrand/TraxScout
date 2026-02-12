// Traxscout Brand Colors
// Apple-method + Feng Shui approved (Feb 10, 2026)
// Team consensus: Wei ✅ Jony ✅ Marco ✅

export const colors = {
  // Backgrounds - True Black (OLED-optimized)
  black: {
    DEFAULT: '#000000',
    surface: '#0A0A0A',    // Cards, containers
    elevated: '#141414',   // Modals, popovers, dropdowns
  },
  
  // Primary - Purple (Fire element, creativity)
  // Shifted from #7C3AED to #7C3AED for better contrast on black
  primary: {
    DEFAULT: '#7C3AED',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#7C3AED',
    600: '#6D28D9',
    700: '#5B21B6',
    800: '#4C1D95',
    900: '#3B0764',
  },
  
  // Accent - Gold (Prosperity element, success)
  gold: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#71717A',
  },
  
  // Borders
  border: {
    DEFAULT: '#27272A',
    subtle: '#18181B',
  },
  
  // Semantic
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B', // Same as gold
} as const;

// CSS Custom Properties for Tailwind
export const cssVariables = `
  :root {
    /* Backgrounds */
    --color-black: #000000;
    --color-surface: #0A0A0A;
    --color-elevated: #141414;
    
    /* Brand */
    --color-primary: #7C3AED;
    --color-gold: #F59E0B;
    
    /* Text */
    --text-primary: #FFFFFF;
    --text-secondary: #A1A1AA;
    --text-muted: #71717A;
    
    /* Borders */
    --border-default: #27272A;
    --border-subtle: #18181B;
  }
`;

// Tailwind config extension
export const tailwindColors = {
  black: '#000000',
  surface: '#0A0A0A',
  elevated: '#141414',
  primary: {
    DEFAULT: '#7C3AED',
    hover: '#6D28D9',
  },
  gold: {
    DEFAULT: '#F59E0B',
    hover: '#D97706',
  },
};
