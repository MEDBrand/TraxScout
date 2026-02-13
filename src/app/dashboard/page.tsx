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
  soundcloud: '#FF5500',
  bandcamp: '#1DA0C3',
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
      <main className="min-h-screen bg-black text-white pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="skeleton h-3 w-24 mb-2" />
          <div className="skeleton h-8 w-40 mb-6" />
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[0,1,2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
          <div className="skeleton h-10 w-56 rounded-xl mb-5" />
          <div className="space-y-2">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[14px]" style={{ background: 'rgba(255,255,255,0.015)', border: '0.5px solid rgba(255,255,255,0.04)' }}>
                <div className="skeleton skel-art flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton skel-text-lg" />
                  <div className="skeleton skel-text-sm" />
                </div>
                <div className="skeleton skel-tag" />
                <div className="skeleton skel-circle" />
              </div>
            ))}
          </div>
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
    <main className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative">
        {/* Ambient Purple Glow — #2 */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)' }} />

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

        {/* Connect Banner — Glassmorphism (#3) */}
        <div className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
          <div>
            <span className="text-sm text-[#A1A1AA]">Connect </span>
            <span className="text-sm text-white font-medium">Beatport, Traxsource</span>
            <span className="text-sm text-[#A1A1AA]"> to get more personalized picks</span>
          </div>
          <Link href="/settings" className="text-sm text-[#7C3AED] font-medium hover:underline whitespace-nowrap">
            Connect accounts →
          </Link>
        </div>

        {/* Stats — Glassmorphism + accent glow (#6) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: todayCount, label: "Today\u2019s picks (20 max)", color: '#FFFFFF' },
            { value: newCount, label: 'New', color: '#F59E0B' },
            { value: savedCount, label: 'Saved', color: savedCount === 0 ? '#6B6B6B' : '#F59E0B' },
          ].map((stat, i) => (
            <div key={i} className="relative rounded-2xl p-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 left-[20%] right-[20%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-[#71717A] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
            {(['all', 'new', 'saved'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); navigator?.vibrate?.(10); }}
                className={`press px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  activeTab === tab
                    ? 'text-[#A78BFA]'
                    : 'text-[#71717A] hover:text-white'
                }`}
                style={activeTab === tab ? { background: 'rgba(124,58,237,0.2)' } : undefined}
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
          <div className="rounded-2xl p-16 text-center mt-4" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
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
    <div
      className="group rounded-[14px] px-4 py-3 flex items-center gap-3 transition-all active:shadow-[inset_0_0_20px_rgba(124,58,237,0.08)]"
      style={{
        background: playing ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
        border: playing ? '0.5px solid rgba(124,58,237,0.3)' : '0.5px solid rgba(255,255,255,0.04)',
      }}
    >
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
        onClick={() => { onToggleSave(); navigator?.vibrate?.(25); }}
        className={`flex-shrink-0 p-2 rounded-lg transition-all press ${
          saved ? 'text-[#F59E0B]' : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/5'
        }`}
        aria-label={saved ? 'Unsave' : 'Save'}
      >
        <svg className={`w-5 h-5 ${saved ? 'heart-pop' : ''}`} fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={saved ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>
    </div>
  );
}
