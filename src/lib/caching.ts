// Caching Policy for Traxscout
// We cache CURATED RESULTS only, not full store catalogs

/**
 * CACHING PHILOSOPHY:
 * 
 * ✅ WHAT WE CACHE:
 * - Curated track results (matched to user preferences)
 * - Basic metadata (artist, title, label, BPM, key)
 * - External IDs for linking to stores
 * 
 * ❌ WHAT WE DON'T CACHE:
 * - Full store catalogs
 * - Audio files or previews (use store embeds)
 * - Pricing information (changes frequently)
 * - Artwork files (link to CDN instead)
 * 
 * 📋 RETENTION:
 * - Track cache: 7 days (then refresh from source)
 * - User results: 30 days
 * - Scan logs: 90 days
 */

export const CACHE_TTL = {
  // Track metadata cache (refresh weekly)
  TRACK_METADATA: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // User's curated results (keep for reference)
  USER_RESULTS: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Scan results before delivery
  SCAN_RESULTS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Store availability check
  AVAILABILITY_CHECK: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Track metadata we store (publicly available info only)
 */
export interface CachedTrackMetadata {
  // Identifiers
  id: string;
  source: 'beatport' | 'traxsource';
  externalId: string;
  
  // Public metadata
  artist: string;
  title: string;
  label: string;
  genre: string;
  bpm: number;
  key: string;
  releaseDate: string;
  
  // Links (not files)
  storeUrl: string;        // Link to purchase page
  artworkUrl?: string;     // CDN link to artwork (not hosted by us)
  previewUrl?: string;     // Store's preview player URL (not hosted by us)
  
  // Cache management
  cachedAt: number;
  expiresAt: number;
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(cachedAt: number, ttl: number): boolean {
  return Date.now() - cachedAt < ttl;
}

/**
 * Clean up expired cache entries
 * Run this periodically (daily cron)
 */
export async function cleanExpiredCache(supabase: any): Promise<{
  tracksDeleted: number;
  resultsDeleted: number;
}> {
  const now = new Date().toISOString();
  const trackCutoff = new Date(Date.now() - CACHE_TTL.TRACK_METADATA).toISOString();
  const resultsCutoff = new Date(Date.now() - CACHE_TTL.USER_RESULTS).toISOString();
  
  // Delete old track cache entries
  const { count: tracksDeleted } = await supabase
    .from('tracks')
    .delete()
    .lt('created_at', trackCutoff)
    .select('count');
  
  // Delete old user results (keep saved tracks)
  const { count: resultsDeleted } = await supabase
    .from('user_tracks')
    .delete()
    .lt('created_at', resultsCutoff)
    .neq('status', 'saved')
    .select('count');
  
  return {
    tracksDeleted: tracksDeleted || 0,
    resultsDeleted: resultsDeleted || 0,
  };
}

/**
 * What we DON'T do:
 * - Host MP3/audio files
 * - Store full catalog dumps
 * - Cache pricing (it changes)
 * - Bypass store's paywall
 * 
 * We are a DISCOVERY tool that helps DJs find music faster.
 * Users purchase directly from Beatport/Traxsource.
 */
