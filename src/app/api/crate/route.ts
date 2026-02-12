// Crate API — returns user's saved tracks
// Cached by service worker for offline access at venues

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Get saved tracks with full track data
  const { data, error } = await supabase
    .from('user_tracks')
    .select(`
      track_id,
      status,
      created_at,
      tracks (
        id, artist, title, label, genre, bpm, key,
        source, store_url, preview_url, artwork_url
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'saved')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tracks = (data || []).map(row => ({
    trackId: row.track_id,
    savedAt: row.created_at,
    ...(row.tracks as unknown as Record<string, unknown>),
  }));

  return NextResponse.json({
    tracks,
    count: tracks.length,
    cachedAt: new Date().toISOString(),
  });
}
