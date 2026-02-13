'use client';

import { useState, useEffect, useRef } from 'react';
import BottomTabBar from '@/components/BottomTabBar';

type State = 'idle' | 'listening' | 'matched' | 'error';

export default function AudioIdPage() {
  const [state, setState] = useState<State>('idle');
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state === 'listening') {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      const timeout = setTimeout(() => setState('error'), 15000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearTimeout(timeout);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [state]);

  const handleTap = () => {
    if (state === 'listening') setState('idle');
    else if (state === 'error' || state === 'matched') setState('idle');
    else setState('listening');
  };

  return (
    <main className="min-h-screen bg-black text-white pb-24 overflow-hidden">
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -60px) scale(1.2); }
          50% { transform: translate(-30px, -100px) scale(0.9); }
          75% { transform: translate(50px, -40px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-50px, -40px) scale(1.1); }
          50% { transform: translate(40px, -80px) scale(1.3); }
          75% { transform: translate(-30px, -60px) scale(0.95); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -50px) scale(1.15); }
          66% { transform: translate(-40px, -70px) scale(1.05); }
        }
        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes ringPulseSlow {
          0% { transform: scale(0.9); opacity: 0.4; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes waveform {
          0%, 100% { height: var(--min-h, 4px); }
          50% { height: var(--max-h, 32px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @keyframes gradientRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .ring-animate {
          animation: ringPulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .ring-animate-slow {
          animation: ringPulseSlow 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
      `}</style>

      {/* Background gradient layer */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Ambient orbs — always visible but intensify when listening */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[120px] transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            opacity: state === 'listening' ? 1 : 0.3,
            animation: 'orbFloat1 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-[130px] transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            opacity: state === 'listening' ? 0.8 : 0.2,
            animation: 'orbFloat2 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-56 h-56 rounded-full blur-[100px] transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            opacity: state === 'listening' ? 0.9 : 0.15,
            animation: 'orbFloat3 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">

        {/* Status text */}
        <div className="text-center mb-16" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          {state === 'idle' && (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Tap to listen</h1>
              <p className="text-[#71717A] text-base">Identify any track playing around you</p>
            </>
          )}
          {state === 'listening' && (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Listening</h1>
              <p className="text-[#A1A1AA] text-base font-mono tabular-nums">{seconds}s</p>
            </>
          )}
          {state === 'matched' && (
            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-emerald-400">Found it</h1>
              <p className="text-[#A1A1AA] text-base">Track identified</p>
            </div>
          )}
          {state === 'error' && (
            <div style={{ animation: 'shake 0.5s ease-in-out' }}>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-[#71717A]">No match</h1>
              <p className="text-[#555] text-base">Try again closer to the speaker</p>
            </div>
          )}
        </div>

        {/* Main button area */}
        <div className="relative flex items-center justify-center mb-16">

          {/* Pulse rings (listening only) */}
          {state === 'listening' && (
            <>
              <div className="absolute w-44 h-44 rounded-full border border-[#7C3AED]/20 ring-animate" />
              <div className="absolute w-44 h-44 rounded-full border border-[#7C3AED]/15 ring-animate" style={{ animationDelay: '0.6s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-[#7C3AED]/10 ring-animate-slow" style={{ animationDelay: '1.2s' }} />
            </>
          )}

          {/* Outer ring — gradient border */}
          <div
            className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full p-[2px] cursor-pointer"
            onClick={handleTap}
            style={{
              background: state === 'listening'
                ? 'conic-gradient(from 0deg, #7C3AED, #6366F1, #A855F7, #7C3AED)'
                : state === 'matched'
                ? 'conic-gradient(from 0deg, #10B981, #34D399, #6EE7B7, #10B981)'
                : 'conic-gradient(from 0deg, rgba(124,58,237,0.4), rgba(99,102,241,0.2), rgba(168,85,247,0.4), rgba(124,58,237,0.4))',
              animation: state === 'listening' ? 'gradientRotate 3s linear infinite' : 'none',
            }}
          >
            {/* Inner fill */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                background: state === 'listening'
                  ? 'radial-gradient(circle at 40% 40%, #1a1025 0%, #0d0d0d 100%)'
                  : state === 'matched'
                  ? 'radial-gradient(circle at 40% 40%, #0d1a14 0%, #0d0d0d 100%)'
                  : 'radial-gradient(circle at 40% 40%, #141414 0%, #0A0A0A 100%)',
                animation: state === 'listening' ? 'breathe 2.5s ease-in-out infinite' : 'none',
              }}
            >
              {state === 'matched' ? (
                <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animation: 'successPop 0.4s ease-out' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : state === 'error' ? (
                <svg className="w-10 h-10 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" opacity="0.7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Waveform (listening) */}
        {state === 'listening' && (
          <div className="flex items-center justify-center gap-[3px] h-10 mb-8" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const maxH = 8 + Math.sin(i * 0.7) * 16 + Math.random() * 12;
              return (
                <div
                  key={i}
                  className="w-[2.5px] rounded-full"
                  style={{
                    background: `linear-gradient(to top, #7C3AED, #A855F7)`,
                    // @ts-expect-error css custom property
                    '--min-h': '3px',
                    '--max-h': `${maxH}px`,
                    height: '3px',
                    animation: `waveform ${0.3 + Math.random() * 0.5}s ease-in-out ${i * 0.03}s infinite`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Tap again hint */}
        {state === 'listening' && (
          <p className="text-[#555] text-xs" style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
            Tap to cancel
          </p>
        )}

        {/* Try again */}
        {(state === 'error' || state === 'matched') && (
          <button
            onClick={() => setState('idle')}
            className="text-[#7C3AED] text-sm font-medium hover:text-[#A855F7] transition-colors min-h-[44px] px-6"
            style={{ animation: 'fadeInUp 0.4s ease-out' }}
          >
            {state === 'matched' ? 'Listen again' : 'Try again'}
          </button>
        )}

        {/* Or paste a link */}
        {state === 'idle' && (
          <div className="mt-8 w-full max-w-sm" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
            <div className="flex items-center gap-2 text-[#555] text-xs mb-3 justify-center">
              <div className="h-[1px] w-8 bg-[#333]" />
              <span>or paste a link</span>
              <div className="h-[1px] w-8 bg-[#333]" />
            </div>
            <div className="relative">
              <input
                type="url"
                placeholder="SoundCloud, YouTube, Spotify URL..."
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                ID
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </main>
  );
}
