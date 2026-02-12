'use client';

// Track Card — single track in the feed
// One-tap save (heart toggle), inline audio preview, source badge
// Designed for speed: no menus, no modals, everything inline

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AudioPreview } from './AudioPreview';
import { haptic } from '@/lib/haptics';

interface Track {
  id: string;
  artist: string;
  title: string;
  label: string;
  genre: string;
  bpm: number;
  key?: string;
  source: string;
  storeUrl?: string;
  previewEmbedUrl?: string;
  artworkUrl?: string;
  score?: number;
  reason?: string;
}

interface TrackCardProps {
  track: Track;
  isSaved: boolean;
  onToggleSave: (trackId: string) => void;
  onPlay?: (trackId: string) => void;
  onPause?: (trackId: string) => void;
  isPlaying?: boolean;
}

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  beatport: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22C55E' },
  traxsource: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3B82F6' },
  inflyte: { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED' },
  trackstack: { bg: 'rgba(249, 115, 22, 0.12)', text: '#F97316' },
  trackscout: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B' },
  promo: { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED' },
};

export const TrackCard = memo(function TrackCard({
  track,
  isSaved,
  onToggleSave,
  onPlay,
  onPause,
}: TrackCardProps) {
  const sourceStyle = SOURCE_COLORS[track.source] || SOURCE_COLORS.promo;

  const handleSave = useCallback(() => {
    onToggleSave(track.id);
  }, [track.id, onToggleSave]);

  const handleBuy = useCallback(() => {
    haptic('light');
  }, []);

  return (
    <div className="p-4 hover:bg-white/[0.02] transition-colors">
      {/* Main row: info + actions */}
      <div className="flex items-start gap-3">
        {/* Artwork (if available) */}
        {track.artworkUrl && (
          <img
            src={track.artworkUrl}
            alt=""
            loading="lazy"
            className="w-12 h-12 rounded-lg object-cover bg-[#141414] shrink-0"
          />
        )}

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-sm">{track.artist}</p>
              <p className="text-[#A1A1AA] text-sm truncate">{track.title}</p>
            </div>

            {/* Save button — one tap, no menu */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
              className="shrink-0 p-2 -m-2 touch-manipulation"
              aria-label={isSaved ? 'Remove from crate' : 'Save to crate'}
            >
              {isSaved ? (
                <svg className="w-5 h-5 text-[#7C3AED]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#52525B] hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </motion.button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-[#71717A]">{track.label}</span>
            {track.bpm > 0 && (
              <span className="text-xs text-[#52525B] font-mono">{track.bpm}</span>
            )}
            {track.key && (
              <span className="text-xs text-[#52525B] font-mono">{track.key}</span>
            )}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase"
              style={{ backgroundColor: sourceStyle.bg, color: sourceStyle.text }}
            >
              {track.source}
            </span>
          </div>

          {/* Transparency badge — why this track surfaced */}
          {track.reason && (
            <p className="text-[11px] text-[#7C3AED]/70 mt-1.5">
              {track.reason}
            </p>
          )}
        </div>
      </div>

      {/* Inline audio preview */}
      {track.previewEmbedUrl && (
        <div className="mt-3 ml-0">
          <AudioPreview
            src={track.previewEmbedUrl}
            trackId={track.id}
            onPlay={onPlay}
            onPause={onPause}
          />
        </div>
      )}

      {/* Buy link */}
      {track.storeUrl && (
        <div className="mt-2">
          <a
            href={track.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBuy}
            className="inline-flex items-center gap-1 text-xs text-[#7C3AED] hover:text-[#8B5CF6] transition-colors"
          >
            Buy on {track.source === 'beatport' ? 'Beatport' : track.source === 'traxsource' ? 'Traxsource' : 'store'}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
});
