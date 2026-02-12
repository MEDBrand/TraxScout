'use client';

// Apple-quality Page Transitions
// Smooth enter/exit animations for routes

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, springs } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={springs.gentle}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for list items
export function StaggerContainer({ 
  children, 
  className = '',
  delay = 0.1,
  stagger = 0.05,
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
        exit: {
          transition: {
            staggerChildren: stagger / 2,
            staggerDirection: -1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item
export function StaggerItem({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: springs.gentle,
        },
        exit: { 
          opacity: 0, 
          y: -10,
          transition: { duration: 0.2 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in component
export function FadeIn({ 
  children, 
  className = '',
  delay = 0,
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide up (for modals, sheets)
export function SlideUp({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={springs.snappy}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in (for modals, alerts)
export function ScaleIn({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springs.snappy}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
