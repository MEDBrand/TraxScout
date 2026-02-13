'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const DJ_TYPES = [
  { id: 'resident', label: 'Resident', icon: '🎛️', desc: 'Weekly residency at a venue' },
  { id: 'touring', label: 'Touring', icon: '✈️', desc: 'Playing across multiple cities' },
  { id: 'building', label: 'Building', icon: '🎧', desc: 'Growing your DJ career' },
] as const;

const GENRES = [
  'Tech House', 'Deep House', 'Minimal/Deep Tech', 'Afro House', 'House',
  'Melodic House', 'Progressive House', 'Disco/Nu-Disco', 'Techno', 'Melodic Techno',
  'Indie Dance', 'Jackin House', 'Funky House', 'Organic House', 'Electro',
  'Breaks', 'UKG/Speed Garage', 'Bass House',
];

const BPM_PRESETS = [
  { label: 'Deep House', min: 118, max: 122 },
  { label: 'Tech House', min: 122, max: 128 },
  { label: 'Techno', min: 128, max: 135 },
  { label: 'Afro House', min: 118, max: 125 },
];

const SOURCES = [
  { id: 'beatport', name: 'Beatport', icon: '🟢' },
  { id: 'traxsource', name: 'Traxsource', icon: '🔵' },
  { id: 'inflyte', name: 'Inflyte', icon: '🟣' },
  { id: 'trackstack', name: 'Trackstack', icon: '🩵' },
];

const DEFAULTS = {
  djType: 'resident',
  genres: ['Tech House', 'Deep House', 'House'],
  bpmMin: 122,
  bpmMax: 128,
  sources: [] as string[],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [djType, setDjType] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [bpmMin, setBpmMin] = useState(122);
  const [bpmMax, setBpmMax] = useState(128);
  const [connectedSources, setConnectedSources] = useState<string[]>([]);

  const canNext = step === 1 ? !!djType : step === 2 ? genres.length > 0 : true;

  const toggleGenre = useCallback((g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }, []);

  const finish = useCallback((useDefaults = false) => {
    const prefs = useDefaults ? DEFAULTS : {
      djType: djType || DEFAULTS.djType,
      genres: genres.length ? genres : DEFAULTS.genres,
      bpmMin,
      bpmMax,
      sources: connectedSources,
    };
    localStorage.setItem('traxscout_prefs', JSON.stringify(prefs));
    router.push('/dashboard');
  }, [djType, genres, bpmMin, bpmMax, connectedSources, router]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Progress bar */}
      <div className="h-[3px] bg-[#1A1A1A] w-full">
        <div
          className="h-full bg-[#7C3AED] transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-8">
        <p className="text-[12px] text-[#555] uppercase tracking-widest text-center mb-8">
          Step {step} of 4
        </p>

        {/* Step 1: DJ Type */}
        {step === 1 && (
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-center mb-2">What kind of DJ are you?</h1>
            <p className="text-[#71717A] text-center text-sm mb-8">This helps us tailor your recommendations.</p>
            <div className="space-y-3">
              {DJ_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setDjType(t.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all min-h-[44px] ${
                    djType === t.id
                      ? 'border-[#7C3AED] bg-[rgba(124,58,237,0.08)]'
                      : 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A]'
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-sm text-[#71717A]">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Genres */}
        {step === 2 && (
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-center mb-2">Pick your genres</h1>
            <p className="text-[#71717A] text-center text-sm mb-8">Select all that fit your sound.</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
                    genres.includes(g)
                      ? 'border-[#7C3AED] bg-[rgba(124,58,237,0.08)] text-white'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A1A1AA] hover:border-[#3A3A3A]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: BPM Range */}
        {step === 3 && (
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-center mb-2">Your BPM sweet spot</h1>
            <p className="text-[#71717A] text-center text-sm mb-8">We&apos;ll prioritize tracks in this range.</p>

            <div className="text-center mb-8">
              <span className="text-5xl font-bold tracking-tight">{bpmMin}</span>
              <span className="text-5xl font-bold tracking-tight text-[#71717A] mx-3">—</span>
              <span className="text-5xl font-bold tracking-tight">{bpmMax}</span>
            </div>

            <div className="mb-8 px-2">
              <label className="block text-xs text-[#71717A] mb-2">Min BPM: {bpmMin}</label>
              <input
                type="range"
                min={100}
                max={150}
                value={bpmMin}
                onChange={e => {
                  const v = Number(e.target.value);
                  setBpmMin(Math.min(v, bpmMax - 1));
                }}
                className="w-full accent-[#7C3AED] h-2"
              />
              <label className="block text-xs text-[#71717A] mb-2 mt-4">Max BPM: {bpmMax}</label>
              <input
                type="range"
                min={100}
                max={150}
                value={bpmMax}
                onChange={e => {
                  const v = Number(e.target.value);
                  setBpmMax(Math.max(v, bpmMin + 1));
                }}
                className="w-full accent-[#7C3AED] h-2"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {BPM_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setBpmMin(p.min); setBpmMax(p.max); }}
                  className={`px-4 py-2 rounded-full text-sm border transition-all min-h-[44px] ${
                    bpmMin === p.min && bpmMax === p.max
                      ? 'border-[#7C3AED] bg-[rgba(124,58,237,0.08)] text-white'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A1A1AA] hover:border-[#3A3A3A]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Connect Sources */}
        {step === 4 && (
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-center mb-2">Connect your sources</h1>
            <p className="text-[#71717A] text-center text-sm mb-8">Optional — you can do this later in settings.</p>
            <div className="space-y-3 mb-10">
              {SOURCES.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#2A2A2A] bg-[#141414]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <button
                    onClick={() => setConnectedSources(prev =>
                      prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                    )}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                      connectedSources.includes(s.id)
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                        : 'bg-white/5 text-[#A1A1AA] border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {connectedSources.includes(s.id) ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => finish()}
              className="w-full py-4 rounded-2xl font-semibold text-lg bg-[#F59E0B] hover:bg-[#D97706] text-black transition-colors min-h-[56px]"
            >
              Start Discovering 🔥
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4">
          <button
            onClick={() => finish(true)}
            className="text-[13px] text-[#6B6B6B] hover:text-[#999] transition-colors min-h-[44px]"
          >
            Skip
          </button>

          {step < 4 && (
            <button
              onClick={() => canNext && setStep(s => s + 1)}
              disabled={!canNext}
              className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${
                canNext
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                  : 'bg-[#2A2A2A] text-[#555] cursor-not-allowed'
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
