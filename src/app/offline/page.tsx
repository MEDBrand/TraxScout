'use client';

// Offline fallback page

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold mb-4">You&apos;re Offline</h1>
        <p className="text-[#A1A1AA] mb-6">
          TRAXSCOUT needs an internet connection to find tracks for you.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] px-6 py-3 rounded-xl font-semibold transition min-h-[44px] touch-manipulation"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
