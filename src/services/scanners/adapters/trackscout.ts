// Traxscout Internal Picks Adapter
// Reads curated tracks from Track Scout's daily cron picks
// Always active — this is our editorial/algorithmic layer

import { BaseScanner } from '../base';
import { FilterOptions, ScanResult, Source } from '@/types';
import { createServerClient } from '@/lib/supabase';

export class TrackscoutScanner extends BaseScanner {
  source: Source = 'trackscout';

  async scan(options?: FilterOptions): Promise<ScanResult> {
    try {
      const supabase = createServerClient();

      // Pull curated picks (source = 'trackscout' for editorial picks)
      // Also pull from 'promo' as legacy source type
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .in('source', ['trackscout', 'promo'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return { source: this.source, tracks: [], scannedAt: new Date(), error: error.message };
      }

      const tracks = (data || []).map(row => ({
        id: row.id,
        source: 'trackscout' as Source,
        artist: row.artist,
        title: row.title,
        label: row.label || 'Unknown',
        genre: this.normalizeGenre(row.genre || ''),
        bpm: row.bpm || 0,
        key: row.key || undefined,
        releaseDate: new Date(row.release_date || row.created_at),
        externalId: row.external_id || '',
        storeUrl: row.store_url || '',
        previewEmbedUrl: row.preview_url || undefined,
        artworkUrl: row.artwork_url || undefined,
        createdAt: new Date(row.created_at),
      }));

      return {
        source: this.source,
        tracks: this.filterTracks(tracks, options),
        scannedAt: new Date(),
      };
    } catch (err) {
      return {
        source: this.source,
        tracks: [],
        scannedAt: new Date(),
        error: err instanceof Error ? err.message : 'Traxscout picks fetch failed',
      };
    }
  }
}
