'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already accepted
    if (typeof window !== 'undefined' && !localStorage.getItem('cookie-consent')) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 animate-slideUp"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out both; }
      `}</style>
      <div className="max-w-xl mx-auto bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-2xl">
        <p className="text-[#A1A1AA] text-sm leading-relaxed flex-1">
          We use cookies for authentication and to remember your preferences. No tracking, no ads.{' '}
          <a href="/privacy" className="text-[#7C3AED] underline underline-offset-2 hover:text-[#6D28D9]">
            Privacy Policy
          </a>
        </p>
        <button
          onClick={accept}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] whitespace-nowrap shrink-0"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
