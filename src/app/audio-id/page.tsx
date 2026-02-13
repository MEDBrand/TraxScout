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
      // Auto-timeout after 15s
      const timeout = setTimeout(() => {
        setState('error');
      }, 15000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearTimeout(timeout);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [state]);

  const handleTap = () => {
    if (state === 'listening') {
      setState('idle');
    } else {
      setState('listening');
    }
  };

  const stateText: Record<State, { title: string; sub: string }> = {
    idle: { title: 'Tap to identify', sub: 'Hold your phone up to the speaker.' },
    listening: { title: 'Listening...', sub: `${seconds}s — hold steady` },
    matched: { title: 'Track found!', sub: 'We got it.' },
    error: { title: 'No match found', sub: 'Try again in a quieter spot or hold closer.' },
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <style>{`
        @keyframes ripple1 {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes ripple2 {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        @keyframes ripple3 {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(124,58,237,0.3); }
          50% { transform: scale(1.08); box-shadow: 0 0 60px rgba(124,58,237,0.5); }
        }
        @keyframes waveBar {
          0%, 100% { height: 8px; }
          50% { height: var(--max-h); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid rgba(124,58,237,0.3);
          pointer-events: none;
        }
        .listening .ring-1 { animation: ripple1 2s ease-out infinite; }
        .listening .ring-2 { animation: ripple2 2s ease-out 0.5s infinite; }
        .listening .ring-3 { animation: ripple3 2s ease-out 1s infinite; }
        .listening .mic-btn { animation: breathe 2s ease-in-out infinite; }
        .error-shake { animation: shake 0.5s ease-in-out; }
        .match-pop { animation: popIn 0.4s ease-out both; }
      `}</style>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-5">
        {/* Status text */}
        <div className="text-center mb-12">
          <h1 className={`text-2xl font-bold mb-2 transition-all duration-300 ${
            state === 'error' ? 'text-red-400' : 
            state === 'matched' ? 'text-green-400' : 'text-white'
          }`}>
            {stateText[state].title}
          </h1>
          <p className="text-[#71717A] text-sm">{stateText[state].sub}</p>
        </div>

        {/* Mic button with rings */}
        <div className={`relative flex items-center justify-center ${state === 'listening' ? 'listening' : ''} ${state === 'error' ? 'error-shake' : ''}`}>
          {/* Pulse rings */}
          <div className="ring ring-1" style={{ width: 160, height: 160, top: -40, left: -40 }} />
          <div className="ring ring-2" style={{ width: 160, height: 160, top: -40, left: -40 }} />
          <div className="ring ring-3" style={{ width: 160, height: 160, top: -40, left: -40 }} />

          <button
            onClick={handleTap}
            className={`mic-btn relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              state === 'listening' 
                ? 'bg-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.4)]' 
                : state === 'error'
                ? 'bg-red-500/20 border-2 border-red-500'
                : state === 'matched'
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/20'
            }`}
            aria-label={state === 'listening' ? 'Stop listening' : 'Start listening'}
          >
            {state === 'matched' ? (
              <svg className="w-8 h-8 text-green-400 match-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : state === 'error' ? (
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Waveform visualizer (listening state) */}
        {state === 'listening' && (
          <div className="flex items-center gap-1 mt-10 h-10">
            {[20, 32, 16, 28, 36, 24, 32, 20, 28, 16, 36, 24, 20, 32, 28].map((h, i) => (
              <div
                key={i}
                className="w-[3px] bg-[#7C3AED] rounded-full"
                style={{
                  // @ts-expect-error css custom property
                  '--max-h': `${h}px`,
                  height: '8px',
                  animation: `waveBar ${0.4 + Math.random() * 0.4}s ease-in-out ${i * 0.05}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Reset button for error/matched states */}
        {(state === 'error' || state === 'matched') && (
          <button
            onClick={() => setState('idle')}
            className="mt-8 text-[#A1A1AA] text-sm underline underline-offset-4 hover:text-white transition-colors min-h-[44px]"
          >
            Try again
          </button>
        )}

        <p className="text-[#555] text-xs mt-8">Powered by ACRCloud</p>
      </div>
      <BottomTabBar />
    </main>
  );
}
