'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserInfo {
  user: { id: string; email: string } | null;
  profile: { tier: string } | null;
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          </div>
        </div>
      </nav>

      {/* Welcome */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-[#A1A1AA] mb-8">
          Welcome to Traxscout! Your curated tracks will appear here.
        </p>

        {/* Tier Badge */}
        <div className="inline-block bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full px-4 py-1 text-sm text-[#7C3AED] mb-8">
          {userInfo.profile?.tier || 'Free'} Plan
        </div>

        {/* Empty State */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🎵</div>
          <h2 className="text-xl font-semibold mb-2">No tracks yet</h2>
          <p className="text-[#A1A1AA] mb-6 max-w-md mx-auto">
            Connect your Beatport, Traxsource, or promo pool accounts in Settings to start getting curated picks.
          </p>
          <Link
            href="/settings"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] px-6 py-3 rounded-lg font-semibold transition inline-block"
          >
            Connect Accounts
          </Link>
        </div>
      </div>
    </main>
  );
}
