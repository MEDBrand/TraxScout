'use client';

// Audio Identify Component
// Mic button + waveform + result display
// Built to Jony's mic-button-spec.md

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioIdentify } from '@/hooks/useAudioIdentify';

// Transient states auto-reset to idle after 2s
function useTransientReset(status: string, reset: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (status === 'found' || status === 'error' || status === 'not-found') {
      timerRef.current = setTimeout(() => {
        // Don't auto-reset found — user wants to see the result card
      }, 2000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status, reset]);
}

export function AudioIdentify() {
  const {
    status,
    result,
    elapsed,
    analyserData,
    startRecording,
    cancel,
    reset,
    isRecording,
    isIdentifying,
  } = useAudioIdentify({ recordDurationMs: 10000 });

  useTransientReset(status, reset);

  const seconds = Math.floor(elapsed / 1000);

  // Button background color per state
  const bgColor =
    status === 'found' ? '#22C55E' :
    status === 'error' ? '#EF4444' :
    isIdentifying ? '#5B21B6' :
    '#7C3AED';

  // Button shadow per state
  const shadow =
    status === 'found' ? '0 0 20px rgba(34, 197, 94, 0.4)' :
    status === 'error' ? '0 0 20px rgba(239, 68, 68, 0.4)' :
    isRecording ? '0 0 24px rgba(124, 58, 237, 0.5)' :
    isIdentifying ? '0 0 16px rgba(124, 58, 237, 0.3)' :
    '0 4px 16px rgba(124, 58, 237, 0.3)';

  // Aria label per state
  const ariaLabel =
    isRecording ? 'Listening for audio' :
    isIdentifying ? 'Identifying track' :
    'Identify track';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mic Button */}
      <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
        {/* 3-ring pulse animation while listening */}
        <AnimatePresence>
          {isRecording && [0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'rgba(124, 58, 237, 0.4)' }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            status === 'error'
              ? { x: [0, -4, 4, -4, 4, -4, 0] }
              : status === 'found'
              ? { scale: [1, 1.1, 1] }
              : {}
          }
          transition={
            status === 'error'
              ? { duration: 0.4 }
              : status === 'found'
              ? { duration: 0.3, type: 'spring', stiffness: 80, damping: 10 }
              : { duration: 0.15, ease: 'easeOut' }
          }
          onClick={isRecording ? cancel : isIdentifying ? undefined : startRecording}
          disabled={isIdentifying}
          className="relative w-16 h-16 rounded-full flex items-center justify-center transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{ backgroundColor: bgColor, boxShadow: shadow }}
          aria-label={ariaLabel}
          role="button"
        >
          <AnimatePresence mode="wait">
            {/* Idle / Listening: mic icon */}
            {(status === 'idle' || isRecording) && (
              <motion.svg
                key="mic"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="9" y="1" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
                <line x1="12" y1="17" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
              </motion.svg>
            )}

            {/* Processing: wave bars */}
            {isIdentifying && (
              <motion.div
                key="wave"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-[3px]"
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-white"
                    animate={{ height: [8, 18, 8] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    style={{ height: 8 }}
                  />
                ))}
              </motion.div>
            )}

            {/* Success: checkmark */}
            {status === 'found' && (
              <motion.svg
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 80, damping: 10 }}
                width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </motion.svg>
            )}

            {/* Error / Not found: X mark */}
            {(status === 'error' || status === 'not-found') && (
              <motion.svg
                key="x"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-center min-h-[1.5rem]"
        >
          {status === 'idle' && (
            <p className="text-[13px] text-[#A1A1AA]">Tap to identify a track</p>
          )}
          {isRecording && (
            <p className="text-[13px] text-[#A1A1AA]">Listening... {seconds}s</p>
          )}
          {isIdentifying && (
            <p className="text-[13px] text-[#A1A1AA]">Identifying...</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Waveform visualization */}
      <AnimatePresence>
        {isRecording && analyserData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 48 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-end justify-center gap-[2px] w-full max-w-xs overflow-hidden"
          >
            {Array.from(analyserData).slice(0, 48).map((val, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-[#7C3AED]"
                animate={{ height: Math.max(4, (val / 255) * 48) }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence mode="wait">
        {status === 'found' && result && result.found && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">{result.artist}</p>
                <p className="text-[#A1A1AA] text-sm">{result.title}</p>
              </div>
            </div>

            {(result.label || result.album) && (
              <div className="flex gap-4 text-sm text-[#71717A] mb-4">
                {result.label && <span>{result.label}</span>}
                {result.album && <span>{result.album}</span>}
              </div>
            )}

            {/* Location context */}
            {result.location && (
              <div className="flex items-center gap-2 text-xs text-[#71717A] mb-4 bg-white/5 rounded-lg px-3 py-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {result.location.venue
                    ? result.location.venue
                    : `${result.location.latitude.toFixed(4)}, ${result.location.longitude.toFixed(4)}`}
                  {result.location.identifiedAt && (
                    <> &middot; {new Date(result.location.identifiedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</>
                  )}
                </span>
              </div>
            )}

            {/* Also played by (Phase 2: 1001Tracklists data) */}
            {result.alsoPlayedBy && result.alsoPlayedBy.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-[#A1A1AA] mb-4 bg-white/5 rounded-lg px-3 py-2">
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Also played by {result.alsoPlayedBy.slice(0, 3).join(', ')}
                  {result.alsoPlayedBy.length > 3 && ` +${result.alsoPlayedBy.length - 3} more`}
                </span>
              </div>
            )}

            {/* Links */}
            {result.links && (
              <div className="flex flex-wrap gap-2">
                {result.links.spotify && (
                  <ExternalLink href={result.links.spotify} label="Spotify" color="#1DB954" />
                )}
                {result.links.appleMusic && (
                  <ExternalLink href={result.links.appleMusic} label="Apple Music" color="#FC3C44" />
                )}
                {result.links.youtube && (
                  <ExternalLink href={result.links.youtube} label="YouTube" color="#FF0000" />
                )}
                {result.links.beatport && (
                  <ExternalLink href={result.links.beatport} label="Beatport" color="#94D500" />
                )}
              </div>
            )}

            <button
              onClick={reset}
              className="w-full mt-4 text-center text-[#A1A1AA] hover:text-white text-sm py-2 transition-colors"
            >
              Identify another
            </button>
          </motion.div>
        )}

        {status === 'not-found' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 text-center"
          >
            <p className="font-semibold text-white mb-1">No match found</p>
            <p className="text-[#71717A] text-sm mb-4">
              Try recording a clearer snippet with more of the track playing.
            </p>
            <button
              onClick={reset}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-sm bg-[#0A0A0A] border border-[#EF4444]/20 rounded-2xl p-6 text-center"
          >
            <p className="text-[#EF4444] font-semibold mb-2">Something went wrong</p>
            <p className="text-[#71717A] text-sm mb-4">
              Make sure you allowed microphone access.
            </p>
            <button
              onClick={reset}
              className="bg-[#141414] hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExternalLink({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px]"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {label}
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
