import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-12">
        <h1 className="text-2xl font-bold mb-2">Discover</h1>
        <p className="text-[#A1A1AA] mb-8">Curated tracks based on your taste.</p>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold mb-2">Coming soon</h2>
          <p className="text-[#71717A] text-sm mb-6">
            AI-powered discovery is launching with the full release.
            Your daily picks are on the Home tab.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors min-h-[44px]"
          >
            Go to Home
          </Link>
        </div>
      </div>
      <BottomTabBar />
    </main>
  );
}
