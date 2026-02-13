'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Track {
  id: string;
  artist: string;
  title: string;
  label?: string;
  genre?: string;
  bpm?: number;
  source?: string;
  score?: number;
  key?: string;
  store_url?: string;
  artwork_url?: string;
  preview_embed_url?: string;
  audio_id?: boolean;
}

interface UserInfo {
  user: { id: string; email: string } | null;
  profile: { tier: string } | null;
}

type Tab = 'all' | 'new' | 'saved';

const SOURCE_COLORS: Record<string, string> = {
  beatport: '#94FC13',
  traxsource: '#4A90D9',
  inflyte: '#9B59B6',
  'promo-box': '#F97316',
  'label-worx': '#EF4444',
  trackstack: '#00D4AA',
  trackscout: '#7C3AED',
};

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [genreFilter, setGenreFilter] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Session expired. Please log in again.');
    }, 8000);

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.user) setUserInfo(data);
        else setError('Not logged in');
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setError('Could not load your session');
        setLoading(false);
      });
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!userInfo?.user) return;
    setTracksLoading(true);
    Promise.all([
      fetch('/api/tracks').then(r => r.json()),
      fetch('/api/crate').then(r => r.json()),
    ])
      .then(([trackData, crateData]) => {
        setTracks(trackData.tracks || []);
        const ids = new Set<string>((crateData.tracks || []).map((t: { trackId?: string; id?: string }) => t.trackId || t.id));
        setSavedIds(ids);
      })
      .catch(() => setTracks([]))
      .finally(() => setTracksLoading(false));
  }, [userInfo]);

  const toggleSave = useCallback(async (trackId: string) => {
    const was = savedIds.has(trackId);
    setSavedIds(prev => {
      const next = new Set(prev);
      if (was) next.delete(trackId); else next.add(trackId);
      return next;
    });
    try {
      await fetch('/api/crate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
    } catch {
      setSavedIds(prev => {
        const next = new Set(prev);
        if (was) next.add(trackId); else next.delete(trackId);
        return next;
      });
    }
  }, [savedIds]);

  const allGenres = [...new Set(tracks.map(t => t.genre).filter(Boolean))] as string[];

  const filtered = tracks.filter(t => {
    if (genreFilter && t.genre !== genreFilter) return false;
    if (activeTab === 'saved' && !savedIds.has(t.id)) return false;
    if (activeTab === 'new' && savedIds.has(t.id)) return false;
    return true;
  });

  const todayCount = tracks.length;
  const newCount = tracks.filter(t => !savedIds.has(t.id)).length;
  const savedCount = savedIds.size;

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#71717A] text-sm">Loading your picks...</p>
        </div>
      </main>
    );
  }

  if (error || !userInfo?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-xl font-bold mb-2">Session expired</h1>
          <p className="text-[#71717A] mb-6">{error || 'Please log in to continue'}</p>
          <Link href="/login" className="bg-[#7C3AED] hover:bg-[#6D28D9] px-8 py-3 rounded-xl font-semibold transition inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.04] bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-[#7C3AED]">
            TRAXSCOUT
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-sm text-[#71717A] hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5">
              Settings
            </Link>
            <a href="/api/auth/logout" className="text-sm text-[#71717A] hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5">
              Logout
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative">
        {/* Ambient Purple Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

        {/* Hero Greeting */}
        <div className="relative mb-6">
          <p className="text-xs font-medium tracking-[0.2em] text-[#71717A] mb-1">
            {new Date().getHours() < 12 ? 'GOOD MORNING' : new Date().getHours() < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING'}
          </p>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Your </span>
            <span className="text-[#7C3AED]">Drop</span>
          </h1>
        </div>

        {/* Connect Banner — Glassmorphism */}
        <div className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div>
            <span className="text-sm text-[#A1A1AA]">Connect </span>
            <span className="text-sm text-white font-medium">Beatport, Traxsource</span>
            <span className="text-sm text-[#A1A1AA]"> to get more personalized picks</span>
          </div>
          <Link href="/settings" className="text-sm text-[#7C3AED] font-medium hover:underline whitespace-nowrap">
            Connect accounts →
          </Link>
        </div>

        {/* Stats — Glassmorphism */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="text-3xl font-bold">{todayCount}</div>
            <div className="text-xs text-[#71717A] mt-1">Today&apos;s picks (20 max)</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="text-3xl font-bold text-[#7C3AED]">{newCount}</div>
            <div className="text-xs text-[#71717A] mt-1">New</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="text-3xl font-bold text-[#F59E0B]">{savedCount}</div>
            <div className="text-xs text-[#71717A] mt-1">Saved</div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex bg-[#0A0A0A] rounded-xl p-1 border border-white/[0.06]">
            {(['all', 'new', 'saved'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  activeTab === tab
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {allGenres.length > 1 && (
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer focus:outline-none focus:border-[#7C3AED]/50"
            >
              <option value="">All Genres</option>
              {allGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          <div className="ml-auto text-sm text-[#71717A]">
            {filtered.length} track{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Track Header */}
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs text-[#71717A] uppercase tracking-wider border-b border-white/[0.06] mb-1">
          <div>Track</div>
          <div className="w-20 text-center">BPM</div>
          <div className="w-20 text-center">Why</div>
          <div className="w-10" />
        </div>

        {/* Track Feed */}
        {tracksLoading ? (
          <div className="space-y-2 py-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#0A0A0A] rounded-xl h-20 animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-16 text-center mt-4">
            <div className="text-5xl mb-5">{activeTab === 'saved' ? '💛' : '🎵'}</div>
            <h2 className="text-lg font-semibold mb-2">
              {activeTab === 'saved' ? 'No saved tracks yet' : 'No tracks found'}
            </h2>
            <p className="text-[#71717A] text-sm max-w-md mx-auto">
              {activeTab === 'saved'
                ? 'Tap the heart on any track to save it to your crate.'
                : 'Connect your accounts in Settings to get personalized picks.'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i + 1}
                saved={savedIds.has(track.id)}
                playing={playingId === track.id}
                onToggleSave={() => toggleSave(track.id)}
                onTogglePlay={() => setPlayingId(prev => prev === track.id ? null : track.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Track Row ── */

function TrackRow({
  track,
  index,
  saved,
  playing,
  onToggleSave,
  onTogglePlay,
}: {
  track: Track;
  index: number;
  saved: boolean;
  playing: boolean;
  onToggleSave: () => void;
  onTogglePlay: () => void;
}) {
  const sourceColor = SOURCE_COLORS[(track.source || '').toLowerCase()] || '#7C3AED';

  return (
    <div className={`group rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
      playing ? 'bg-[#141414] border border-[#7C3AED]/30' : 'bg-[#0A0A0A] border border-white/[0.04] hover:bg-[#111] hover:border-white/[0.08]'
    }`}>
      {/* Play / Index */}
      <button
        onClick={onTogglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
      >
        {playing ? (
          <svg className="w-4 h-4 text-[#7C3AED]" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <span className="text-xs text-[#71717A] group-hover:hidden">{index}</span>
        )}
        <svg className="w-4 h-4 text-white hidden group-hover:block" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {/* Artwork */}
      {track.artwork_url ? (
        <img src={track.artwork_url} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-lg bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎵</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[15px] truncate">{track.artist}</span>
          <span className="text-[#71717A] hidden sm:inline">–</span>
          <span className="text-[#A1A1AA] text-[15px] truncate hidden sm:inline">{track.title}</span>
        </div>
        <div className="sm:hidden text-[#A1A1AA] text-sm truncate">{track.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {track.label && (
            <span className="text-xs text-[#71717A] truncate max-w-[140px]">{track.label}</span>
          )}
          {track.genre && (
            <span className="text-[10px] text-[#A1A1AA] bg-white/[0.06] rounded-full px-2 py-0.5">{track.genre}</span>
          )}
        </div>
      </div>

      {/* BPM */}
      {track.bpm && (
        <div className="hidden sm:flex flex-col items-center w-16 flex-shrink-0">
          <span className="text-sm font-medium">{track.bpm}</span>
          <span className="text-[10px] text-[#71717A]">BPM</span>
        </div>
      )}

      {/* Audio ID badge */}
      {track.audio_id && (
        <div className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 flex-shrink-0 bg-[#F59E0B]/10 text-[#F59E0B]">
          🎤 Audio ID
        </div>
      )}

      {/* Source badge */}
      <div
        className="hidden sm:block text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 flex-shrink-0"
        style={{ color: sourceColor, backgroundColor: `${sourceColor}15` }}
      >
        {track.source || 'traxscout'}
      </div>

      {/* Reason tag */}
      {track.source && (
        <div className="hidden sm:block text-[10px] rounded-full px-2.5 py-1 flex-shrink-0 bg-[#7C3AED]/10 text-[#7C3AED] font-medium whitespace-nowrap">
          {['inflyte', 'trackstack', 'promo-box', 'label-worx'].includes(track.source || '') ? 'From your promo pool' :
           track.genre?.toLowerCase().includes('tech house') ? 'Matches your vibe' :
           'New release'}
        </div>
      )}

      {/* Save */}
      <button
        onClick={onToggleSave}
        className={`flex-shrink-0 p-2 rounded-lg transition-all ${
          saved ? 'text-[#F59E0B]' : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/5'
        }`}
        aria-label={saved ? 'Unsave' : 'Save'}
      >
        <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={saved ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>
    </div>
  );
}
