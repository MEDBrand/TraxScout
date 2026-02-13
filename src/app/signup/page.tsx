// Signup page — server component, premium design matching login
// Posts to /api/auth/signup which handles user creation and redirects

import Link from 'next/link';

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tier?: string }>;
}) {
  return <SignupContent searchParamsPromise={searchParams} />;
}

async function SignupContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ error?: string; tier?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const error = searchParams?.error;
  const tier = searchParams?.tier || 'basic';

  const tierLabel = tier === 'elite' ? 'Elite' : tier === 'pro' ? 'Pro' : 'Basic';
  const tierPrice = tier === 'elite' ? '$68.88' : tier === 'pro' ? '$38.88' : '$19.88';
  const trialDays = tier === 'elite' ? 14 : 7;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Ambient purple glow */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div
            className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-end gap-[3px] h-8">
              {[10, 18, 26, 32, 24, 16, 22, 28, 14].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    height: `${h}px`,
                    background: i === 4
                      ? '#F59E0B'
                      : 'linear-gradient(to top, rgba(124,58,237,0.6), rgba(124,58,237,1))',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Start your <span className="text-[#7C3AED]">free trial</span>
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-2">{trialDays} days free, then {tierPrice}/mo. Cancel anytime.</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}
          >
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Plan badge */}
        <div
          className="relative rounded-2xl px-5 py-4 mb-6 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Gradient border */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(255,255,255,0.06), rgba(245,158,11,0.15))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✓</span>
              <span className="font-semibold">{tierLabel} Plan</span>
            </div>
            <span className="text-[#F59E0B] font-bold">{tierPrice}/mo</span>
          </div>
          <p className="text-[#6B6B6B] text-xs mt-1.5 ml-7">No charge until your trial ends</p>
        </div>

        {/* Form */}
        <form action="/api/auth/signup" method="POST" className="space-y-4 mb-5">
          <input type="hidden" name="tier" value={tier} />

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full px-[18px] py-4 rounded-[14px] text-base text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              fontSize: '16px',
            }}
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full px-[18px] py-4 rounded-[14px] text-base text-[#F5F5F5] placeholder-[#4A4A4A] focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              fontSize: '16px',
            }}
          />

          <button
            type="submit"
            className="w-full py-4 rounded-[14px] text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.1)',
            }}
          >
            Start Free Trial
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-xs text-[#4A4A4A] font-medium tracking-wider">OR</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Social sign-up */}
        <div className="flex gap-3 mb-8">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[14px] text-sm font-medium text-[#F5F5F5] transition hover:bg-white/[0.05] active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[14px] text-sm font-medium text-[#F5F5F5] transition hover:bg-white/[0.05] active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            <svg className="w-5 h-5" fill="#F5F5F5" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-[#6B6B6B]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7C3AED] font-medium hover:text-[#A78BFA] transition">
            Sign in
          </Link>
        </p>
      </div>

      {/* Footer branding */}
      <div className="absolute bottom-6 text-center">
        <span className="text-[11px] tracking-[0.15em] text-[#3A3A3A] font-medium">BY DJSOLUTIONS</span>
      </div>

      {/* Focus styles */}
      <style>{`
        input:focus {
          border-color: rgba(124,58,237,0.4) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
      `}</style>
    </main>
  );
}
