'use client';

// Apple-quality Card Component
// Gesture support, smooth hover effects, swipe actions

import { type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { springs } from '@/lib/animations';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeEnabled?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  onSwipeLeft,
  onSwipeRight,
  swipeEnabled = false,
  hoverable = true,
}: CardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const rotateZ = useTransform(x, [-100, 0, 100], [-5, 0, 5]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x < -threshold && onSwipeLeft) {
      haptic('medium');
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      haptic('medium');
      onSwipeRight();
    }
  };

  const handleTap = () => {
    if (onClick) {
      haptic('light');
      onClick();
    }
  };

  return (
    <motion.div
      style={swipeEnabled ? { x, opacity, rotateZ } : undefined}
      drag={swipeEnabled ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={springs.gentle}
      onClick={handleTap}
      className={`
        bg-[#0A0A0A] backdrop-blur-sm
        border border-white/10
        rounded-2xl
        overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleTap();
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Card Header
export function CardHeader({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 border-b border-white/10 ${className}`}>
      {children}
    </div>
  );
}

// Card Content
export function CardContent({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

// Card Footer
export function CardFooter({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
