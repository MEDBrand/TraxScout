'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

interface IdentifiedTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork_url?: string;
  store_url?: string;
  identified_at: string;
  source?: string;
}

export default function CratePage() {
  const [tab, setTab] = useState<'saved' | 'identified'>('saved');
  const [identified, setIdentified] = useState<IdentifiedTrack[]>([]);

  useEffect(() => {
    // Load identified tracks from localStorage (until we wire Supabase)
    try {
      const stored = localStorage.getItem('traxscout_identified');
      if (stored) setIdentified(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-12">
        <h1 className="text-2xl font-bold mb-6">Your Crate</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#141414] rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
              tab === 'saved'
                ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setTab('identified')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
              tab === 'identified'
                ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            Identified
            {identified.length > 0 && (
              <span className="ml-1.5 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                {identified.length}
              </span>
            )}
          </button>
        </div>

        {/* Saved tab */}
        {tab === 'saved' && (
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-lg font-semibold mb-2">Nothing saved yet</h2>
            <p className="text-[#71717A] text-sm mb-6">
              Heart a track from your daily picks and it shows up here.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors min-h-[44px]"
            >
              Browse Picks
            </Link>
          </div>
        )}

        {/* Identified tab */}
        {tab === 'identified' && (
          <>
            {identified.length === 0 ? (
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">🎙️</div>
                <h2 className="text-lg font-semibold mb-2">No tracks identified yet</h2>
                <p className="text-[#71717A] text-sm mb-6">
                  Use Audio ID to identify tracks at clubs, in mixes, or from your phone. They&apos;ll show up here.
                </p>
                <Link
                  href="/audio-id"
                  className="inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors min-h-[44px]"
                >
                  Try Audio ID
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {identified.map((track) => (
                  <div
                    key={track.id}
                    className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-4 hover:border-[#7C3AED]/30 transition-colors"
                  >
                    {/* Artwork */}
                    <div className="w-12 h-12 rounded-lg bg-[#2A2A2A] flex-shrink-0 overflow-hidden">
                      {track.artwork_url ? (
                        <img src={track.artwork_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                      <p className="text-xs text-[#A1A1AA] truncate">{track.artist}</p>
                      <p className="text-[10px] text-[#555] mt-0.5">
                        {new Date(track.identified_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {track.store_url && (
                        <a
                          href={track.store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Buy track"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                          </svg>
                        </a>
                      )}
                      <button
                        className="p-2 rounded-lg text-[#71717A] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Save to library"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <BottomTabBar />
    </main>
  );
}
