'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Home', icon: '🏠', href: '/dashboard' },
  { label: 'Discover', icon: '🔍', href: '/discover' },
  { label: 'Audio ID', icon: '🎙️', href: '/audio-id' },
  { label: 'Crate', icon: '📦', href: '/crate' },
  { label: 'Settings', icon: '⚙️', href: '/settings' },
] as const;

const VISIBLE_PATHS = ['/dashboard', '/discover', '/audio-id', '/crate', '/settings'];

export default function BottomTabBar() {
  const pathname = usePathname();

  if (!VISIBLE_PATHS.includes(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-[#1A1A1A]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] transition-colors ${
                active ? 'text-[#7C3AED]' : 'text-[#555]'
              }`}
            >
              <span className="text-[24px] leading-none">{tab.icon}</span>
              <span className="text-[10px] leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
