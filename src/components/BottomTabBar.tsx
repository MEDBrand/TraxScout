'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'rgba(124,58,237,0.15)' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V13h6v8"/>
    </svg>
  );
}

function AudioIdIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'rgba(124,58,237,0.15)' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3"/>
      <path d="M5 10a7 7 0 0014 0"/>
      <path d="M12 17v4"/>
      <path d="M8 21h8"/>
    </svg>
  );
}

function CrateIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'rgba(124,58,237,0.15)' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3"/>
      <path d="M2 12h20"/>
      <path d="M10 12v3h4v-3"/>
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'rgba(124,58,237,0.15)' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

const TABS = [
  { label: 'Home', Icon: HomeIcon, href: '/dashboard' },
  { label: 'Audio ID', Icon: AudioIdIcon, href: '/audio-id' },
  { label: 'Crate', Icon: CrateIcon, href: '/crate' },
  { label: 'Settings', Icon: SettingsIcon, href: '/settings' },
] as const;

const VISIBLE_PATHS = ['/dashboard', '/audio-id', '/crate', '/settings'];

export default function BottomTabBar() {
  const pathname = usePathname();

  if (!VISIBLE_PATHS.includes(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', height: 'calc(56px + env(safe-area-inset-bottom, 0px))', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => navigator?.vibrate?.(10)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] transition-colors press ${
                active ? 'text-[#7C3AED]' : 'text-[#6B6B6B]'
              }`}
            >
              <div className={active ? 'tab-bounce' : ''}>
                <tab.Icon active={active} />
              </div>
              <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
