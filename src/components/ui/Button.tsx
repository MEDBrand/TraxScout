'use client';

// Apple-quality Button Component
// Haptic feedback, smooth animations, full accessibility

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { springs } from '@/lib/animations';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  hapticFeedback?: boolean;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white shadow-lg shadow-[#7C3AED]/20',
  secondary: 'bg-[#141414] hover:bg-[#1f1f1f] active:bg-[#0A0A0A] text-white border border-white/10',
  ghost: 'bg-transparent hover:bg-white/5 active:bg-white/10 text-[#A1A1AA] hover:text-white',
  danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3.5 text-lg min-h-[48px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      hapticFeedback = true,
      disabled,
      onClick,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback && !disabled && !loading) {
        haptic.light();
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        transition={springs.micro}
        onClick={handleClick}
        disabled={disabled || loading}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          relative inline-flex items-center justify-center
          rounded-xl font-semibold
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-manipulation select-none
          ${className}
        `}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}

        {/* Button content */}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
