// Animation Presets - Apple-style motion design
// Based on Apple's Human Interface Guidelines

import { type Variants, type Transition } from 'framer-motion';

// Spring configurations (Apple-style physics)
export const springs = {
  // Snappy, responsive feel
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  // Gentle, natural movement
  gentle: { type: 'spring', stiffness: 200, damping: 20 } as Transition,
  // Bouncy, playful
  bouncy: { type: 'spring', stiffness: 300, damping: 15 } as Transition,
  // Smooth, elegant
  smooth: { type: 'spring', stiffness: 150, damping: 25 } as Transition,
  // Quick micro-interaction
  micro: { type: 'spring', stiffness: 500, damping: 35 } as Transition,
};

// Timing functions (for non-spring animations)
export const easings = {
  // Apple's default easing
  appleEase: [0.25, 0.1, 0.25, 1],
  // Ease out (decelerate)
  easeOut: [0, 0, 0.2, 1],
  // Ease in (accelerate)
  easeIn: [0.4, 0, 1, 1],
  // Ease in-out
  easeInOut: [0.4, 0, 0.2, 1],
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

// Fade in variants
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Slide up variants (for modals, sheets)
export const slideUp: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0, transition: springs.snappy },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.2 } },
};

// Scale variants (for buttons, cards)
export const scale: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: springs.snappy },
  exit: { scale: 0.95, opacity: 0 },
  tap: { scale: 0.98 },
  hover: { scale: 1.02 },
};

// Stagger children variants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: springs.gentle,
  },
};

// List item variants (for swipe-to-delete, etc.)
export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: springs.gentle },
  exit: { opacity: 0, x: 100, transition: springs.snappy },
};

// Button press variants
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Card hover variants
export const cardVariants: Variants = {
  idle: { 
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: springs.gentle,
  },
  tap: { 
    scale: 0.98,
    transition: springs.micro,
  },
};

// Skeleton loading pulse
export const skeletonPulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Toast notification variants
export const toastVariants: Variants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } },
};

// Checkbox/toggle variants
export const checkVariants: Variants = {
  unchecked: { pathLength: 0, opacity: 0 },
  checked: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};
