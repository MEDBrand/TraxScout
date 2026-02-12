'use client';

// Apple-quality Skeleton Loading
// Shimmer animation for optimistic UI

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ 
  className = '', 
  width, 
  height,
  rounded = 'lg',
}: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`
        bg-gradient-to-r from-[#141414] via-[#1f1f1f] to-[#141414]
        background-size-200
        ${roundedClasses[rounded]}
        ${className}
      `}
      style={{ 
        width: width ?? '100%', 
        height: height ?? '1rem',
        backgroundSize: '200% 100%',
      }}
      aria-hidden="true"
    />
  );
}

// Text skeleton
export function SkeletonText({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? '70%' : '100%'} 
          height="0.875rem" 
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ 
  size = 48, 
  className = '' 
}: { 
  size?: number; 
  className?: string;
}) {
  return (
    <Skeleton 
      width={size} 
      height={size} 
      rounded="full" 
      className={className} 
    />
  );
}

// Card skeleton
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size={40} />
        <div className="flex-1">
          <Skeleton height="1rem" width="60%" className="mb-2" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

// Track/list item skeleton
export function SkeletonTrack({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      <Skeleton width={48} height={48} rounded="lg" />
      <div className="flex-1">
        <Skeleton height="1rem" width="70%" className="mb-2" />
        <Skeleton height="0.75rem" width="50%" />
      </div>
      <Skeleton width={60} height="2rem" rounded="lg" />
    </div>
  );
}

export default Skeleton;
