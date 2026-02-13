import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function CratePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-12">
        <h1 className="text-2xl font-bold mb-2">Your Crate</h1>
        <p className="text-[#A1A1AA] mb-8">Tracks you&apos;ve saved.</p>

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
      </div>
      <BottomTabBar />
    </main>
  );
}
