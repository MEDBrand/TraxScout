// Login page — server component, no client JS required for basic form
// The form POSTs to /api/auth/login which handles auth and redirects

import Link from 'next/link';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  // Next.js 16 makes searchParams a promise in server components
  // But we can read it synchronously in the JSX via a wrapper
  return <LoginContent searchParamsPromise={searchParams} />;
}

async function LoginContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ redirect?: string; error?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const error = searchParams?.error;
  const redirect = searchParams?.redirect || '/dashboard';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#7C3AED]">
            TRAXSCOUT
          </Link>
          <p className="text-gray-400 mt-2">Welcome back</p>
        </div>

        <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="redirect" value={redirect} />

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
                placeholder="Your password"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] py-3 rounded-lg font-semibold transition text-white"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#7C3AED] hover:underline">
              Start free trial
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
