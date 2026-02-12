'use client';

// Inline audio preview — 30-second clips with waveform scrubbing
// Lazy loads: audio only fetches when the component scrolls into view
// Plays inline in the feed, no navigation required

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AudioPreviewProps {
  src: string; // Preview URL from Beatport/Traxsource embed
  trackId: string;
  onPlay?: (trackId: string) => void;
  onPause?: (trackId: string) => void;
}

export function AudioPreview({ src, trackId, onPlay, onPause }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Lazy load: only create audio element when scrolled into view
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [visible]);

  // Create audio element when visible
  useEffect(() => {
    if (!visible || !src) return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = src;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setLoaded(true);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      onPause?.(trackId);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, src]);

  // Progress tracking via RAF (smooth, not interval-based)
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime / audioRef.current.duration);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !loaded) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.(trackId);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.(trackId);
    }
  }, [isPlaying, loaded, trackId, onPlay, onPause]);

  // Waveform scrubbing
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current || !loaded) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct);
  }, [loaded]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div ref={containerRef} className="flex items-center gap-2 w-full">
      {/* Play/Pause button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        disabled={!loaded}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isPlaying
            ? 'bg-[#7C3AED] text-white'
            : loaded
            ? 'bg-[#141414] text-[#A1A1AA] hover:text-white hover:bg-white/10'
            : 'bg-[#141414] text-[#52525B]'
        }`}
        aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
      >
        {isPlaying ? (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.button>

      {/* Waveform / progress bar */}
      <div
        ref={progressBarRef}
        className="flex-1 h-8 relative cursor-pointer touch-manipulation"
        onClick={handleScrub}
        onTouchMove={handleScrub}
        role="slider"
        aria-label="Audio preview progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        {/* Background */}
        <div className="absolute inset-0 flex items-end gap-[1px] px-0.5">
          {Array.from({ length: 40 }).map((_, i) => {
            // Generate a pseudo-random waveform shape (deterministic per track)
            const hash = (trackId.charCodeAt(i % trackId.length) * (i + 1)) % 100;
            const height = 20 + (hash / 100) * 80; // 20% to 100% height
            const filled = i / 40 <= progress;

            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-colors duration-75"
                style={{
                  height: `${height}%`,
                  backgroundColor: filled ? '#7C3AED' : 'rgba(255,255,255,0.08)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Time */}
      {loaded && (
        <span className="text-[10px] text-[#71717A] tabular-nums shrink-0 w-8 text-right">
          {isPlaying
            ? formatTime(progress * duration)
            : formatTime(duration)
          }
        </span>
      )}
    </div>
  );
}
