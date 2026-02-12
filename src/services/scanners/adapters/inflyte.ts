// Inflyte Promo Pool Adapter
// Reads curated tracks from Track Scout's Inflyte scan results
// Data sourced via Chrome relay (managed by Track Scout agent)

import { BaseScanner } from '../base';
import { FilterOptions, ScanResult, Source } from '@/types';
import { createServerClient } from '@/lib/supabase';

export class InflyteScanner extends BaseScanner {
  source: Source = 'inflyte';

  async scan(options?: FilterOptions): Promise<ScanResult> {
    try {
      const supabase = createServerClient();

      // Pull tracks that Track Scout deposited from Inflyte scans
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('source', 'inflyte')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return { source: this.source, tracks: [], scannedAt: new Date(), error: error.message };
      }

      const tracks = (data || []).map(row => ({
        id: row.id,
        source: 'inflyte' as Source,
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
        error: err instanceof Error ? err.message : 'Inflyte scan failed',
      };
    }
  }
}
