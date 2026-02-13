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
}

interface UserInfo {
  user: { id: string; email: string } | null;
  profile: { tier: string } | null;
}

type Tab = 'all' | 'new' | 'saved';

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [genreFilter, setGenreFilter] = useState('');

  // Fetch user info
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Session expired. Please log in again.');
    }, 8000);

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.user) {
          setUserInfo(data);
        } else {
          setError('Not logged in');
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setError('Could not load your session');
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  // Fetch tracks + saved crate
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
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (was) next.delete(trackId);
      else next.add(trackId);
      return next;
    });

    try {
      await fetch('/api/crate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
    } catch {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev);
        if (was) next.add(trackId);
        else next.delete(trackId);
        return next;
      });
    }
  }, [savedIds]);

  // Derive genres for filter dropdown
  const allGenres = [...new Set(tracks.map(t => t.genre).filter(Boolean))] as string[];

  // Filter tracks
  const filtered = tracks.filter(t => {
    if (genreFilter && t.genre !== genreFilter) return false;
    if (activeTab === 'saved' && !savedIds.has(t.id)) return false;
    // 'new' = last 24h (score-based heuristic — tracks with no save)
    if (activeTab === 'new' && savedIds.has(t.id)) return false;
    return true;
  });

  // Stats
  const todayCount = tracks.length;
  const newCount = tracks.filter(t => !savedIds.has(t.id)).length;
  const savedCount = savedIds.size;

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#A1A1AA]">Loading dashboard...</div>
      </main>
    );
  }

  if (error || !userInfo?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#A1A1AA] mb-4">{error || 'Please log in'}</p>
          <Link
            href="/login"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] px-6 py-3 rounded-lg font-semibold transition inline-block"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            TRAXSCOUT
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#A1A1AA]">{userInfo.user.email}</span>
            <Link href="/settings" className="text-sm text-[#A1A1AA] hover:text-white transition">
              Settings
            </Link>
            <a href="/api/auth/logout" className="text-sm text-[#A1A1AA] hover:text-white transition">
              Logout
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="flex gap-6 mb-8">
          <StatBadge label="Today's Picks" value={todayCount} />
          <StatBadge label="New" value={newCount} color="#7C3AED" />
          <StatBadge label="Saved" value={savedCount} color="#F59E0B" />
        </div>

        {/* Tier Badge */}
        <div className="inline-block bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full px-4 py-1 text-sm text-[#7C3AED] mb-6">
          {userInfo.profile?.tier || 'Free'} Plan
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Tabs */}
          <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-white/10">
            {(['all', 'new', 'saved'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize ${
                  activeTab === tab
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Genre dropdown */}
          <select
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer"
          >
            <option value="">All Genres</option>
            {allGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Track Feed */}
        {tracksLoading ? (
          <div className="text-center py-20 text-[#A1A1AA]">Loading tracks...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🎵</div>
            <h2 className="text-xl font-semibold mb-2">No tracks yet</h2>
            <p className="text-[#A1A1AA] mb-6 max-w-md mx-auto">
              {activeTab === 'saved'
                ? 'Save tracks by tapping the heart icon.'
                : 'Connect your accounts in Settings to start getting curated picks.'}
            </p>
            {activeTab !== 'saved' && (
              <Link
                href="/settings"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] px-6 py-3 rounded-lg font-semibold transition inline-block"
              >
                Connect Accounts
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                saved={savedIds.has(track.id)}
                onToggleSave={() => toggleSave(track.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Sub-components ── */

function StatBadge({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3">
      <div className="text-2xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="text-xs text-[#71717A]">{label}</div>
    </div>
  );
}

function TrackCard({
  track,
  saved,
  onToggleSave,
}: {
  track: Track;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="bg-[#0A0A0A] hover:bg-[#141414] border border-white/10 rounded-xl p-4 flex items-center gap-4 transition group">
      {/* Score badge */}
      {track.score != null && (
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[#7C3AED]">{track.score}</span>
        </div>
      )}

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{track.artist}</div>
        <div className="text-[#A1A1AA] text-sm truncate">{track.title}</div>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {track.label && (
            <span className="text-xs text-[#71717A] bg-white/5 rounded px-2 py-0.5">{track.label}</span>
          )}
          {track.genre && (
            <span className="text-xs text-[#7C3AED] bg-[#7C3AED]/10 rounded px-2 py-0.5">{track.genre}</span>
          )}
          {track.bpm && (
            <span className="text-xs text-[#71717A]">{track.bpm} BPM</span>
          )}
          {track.source && (
            <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 rounded px-2 py-0.5">{track.source}</span>
          )}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={onToggleSave}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition"
        aria-label={saved ? 'Unsave track' : 'Save track'}
      >
        <svg
          className={`w-6 h-6 transition ${saved ? 'text-[#F59E0B]' : 'text-[#71717A] group-hover:text-[#A1A1AA]'}`}
          fill={saved ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={saved ? 0 : 1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>
    </div>
  );
}
