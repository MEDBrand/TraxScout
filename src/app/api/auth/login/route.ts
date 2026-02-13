import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function redirect(url: string, req: NextRequest) {
  return NextResponse.redirect(new URL(url, req.url), 303);
}

export async function POST(request: NextRequest) {
  try {
    let email: string;
    let password: string;
    let redirectPath = '/dashboard';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      redirectPath = (formData.get('redirect') as string) || '/dashboard';
    } else {
      const body = await request.json();
      email = body.email;
      password = body.password;
      redirectPath = body.redirect || '/dashboard';
    }

    if (!email || !password) {
      if (contentType.includes('form')) {
        return redirect(`/login?error=${encodeURIComponent('Email and password required')}`, request);
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
        return redirect(`/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectPath)}`, request);
      }
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (contentType.includes('form')) {
      const response = redirect(redirectPath, request);
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 3600,
      });
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800,
      });
      return response;
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
