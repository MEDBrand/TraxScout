'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import BottomTabBar from '@/components/BottomTabBar';

const GENRES = [
  'Tech House', 'Deep House', 'Afro House', 'Minimal / Deep Tech',
  'Melodic House & Techno', 'House', 'Techno', 'Progressive House',
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Beatport: (
    <svg viewBox="0 0 24 24" fill="#94FC13" className="w-8 h-8 flex-shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 15h-7v-2h7v2zm1-4h-9v-2h9v2zm-2-4H9.5V7h5v2z" />
    </svg>
  ),
  Traxsource: (
    <svg viewBox="0 0 24 24" fill="#4A90D9" className="w-8 h-8 flex-shrink-0">
      <circle cx="12" cy="12" r="10" fillOpacity="0.2" />
      <path d="M6 9h12v2h-5v8h-2v-8H6V9z" fill="#4A90D9" />
    </svg>
  ),
  Bandcamp: (
    <svg viewBox="0 0 24 24" fill="#1DA0C3" className="w-8 h-8 flex-shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13H7l2.5-6h7.5L17 15z" />
    </svg>
  ),
  SoundCloud: (
    <svg viewBox="0 0 24 24" fill="#FF5500" className="w-8 h-8 flex-shrink-0">
      <path d="M17.5 7c-2.3 0-4.3 1.4-5.2 3.4-.3 0-.6-.1-.9-.1-3 0-5.5 2.5-5.5 5.5S8.5 21.3 11.5 21.3h6c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5c0-2.9-2.3-5.3-5.3-5.3z" />
    </svg>
  ),
  Inflyte: (
    <svg viewBox="0 0 24 24" fill="#9B59B6" className="w-8 h-8 flex-shrink-0">
      <path d="M2 12l20-9-9 20-2-8-9-3z" />
    </svg>
  ),
  Trackstack: (
    <svg viewBox="0 0 24 24" fill="#00D4AA" className="w-8 h-8 flex-shrink-0">
      <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 11l-2.5-1.25L12 11zm0 2.5l5.5-2.75 2.5-1.25L20 9.5l-8 4-8-4 0 0 2.5 1.25 5.5 2.75z" />
    </svg>
  ),
  'Promo Box': (
    <svg viewBox="0 0 24 24" fill="#F97316" className="w-8 h-8 flex-shrink-0">
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z" />
    </svg>
  ),
  'Label Worx': (
    <svg viewBox="0 0 24 24" fill="#EF4444" className="w-8 h-8 flex-shrink-0">
      <circle cx="12" cy="12" r="10" fillOpacity="0.2" />
      <path d="M7 7h2v8h4v2H7V7zm6 0h2l3 8h-2.2l-.6-2h-2.4l-.6 2H10l3-8z" />
    </svg>
  ),
};

interface UserInfo {
  user: { id: string; email: string } | null;
  profile: { tier: string; subscriptionStatus: string } | null;
}

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Tech House', 'Deep House']);
  const [bpmMin, setBpmMin] = useState(122);
  const [bpmMax, setBpmMax] = useState(128);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);
        setUserInfo(data);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => clearTimeout(timeout);
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#A1A1AA]">Loading settings...</div>
      </main>
    );
  }

  if (!userInfo?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#A1A1AA] mb-4">Please log in to access settings</p>
          <Link href="/login" className="bg-[#7C3AED] hover:bg-[#6D28D9] px-6 py-3 rounded-lg font-semibold transition inline-block">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const tier = userInfo.profile?.tier || 'free';
  const isPro = tier === 'pro' || tier === 'elite';

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-[#A1A1AA] hover:text-white transition">← TRAXSCOUT</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Subscription */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="capitalize font-medium">{tier}</span>
            </div>
            <div className="text-[#F59E0B] text-xl font-bold">
              {tier === 'free' ? '$0' : tier === 'basic' ? '$19.88' : tier === 'pro' ? '$38.88' : '$68.88'}/mo
            </div>
          </div>
          {tier === 'free' && (
            <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg p-3 text-sm text-[#A1A1AA]">
              Upgrade to Pro to connect Beatport, Traxsource, and promo pools.
            </div>
          )}
        </section>

        {/* Connected Accounts */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Connected Accounts</h2>
          <p className="text-[#A1A1AA] text-sm mb-4">Link your accounts to see everything in one place.</p>
          
          {[
            { name: 'Beatport', color: '#94FC13', desc: 'Your Beatport purchases, charts, and wishlist.', tier: 'basic' },
            { name: 'Traxsource', color: '#4A90D9', desc: 'Your Traxsource purchases, crate, and download queue.', tier: 'basic' },
            { name: 'Bandcamp', color: '#1DA0C3', desc: 'Your Bandcamp collection, wishlist, and followed artists.', tier: 'basic' },
            { name: 'SoundCloud', color: '#FF5500', desc: 'Your SoundCloud likes, reposts, and followed artists.', tier: 'basic' },
            { name: 'Inflyte', color: '#9B59B6', desc: 'Your promo pool inbox. Unreleased tracks from labels.', tier: 'pro' },
            { name: 'Trackstack', color: '#00D4AA', desc: 'Your Flow inbox. Demos and promos from producers.', tier: 'pro' },
            { name: 'Promo Box', color: '#F97316', desc: 'Your promo pool deliveries from labels and distributors.', tier: 'pro' },
            { name: 'Label Worx', color: '#EF4444', desc: 'Your Label Worx promo pool and pre-release tracks.', tier: 'pro' },
          ].map(platform => (
            <div key={platform.name} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-4">
                {PLATFORM_ICONS[platform.name] || <div className="w-8 h-8 rounded-full" style={{ backgroundColor: platform.color }} />}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{platform.name}</span>
                    {platform.tier === 'pro' && !isPro && <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">PRO</span>}
                  </div>
                  <p className="text-[#A1A1AA] text-xs mt-0.5">{platform.desc}</p>
                </div>
              </div>
              <button
                disabled={platform.tier === 'pro' && !isPro}
                className={`text-sm px-4 py-1.5 rounded-lg transition ${
                  platform.tier === 'basic' || isPro
                    ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                    : 'text-[#A1A1AA] cursor-not-allowed bg-white/5'
                }`}
              >
                {platform.tier === 'basic' || isPro ? 'Connect' : 'Upgrade'}
              </button>
            </div>
          ))}
        </section>

        {/* Genres */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  selectedGenres.includes(genre)
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-white/10 text-[#A1A1AA] hover:bg-white/20'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* BPM Range */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">BPM Range</h2>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={bpmMin}
              onChange={e => setBpmMin(Number(e.target.value))}
              className="w-20 p-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
            />
            <span className="text-[#A1A1AA]">to</span>
            <input
              type="number"
              value={bpmMax}
              onChange={e => setBpmMax(Number(e.target.value))}
              className="w-20 p-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
            />
            <span className="text-[#A1A1AA]">BPM</span>
          </div>
        </section>

        {/* Account */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <p className="text-[#A1A1AA] text-sm">{userInfo.user.email}</p>
          <a
            href="/api/auth/logout"
            className="mt-4 inline-block text-sm text-red-400 hover:text-red-300 transition"
          >
            Sign out
          </a>
        </section>
      </div>
      <BottomTabBar />
    </main>
  );
}
