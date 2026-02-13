'use client';

// Apple-quality Toast Notifications
// Optimistic UI feedback, smooth animations, haptics

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { toastVariants, springs } from '@/lib/animations';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
      const id = Math.random().toString(36).slice(2);
      
      // Haptic feedback based on type
      if (type === 'success') haptic.success();
      else if (type === 'error') haptic.error();
      else if (type === 'warning') haptic('warning');
      else haptic.light();

      setToasts((prev) => [...prev, { id, type, message, duration }]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message, 5000), [addToast]);
  const warning = useCallback((message: string) => addToast('warning', message, 4000), [addToast]);
  const info = useCallback((message: string) => addToast('info', message), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container
function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]; 
  onRemove: (id: string) => void;
}) {
  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Toast
function ToastItem({ 
  toast, 
  onRemove 
}: { 
  toast: Toast; 
  onRemove: (id: string) => void;
}) {
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors: Record<ToastType, string> = {
    success: 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]',
    error: 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]',
    warning: 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]',
    info: 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6]',
  };

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springs.snappy}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          haptic.light();
          onRemove(toast.id);
        }
      }}
      className={`
        ${colors[toast.type]}
        backdrop-blur-xl
        border rounded-xl
        px-4 py-3
        flex items-center gap-3
        pointer-events-auto
        cursor-grab active:cursor-grabbing
        shadow-lg
      `}
      role="alert"
    >
      <span className="text-lg" aria-hidden="true">{icons[toast.type]}</span>
      <span className="flex-1 text-sm font-medium text-white">{toast.message}</span>
      <button
        onClick={() => {
          haptic.light();
          onRemove(toast.id);
        }}
        className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </motion.div>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
