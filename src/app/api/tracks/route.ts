// Track Feed API
// Returns tracks from user's connected accounts + Traxscout picks
// User-auth model: each user brings their own platform access

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ScannerService } from '@/services/scanners';
import { getSourcesForTier } from '@/config/sources';
import { getConnections } from '@/app/actions/connections';
import { rankTracks, DAILY_TRACK_LIMIT } from '@/services/scoring';

export async function GET(request: NextRequest) {
  // Auth check
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Get user tier and connected accounts
  const { data: profile } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'basic';
  const connections = await getConnections(user.id);
  const connectedSourceIds = connections
    .filter(c => c.status === 'connected')
    .map(c => c.sourceId);

  // Always include trackscout picks (no connection needed)
  if (!connectedSourceIds.includes('trackscout')) {
    connectedSourceIds.push('trackscout');
  }

  // Parse filter options from query params
  const params = request.nextUrl.searchParams;
  const options = {
    genres: params.get('genres')?.split(',').filter(Boolean) || undefined,
    bpmMin: params.get('bpmMin') ? Number(params.get('bpmMin')) : undefined,
    bpmMax: params.get('bpmMax') ? Number(params.get('bpmMax')) : undefined,
    labels: params.get('labels')?.split(',').filter(Boolean) || undefined,
    releaseDaysAgo: params.get('days') ? Number(params.get('days')) : 7,
  };

  // Only scan sources the user has connected
  const scanner = new ScannerService();
  const result = await scanner.scanAll(tier, options, connectedSourceIds);

  // Load user preferences + saved artists for scoring
  const { data: prefs } = await supabase
    .from('preferences')
    .select('genres, bpm_min, bpm_max, labels')
    .eq('user_id', user.id)
    .single();

  const { data: savedTracks } = await supabase
    .from('user_tracks')
    .select('tracks(artist)')
    .eq('user_id', user.id)
    .eq('status', 'saved');

  const savedArtists = [...new Set(
    (savedTracks || [])
      .map((st: { tracks: unknown }) => (st.tracks as { artist?: string })?.artist)
      .filter(Boolean) as string[]
  )];

  // Score, rank, and cap at 20 tracks
  const scored = rankTracks(result.combined, {
    genres: prefs?.genres || [],
    bpmMin: prefs?.bpm_min || 100,
    bpmMax: prefs?.bpm_max || 140,
    labels: prefs?.labels || [],
    savedArtists,
  });

  // Include available sources metadata so the UI can show connect prompts
  const availableSources = getSourcesForTier(tier).map(s => ({
    id: s.id,
    name: s.name,
    status: s.status,
    authType: s.authType,
    connected: connectedSourceIds.includes(s.id) || s.authType === 'none',
    features: s.features,
  }));

  return NextResponse.json({
    tracks: scored,
    sources: result.sources,
    availableSources,
    connectedSources: connectedSourceIds,
    tier,
    dailyLimit: DAILY_TRACK_LIMIT,
    scannedAt: new Date().toISOString(),
  });
}
