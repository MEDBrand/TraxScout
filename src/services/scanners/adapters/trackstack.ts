// Trackstack Adapter
// Producer-driven promo platform (Flow Inbox)
// Will use Chrome relay like Inflyte when activated
// Currently pending — returns empty results gracefully

import { BaseScanner } from '../base';
import { FilterOptions, ScanResult, Source } from '@/types';
import { createServerClient } from '@/lib/supabase';

export class TrackstackScanner extends BaseScanner {
  source: Source = 'trackstack';

  async scan(options?: FilterOptions): Promise<ScanResult> {
    try {
      const supabase = createServerClient();

      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('source', 'trackstack')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return { source: this.source, tracks: [], scannedAt: new Date(), error: error.message };
      }

      const tracks = (data || []).map(row => ({
        id: row.id,
        source: 'trackstack' as Source,
        artist: row.artist,
        title: row.title,
        label: row.label || 'Independent',
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
        error: err instanceof Error ? err.message : 'Trackstack scan failed',
      };
    }
  }
}
