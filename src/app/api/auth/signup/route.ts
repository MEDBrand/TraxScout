import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const tier = (formData.get('tier') as string) || 'basic';

    if (!email || !password) {
      return NextResponse.redirect(
        new URL(`/signup?error=${encodeURIComponent('Email and password required')}&tier=${tier}`, request.url), 303)
      );
    }

    if (password.length < 6) {
      return NextResponse.redirect(
        new URL(`/signup?error=${encodeURIComponent('Password must be at least 6 characters')}&tier=${tier}`, request.url), 303)
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.redirect(
        new URL(`/signup?error=${encodeURIComponent(error.message)}&tier=${tier}`, request.url), 303)
      );
    }

    // If email confirmation is required (no session returned)
    if (!data.session) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Check your email for a confirmation link, then sign in.')}`, request.url), 303)
      );
    }

    // Auto-login: set cookies and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard?welcome=true', request.url), 303);
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent('Something went wrong. Please try again.')}`, request.url), 303)
    );
  }
}
