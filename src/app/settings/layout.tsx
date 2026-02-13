'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Toast';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
