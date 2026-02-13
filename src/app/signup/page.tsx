// Signup page — server component, no client JS required
// The form POSTs to /api/auth/signup which handles user creation and redirects

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#7C3AED]">
            TRAXSCOUT
          </Link>
          <p className="text-gray-400 mt-2">Start your free trial</p>
        </div>

        <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action="/api/auth/signup" method="POST" className="space-y-4">
            <input type="hidden" name="tier" value={tier} />

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                minLength={6}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition text-white"
                required
              />
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Basic Plan</span>
                <span className="text-[#F59E0B] font-bold">$19.88/mo</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">7-day free trial, then billed monthly</p>
            </div>

            <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 p-3 rounded-lg flex items-center gap-2">
              <span className="text-[#F59E0B]">✓</span>
              <div>
                <p className="font-medium text-sm">Free for 7 days</p>
                <p className="text-gray-400 text-xs">Cancel anytime. No charge until trial ends.</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] py-3 rounded-lg font-semibold transition text-white"
            >
              Start Free Trial
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7C3AED] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-500 mt-6">
          <Link href="/" className="hover:text-white transition">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
