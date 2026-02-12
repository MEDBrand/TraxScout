'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';
import type { ScoredTrack } from '@/services/scoring';
import type { Source } from '@/types';

const GENRES = [
  'All',
  'Tech House',
  'Deep House',
  'Afro House',
  'Minimal / Deep Tech',
  'Melodic House & Techno',
  'House',
  'Techno',
];

const SOURCES = ['All', 'Beatport', 'Traxsource', 'Promo', 'Inflyte', 'Trackstack'];

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  beatport: { bg: 'bg-green-600/20', text: 'text-green-400' },
  traxsource: { bg: 'bg-blue-600/20', text: 'text-blue-400' },
  promo: { bg: 'bg-purple-600/20', text: 'text-purple-400' },
  inflyte: { bg: 'bg-orange-600/20', text: 'text-orange-400' },
  trackstack: { bg: 'bg-cyan-600/20', text: 'text-cyan-400' },
  trackscout: { bg: 'bg-violet-600/20', text: 'text-violet-400' },
};

interface TracksResponse {
  tracks: ScoredTrack[];
  sources: Record<string, { count: number; error?: string }>;
  availableSources: Array<{
    id: Source;
    name: string;
    status: string;
    authType: string;
    connected: boolean;
  }>;
  connectedSources: string[];
  tier: string;
  dailyLimit: number;
  scannedAt: string;
}

function DashboardContent() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';

  const [tracks, setTracks] = useState<ScoredTrack[]>([]);
  const [trackStatuses, setTrackStatuses] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(isWelcome);
  const [dailyLimit, setDailyLimit] = useState(20);
  const [disconnectedSources, setDisconnectedSources] = useState<Array<{ id: string; name: string }>>([]);

  // Filters
  const [genreFilter, setGenreFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [bpmMin, setBpmMin] = useState(100);
  const [bpmMax, setBpmMax] = useState(140);
  const [keyFilter, setKeyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadTracks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      if (genreFilter !== 'All') params.set('genres', genreFilter);
      if (bpmMin !== 100) params.set('bpmMin', String(bpmMin));
      if (bpmMax !== 140) params.set('bpmMax', String(bpmMax));

      const res = await fetch(`/api/tracks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Failed to load tracks (${res.status})`);
      }

      const data: TracksResponse = await res.json();
      setTracks(data.tracks);
      setDailyLimit(data.dailyLimit);

      // Find sources user could connect but hasn't
      const unconnected = (data.availableSources || [])
        .filter(s => !s.connected && s.status === 'active')
        .map(s => ({ id: s.id, name: s.name }));
      setDisconnectedSources(unconnected);

      // Load existing statuses from user_tracks
      const { data: userTracks } = await supabase
        .from('user_tracks')
        .select('track_id, status')
        .eq('user_id', user.id);

      if (userTracks) {
        const statusMap: Record<string, string> = {};
        userTracks.forEach((ut: { track_id: string; status: string }) => {
          statusMap[ut.track_id] = ut.status;
        });
        setTrackStatuses(statusMap);
      }
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [user, genreFilter, bpmMin, bpmMax, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadTracks();
    }
  }, [user, authLoading, router, loadTracks]);

  const filteredTracks = tracks.filter(track => {
    if (sourceFilter !== 'All' && track.source.toLowerCase() !== sourceFilter.toLowerCase()) return false;
    if (keyFilter && track.key && !track.key.toLowerCase().includes(keyFilter.toLowerCase())) return false;
    return true;
  });

  const handleTrackAction = async (trackId: string, action: 'saved' | 'skipped') => {
    // Optimistic update
    setTrackStatuses(prev => ({ ...prev, [trackId]: action }));

    if (user) {
      await supabase
        .from('user_tracks')
        .upsert({
          user_id: user.id,
          track_id: trackId,
          status: action,
        });

      // If saving, also add to crate
      if (action === 'saved') {
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          await supabase
            .from('crates')
            .upsert({
              user_id: user.id,
              track_id: trackId,
              track_data: track,
            });
        }
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getStatus = (trackId: string) => trackStatuses[trackId] || 'new';

  const stats = {
    total: tracks.length,
    saved: Object.values(trackStatuses).filter(s => s === 'saved').length,
    new: tracks.filter(t => getStatus(t.id) === 'new').length,
    limit: dailyLimit,
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#A1A1AA]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] rounded-xl p-8 max-w-md w-full border border-[#7C3AED]">
            <div className="text-center">
              <div className="text-5xl mb-4">&#x1F3B5;</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to TRAXSCOUT!</h2>
              <p className="text-[#A1A1AA] mb-6">
                Your 7-day free trial has started. We&apos;re already scanning for tracks that match your taste.
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] py-3 rounded-lg font-semibold transition"
              >
                Let&apos;s Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/5 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-[#7C3AED]">
            TRAXSCOUT
          </Link>
          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-sm text-[#A1A1AA]">
                {profile.tier === 'pro' ? (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded text-xs font-medium">PRO</span>
                ) : profile.tier === 'basic' ? (
                  <span className="bg-[#141414] text-[#D4D4D8] px-2 py-1 rounded text-xs font-medium">BASIC</span>
                ) : null}
              </span>
            )}
            <Link href="/settings" className="text-[#A1A1AA] hover:text-white transition">
              Settings
            </Link>
            <button onClick={handleSignOut} className="text-[#A1A1AA] hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Connect Sources Banner */}
        {disconnectedSources.length > 0 && (
          <div className="mb-4 bg-[#0A0A0A] rounded-xl p-4 border border-[#7C3AED]/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-sm text-[#A1A1AA]">
                  Connect {disconnectedSources.map(s => s.name).join(', ')} to get more personalized picks
                </span>
              </div>
              <Link
                href="/settings#connections"
                className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium transition"
              >
                Connect accounts →
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/10">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-[#A1A1AA] text-sm">Today&apos;s picks ({stats.limit} max)</div>
          </div>
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/10">
            <div className="text-3xl font-bold text-[#F59E0B]">{stats.new}</div>
            <div className="text-[#A1A1AA] text-sm">New</div>
          </div>
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/10">
            <div className="text-3xl font-bold text-green-400">{stats.saved}</div>
            <div className="text-[#A1A1AA] text-sm">Saved</div>
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition"
          >
            <span>&#x1F50D;</span>
            <span>Filters</span>
            <span className="text-xs">{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-[#0A0A0A] rounded-xl p-4 mb-6 border border-white/10">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">Genre</label>
                <select
                  value={genreFilter}
                  onChange={e => setGenreFilter(e.target.value)}
                  className="w-full p-2 rounded bg-[#141414] border border-white/10 text-white"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">Source</label>
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="w-full p-2 rounded bg-[#141414] border border-white/10 text-white"
                >
                  {SOURCES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">BPM Range</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={bpmMin}
                    onChange={e => setBpmMin(Number(e.target.value))}
                    className="w-20 p-2 rounded bg-[#141414] border border-white/10 text-white"
                  />
                  <span className="text-[#A1A1AA]">-</span>
                  <input
                    type="number"
                    value={bpmMax}
                    onChange={e => setBpmMax(Number(e.target.value))}
                    className="w-20 p-2 rounded bg-[#141414] border border-white/10 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-2">Key (Camelot)</label>
                <input
                  type="text"
                  placeholder="e.g. 5A"
                  value={keyFilter}
                  onChange={e => setKeyFilter(e.target.value)}
                  className="w-full p-2 rounded bg-[#141414] border border-white/10 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadTracks}
              className="mt-2 text-sm text-white underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Track List */}
        <div className="bg-[#0A0A0A] rounded-xl overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold">Today&apos;s Picks</h2>
            <span className="text-sm text-[#A1A1AA]">
              {filteredTracks.length} tracks
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-[#A1A1AA] text-sm">Scanning your sources...</p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="p-8 text-center text-[#A1A1AA]">
              {tracks.length === 0 ? (
                <div>
                  <p className="mb-2">No tracks yet.</p>
                  <p className="text-sm">
                    <Link href="/settings#connections" className="text-[#7C3AED] hover:underline">
                      Connect your accounts
                    </Link>{' '}
                    to start getting personalized picks.
                  </p>
                </div>
              ) : (
                'No tracks match your filters. Try adjusting them.'
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredTracks.map(track => {
                const status = getStatus(track.id);
                const colors = SOURCE_COLORS[track.source] || SOURCE_COLORS.trackscout;
                return (
                  <div
                    key={track.id}
                    className={`p-4 hover:bg-[#141414] transition ${
                      status === 'skipped' ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Play Button */}
                      <button
                        onClick={() => setPlaying(playing === track.id ? null : track.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                          playing === track.id ? 'bg-[#7C3AED]' : 'bg-[#141414] hover:bg-white/10'
                        }`}
                      >
                        {playing === track.id ? '⏸' : '▶'}
                      </button>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {track.artist} - {track.title}
                        </div>
                        <div className="text-sm text-[#A1A1AA] truncate">
                          {track.label} · {track.genre}
                        </div>
                      </div>

                      {/* BPM & Key */}
                      <div className="text-right hidden sm:block">
                        <div className="font-mono text-sm">{track.bpm} BPM</div>
                        {track.key && <div className="text-sm text-[#A1A1AA]">{track.key}</div>}
                      </div>

                      {/* Source Badge */}
                      <div className={`px-2 py-1 rounded text-xs uppercase hidden md:block ${colors.bg} ${colors.text}`}>
                        {track.source}
                      </div>

                      {/* Score */}
                      <div className="hidden lg:block text-right w-12">
                        <div className={`text-sm font-bold ${
                          track.score >= 70 ? 'text-green-400' :
                          track.score >= 40 ? 'text-[#F59E0B]' :
                          'text-[#A1A1AA]'
                        }`}>
                          {track.score}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {track.storeUrl && (
                          <a
                            href={track.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] rounded text-sm font-medium transition"
                          >
                            Buy
                          </a>
                        )}
                        <button
                          onClick={() => handleTrackAction(track.id, 'saved')}
                          className={`p-2 rounded transition ${
                            status === 'saved'
                              ? 'bg-green-600/20 text-green-400'
                              : 'hover:bg-white/10 text-[#A1A1AA]'
                          }`}
                          title="Save to crate"
                        >
                          &#x2665;
                        </button>
                        <button
                          onClick={() => handleTrackAction(track.id, 'skipped')}
                          className={`p-2 rounded transition ${
                            status === 'skipped'
                              ? 'bg-red-600/20 text-red-400'
                              : 'hover:bg-white/10 text-[#A1A1AA]'
                          }`}
                          title="Skip"
                        >
                          &#x2715;
                        </button>
                      </div>
                    </div>

                    {/* Transparency reason */}
                    {track.reason && (
                      <div className="mt-2 ml-14 text-xs text-[#71717A]">
                        ✨ {track.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pro Upsell */}
        {profile?.tier === 'basic' && (
          <div className="mt-6 bg-gradient-to-r from-[#7C3AED]/20 to-[#F59E0B]/20 rounded-xl p-6 border border-[#7C3AED]/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                <p className="text-[#A1A1AA] text-sm">
                  Get AI-powered curation and vibe matching
                </p>
              </div>
              <Link
                href="/settings#subscription"
                className="bg-[#F59E0B] hover:bg-[#d97706] px-4 py-2 rounded-lg font-semibold transition"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-[#A1A1AA]">Loading...</div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
