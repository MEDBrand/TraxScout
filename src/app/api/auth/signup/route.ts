import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function redirect(url: string, req: NextRequest) {
  return NextResponse.redirect(new URL(url, req.url), 303);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const tier = (formData.get('tier') as string) || 'basic';

    if (!email || !password) {
      return redirect(`/signup?error=${encodeURIComponent('Email and password required')}&tier=${tier}`, request);
    }

    if (password.length < 6) {
      return redirect(`/signup?error=${encodeURIComponent('Password must be at least 6 characters')}&tier=${tier}`, request);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return redirect(`/signup?error=${encodeURIComponent(error.message)}&tier=${tier}`, request);
    }

    if (!data.session) {
      return redirect(`/login?error=${encodeURIComponent('Check your email for a confirmation link, then sign in.')}`, request);
    }

    const response = redirect('/dashboard?welcome=true', request);
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 3600,
    });
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800,
    });
    return response;
  } catch {
    return redirect(`/signup?error=${encodeURIComponent('Something went wrong. Please try again.')}`, request);
  }
}
