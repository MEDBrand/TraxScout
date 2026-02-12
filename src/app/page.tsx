'use client';

// TRAXSCOUT Landing Page
// Apple-minimal · OLED-optimized · Mobile-first

import Link from 'next/link';
import { motion } from 'framer-motion';
import { springs } from '@/lib/animations';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { ...springs.gentle },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.gentle, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5"
      >
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
      </motion.nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.gentle, delay: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springs.snappy, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
            <span className="text-sm text-[#A1A1AA]">7-day free trial</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Dig smarter,
            <br />
            <span className="text-[#71717A]">not harder.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#A1A1AA] mb-10 max-w-md mx-auto leading-relaxed">
            AI-powered track discovery for DJs who refuse to miss a banger.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springs.micro}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors min-h-[56px] shadow-lg shadow-[#7C3AED]/20"
            >
              Start 7-Day Trial
            </Link>
          </motion.div>
          <p className="text-[#71717A] text-sm mt-4">No credit card required</p>
        </motion.div>
      </section>

      {/* ──────────────── FEATURE HIGHLIGHTS ──────────────── */}
      <section className="px-6 pb-20 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Promo Pool — Hero Feature */}
          <motion.div {...fadeUp} className="mb-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center">
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
          </motion.div>

          {/* Three-up feature cards */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <motion.div {...fadeUp} transition={{ ...springs.gentle, delay: 0.05 }}>
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                title="Multi-store scanning"
                desc="Beatport, Traxsource, Bandcamp — one dashboard."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...springs.gentle, delay: 0.1 }}>
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
                title="AI vibe matching"
                desc="Describe your sound. Get tracks that actually fit."
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...springs.gentle, delay: 0.15 }}>
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                title="Daily digest"
                desc="Fresh picks in your inbox every morning."
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────── PRICING ──────────────── */}
      <section className="py-20 sm:py-24 px-6">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 tracking-tight">
            Pricing
          </h2>
          <p className="text-[#A1A1AA] text-center mb-12 text-lg">
            Try free for 7 days.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic */}
            <motion.div whileHover={{ y: -4 }} transition={springs.gentle}>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 h-full flex flex-col">
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
            </motion.div>

            {/* Pro */}
            <motion.div whileHover={{ y: -4 }} transition={springs.gentle}>
              <div className="bg-[#0A0A0A] border-2 border-[#7C3AED]/50 rounded-3xl p-8 relative h-full flex flex-col">
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
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="py-12 sm:py-16 px-6">
        <motion.div {...fadeUp} className="text-center max-w-md mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to dig?
          </h2>
          <p className="text-[#A1A1AA] mb-8 text-lg">
            Join DJs who never miss a release.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springs.micro}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors min-h-[56px] shadow-lg shadow-[#7C3AED]/20"
            >
              Start 7-Day Trial
            </Link>
          </motion.div>
        </motion.div>
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
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 h-full">
      <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] mb-4">
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
