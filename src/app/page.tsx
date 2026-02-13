// TRAXSCOUT Landing Page
// Server component — no client JS, CSS animations only

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes drift { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.1); } 66% { transform: translate(-20px, 10px) scale(0.95); } 100% { transform: translate(0, 0) scale(1); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        @keyframes iconSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes cardGlow { 0%, 100% { box-shadow: 0 0 0 rgba(124,58,237,0); } 50% { box-shadow: 0 0 30px rgba(124,58,237,0.1); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade-up { animation: fadeUp 0.7s ease-out both; }
        .anim-fade-in { animation: fadeIn 0.6s ease-out both; }
        .anim-scale-in { animation: scaleIn 0.6s ease-out both; }
        .anim-delay-1 { animation-delay: 0.1s; }
        .anim-delay-2 { animation-delay: 0.2s; }
        .anim-delay-3 { animation-delay: 0.3s; }
        .anim-delay-4 { animation-delay: 0.4s; }
        .anim-delay-5 { animation-delay: 0.5s; }
        .anim-delay-6 { animation-delay: 0.6s; }
        .anim-delay-7 { animation-delay: 0.7s; }
        .anim-delay-8 { animation-delay: 0.8s; }
        .anim-pulse { animation: pulse 2s ease-in-out infinite; }
        .anim-float { animation: float 4s ease-in-out infinite; }
        .anim-float-slow { animation: float 6s ease-in-out infinite; }
        .anim-drift { animation: drift 12s ease-in-out infinite; }
        .anim-drift-reverse { animation: drift 15s ease-in-out infinite reverse; }
        .anim-shimmer { animation: shimmer 3s ease-in-out infinite; }
        .anim-gradient { background-size: 200% 200%; animation: gradientShift 6s ease infinite; }
        .anim-card-glow { animation: cardGlow 4s ease-in-out infinite; }
        .feature-card { transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.3); }
        .feature-card:hover .icon-wrap { transform: scale(1.1); background: rgba(124,58,237,0.25); }
        .icon-wrap { transition: all 0.4s ease; }
        .pricing-card { transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); }
        .pricing-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(0,0,0,0.5); }
        .hero-gradient { background: radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%); }
        .cta-btn { position: relative; overflow: hidden; }
        .cta-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transform: translateX(-100%); transition: transform 0.6s; }
        .cta-btn:hover::after { transform: translateX(100%); }
        .step-card { transition: all 0.4s ease; }
        .step-card:hover { transform: translateY(-4px) scale(1.02); border-color: rgba(124,58,237,0.4); }
        .step-card:hover .step-num { color: #7C3AED; }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 anim-fade-in anim-delay-1">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            TRAXSCOUT
          </Link>
          <Link
            href="/login"
            className="text-[#A1A1AA] hover:text-white transition-colors px-4 py-2 min-h-[44px] flex items-center text-sm"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#7C3AED]/8 rounded-full blur-[100px] pointer-events-none anim-drift" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-[120px] pointer-events-none anim-drift-reverse" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 hero-gradient pointer-events-none anim-shimmer" />

        <div className="relative text-center max-w-2xl mx-auto">
          <div className="anim-fade-up anim-delay-3 inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#7C3AED] rounded-full anim-pulse" />
            <span className="text-sm text-[#A1A1AA]">7-day free trial</span>
          </div>

          <h1 className="anim-fade-up anim-delay-2 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Dig smarter,
            <br />
            <span className="text-[#71717A]">not harder.</span>
          </h1>

          <p className="anim-fade-up anim-delay-3 text-lg sm:text-xl text-[#A1A1AA] mb-6 max-w-md mx-auto leading-relaxed">
            AI-powered track discovery for DJs who refuse to miss a banger.
          </p>

          <p className="anim-fade-up anim-delay-3 text-[14px] text-[#8A8A8A] font-normal mb-10">
            The discovery tool a 15-year LIV Miami resident built for himself.
          </p>

          <div className="anim-fade-up anim-delay-4">
            <Link
              href="/signup"
              className="cta-btn inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 min-h-[56px] shadow-lg shadow-[#7C3AED]/20 hover:shadow-xl hover:shadow-[#7C3AED]/30 hover:scale-105 active:scale-95"
            >
              Start 7-Day Trial
            </Link>
          </div>
          <p className="anim-fade-up anim-delay-5 text-[#71717A] text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* ──────────────── FEATURE HIGHLIGHTS ──────────────── */}
      <section className="px-6 pb-20 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Promo Pool — Hero Feature */}
          <div className="mb-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden anim-card-glow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[120px] pointer-events-none anim-drift" />
              <div className="relative">
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center anim-float-slow">
                  <svg className="w-7 h-7 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                  Your promo pools.{' '}
                  <span className="text-[#A1A1AA]">Scanned automatically.</span>
                </h2>
                <p className="text-[#A1A1AA] text-lg max-w-lg mx-auto leading-relaxed">
                  Connect your Inflyte, promo pool, and label accounts.
                  We scan every new drop and surface what fits your sound — so you never dig through noise again.
                </p>
              </div>
            </div>
          </div>

          {/* Three-up feature cards */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="Multi-store scanning"
              desc="Beatport, Traxsource, Bandcamp — one dashboard."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="AI vibe matching"
              desc="Describe your sound. Get tracks that actually fit."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Daily digest"
              desc="Fresh picks in your inbox every morning."
            />
          </div>
        </div>
      </section>

      {/* ──────────────── AUDIO ID ──────────────── */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Hear it. <span className="text-[#7C3AED]">Know it.</span> Own it.
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Hear a track at a club? Tap the mic. Traxscout identifies it in seconds — then shows you where to buy it and which DJs are playing it.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
            {/* TAP */}
            <div className="step-card bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2"><span className="step-num transition-colors duration-300">1.</span> TAP</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">Hit the mic button when you hear something fire.</p>
            </div>

            {/* MATCH */}
            <div className="step-card bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2"><span className="step-num transition-colors duration-300">2.</span> MATCH</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">Our audio engine identifies the track in seconds.</p>
            </div>

            {/* OWN */}
            <div className="step-card bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2"><span className="step-num transition-colors duration-300">3.</span> OWN</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">See where to buy it and which DJs are playing it.</p>
            </div>
          </div>

          <p className="text-[#71717A] text-base italic">
            They can hide the screen. They can&apos;t hide the sound.
          </p>
        </div>
      </section>

      {/* ──────────────── PRICING ──────────────── */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 tracking-tight">
            Pricing
          </h2>
          <p className="text-[#A1A1AA] text-center mb-12 text-lg">
            Try free for 7 days.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic */}
            <div className="pricing-card bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">Basic</h3>
                <p className="text-[#71717A] text-sm">Essential scanning</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$19.88</span>
                <span className="text-[#71717A] text-sm ml-1">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-[#A1A1AA] flex-1">
                <PricingItem>Beatport &amp; Traxsource scanning</PricingItem>
                <PricingItem>Promo pool connections</PricingItem>
                <PricingItem>Audio ID — 10 IDs/month</PricingItem>
                <PricingItem>Genre &amp; BPM filters</PricingItem>
                <PricingItem>Daily email digest</PricingItem>
              </ul>
              <Link
                href="/signup?tier=basic"
                className="block w-full text-center bg-white/5 hover:bg-white/10 active:bg-white/[.15] border border-white/10 py-3.5 rounded-xl font-semibold transition-colors min-h-[48px]"
              >
                Start 7-Day Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="pricing-card bg-[#0A0A0A] border-2 border-[#7C3AED]/50 rounded-3xl p-8 relative h-full flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F59E0B] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">Pro</h3>
                <p className="text-[#71717A] text-sm">AI-powered curation</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$38.88</span>
                <span className="text-[#71717A] text-sm ml-1">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-[#A1A1AA] flex-1">
                <PricingItem purple>Everything in Basic</PricingItem>
                <PricingItem gold>Unlimited Audio IDs</PricingItem>
                <PricingItem gold>AI smart curation</PricingItem>
                <PricingItem gold>Vibe matching</PricingItem>
                <PricingItem gold>AI track descriptions</PricingItem>
                <PricingItem gold>BYOK — use your own API key</PricingItem>
              </ul>
              <Link
                href="/signup?tier=pro"
                className="block w-full text-center bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] py-3.5 rounded-xl font-semibold transition-colors min-h-[48px] shadow-lg shadow-[#7C3AED]/20"
              >
                Start 7-Day Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="relative py-12 sm:py-16 px-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-[100px] anim-drift" />
        </div>
        <div className="relative text-center max-w-md mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to dig?
          </h2>
          <p className="text-[#A1A1AA] mb-8 text-lg">
            Join DJs who never miss a release.
          </p>
          <Link
            href="/signup"
            className="cta-btn inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 min-h-[56px] shadow-lg shadow-[#7C3AED]/20 hover:shadow-xl hover:shadow-[#7C3AED]/30 hover:scale-105 active:scale-95"
          >
            Start 7-Day Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[#71717A] text-sm">© 2026 TRAXSCOUT</span>
          <div className="flex gap-6 text-[#71717A] text-sm">
            <Link href="/terms" className="hover:text-white transition-colors min-h-[44px] flex items-center">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors min-h-[44px] flex items-center">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Sub-components ── */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="feature-card bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 h-full cursor-default">
      <div className="icon-wrap w-11 h-11 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#A1A1AA] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingItem({ children, purple, gold }: { children: React.ReactNode; purple?: boolean; gold?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      {gold ? (
        <svg className="w-5 h-5 text-[#F59E0B] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg className={`w-5 h-5 flex-shrink-0 ${purple ? 'text-[#7C3AED]' : 'text-[#22C55E]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{children}</span>
    </li>
  );
}
