import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getUserFromCookies(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase.auth.getUser(token);
  return data.user?.id || null;
}

export async function POST(request: NextRequest) {
  const userId = await getUserFromCookies(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { djType, genres, bpmMin, bpmMax } = body;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('preferences').upsert({
    user_id: userId,
    dj_type: djType || 'resident',
    preferred_genres: genres || [],
    preferred_bpm_min: bpmMin || 122,
    preferred_bpm_max: bpmMax || 128,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
