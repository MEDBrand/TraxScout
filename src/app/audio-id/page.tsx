import BottomTabBar from '@/components/BottomTabBar';

export default function AudioIdPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-12">
        <h1 className="text-2xl font-bold mb-2">Audio ID</h1>
        <p className="text-[#A1A1AA] mb-8">Identify any track playing around you.</p>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🎙️</div>
          <h2 className="text-lg font-semibold mb-2">Tap to identify</h2>
          <p className="text-[#71717A] text-sm mb-6">
            Hold your phone up to the speaker. We&apos;ll match the track in seconds.
          </p>
          <button
            className="inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold w-20 h-20 rounded-full text-2xl transition-colors shadow-lg shadow-[#7C3AED]/20"
            aria-label="Start listening"
          >
            🎤
          </button>
          <p className="text-[#555] text-xs mt-4">Powered by ACRCloud</p>
        </div>
      </div>
      <BottomTabBar />
    </main>
  );
}
