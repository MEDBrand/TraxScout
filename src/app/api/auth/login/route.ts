import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    let email: string;
    let password: string;
    let redirect = '/dashboard';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // HTML form submission
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      redirect = (formData.get('redirect') as string) || '/dashboard';
    } else {
      // JSON API call
      const body = await request.json();
      email = body.email;
      password = body.password;
      redirect = body.redirect || '/dashboard';
    }

    if (!email || !password) {
      if (contentType.includes('form')) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Email and password required')}`, request.url));
      }
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (contentType.includes('form')) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirect)}`, request.url));
      }
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // For form submissions: set cookies and redirect
    if (contentType.includes('form')) {
      const response = NextResponse.redirect(new URL(redirect, request.url));
      // Set auth cookies so middleware can read them
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    // JSON response for API clients
    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
