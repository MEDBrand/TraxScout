// Scanner Service — Registry-driven
// Sources are loaded from config. Adding a new source:
// 1. Add entry in /config/sources.ts
// 2. Create adapter in /services/scanners/adapters/
// 3. Register it in the ADAPTER_MAP below
// That's it. No refactoring.

import { BaseScanner } from './base';
import { BeatportScanner } from './beatport';
import { TraxsourceScanner } from './traxsource';
import { InflyteScanner } from './adapters/inflyte';
import { TrackstackScanner } from './adapters/trackstack';
import { TrackscoutScanner } from './adapters/trackscout';
import { getSourcesForTier } from '@/config/sources';
import { FilterOptions, ScanResult, Source, Track } from '@/types';

export { BaseScanner } from './base';
export { BeatportScanner } from './beatport';
export { TraxsourceScanner } from './traxsource';

// Adapter registry — maps source ID to scanner class
const ADAPTER_MAP: Record<string, () => BaseScanner> = {
  beatport: () => new BeatportScanner(),
  traxsource: () => new TraxsourceScanner(),
  inflyte: () => new InflyteScanner(),
  trackstack: () => new TrackstackScanner(),
  trackscout: () => new TrackscoutScanner(),
};

export interface ScanAllResult {
  results: Record<string, ScanResult>;
  combined: Track[];
  sources: { id: string; name: string; status: string; trackCount: number }[];
}

export class ScannerService {
  // Scan sources for a given user tier, optionally filtered to specific source IDs
  async scanAll(tier: string, options?: FilterOptions, sourceIds?: string[]): Promise<ScanAllResult> {
    let availableSources = getSourcesForTier(tier);

    // If specific source IDs provided, only scan those
    if (sourceIds?.length) {
      availableSources = availableSources.filter(src => sourceIds.includes(src.id));
    }

    const results: Record<string, ScanResult> = {};
    const sourceInfo: ScanAllResult['sources'] = [];

    // Run all sources in parallel
    const scanPromises = availableSources
      .map(async (src) => {
        const createAdapter = ADAPTER_MAP[src.id];
        if (!createAdapter) return;

        const adapter = createAdapter();
        try {
          const result = await adapter.scan(options);
          results[src.id] = result;
          sourceInfo.push({
            id: src.id,
            name: src.name,
            status: result.error ? 'error' : 'ok',
            trackCount: result.tracks.length,
          });
        } catch (err) {
          results[src.id] = {
            source: src.id as Source,
            tracks: [],
            scannedAt: new Date(),
            error: err instanceof Error ? err.message : 'Unknown error',
          };
          sourceInfo.push({
            id: src.id,
            name: src.name,
            status: 'error',
            trackCount: 0,
          });
        }
      });

    await Promise.all(scanPromises);

    // Combine and deduplicate across all sources
    const allTracks = Object.values(results).flatMap(r => r.tracks);
    const combined = this.deduplicateAcrossSources(allTracks);

    return { results, combined, sources: sourceInfo };
  }

  // Scan a specific source by ID
  async scanSource(sourceId: string, options?: FilterOptions): Promise<ScanResult> {
    const createAdapter = ADAPTER_MAP[sourceId];
    if (!createAdapter) {
      return {
        source: sourceId as Source,
        tracks: [],
        scannedAt: new Date(),
        error: `No adapter registered for source: ${sourceId}`,
      };
    }

    const adapter = createAdapter();
    return adapter.scan(options);
  }

  private deduplicateAcrossSources(tracks: Track[]): Track[] {
    const seen = new Map<string, Track>();

    for (const track of tracks) {
      const key = `${track.artist}-${track.title}`.toLowerCase().trim();

      if (!seen.has(key)) {
        seen.set(key, track);
      } else {
        const existing = seen.get(key)!;
        // Prefer whichever has more data (BPM, key, store URL)
        const existingScore = (existing.bpm ? 1 : 0) + (existing.key ? 1 : 0) + (existing.storeUrl ? 1 : 0);
        const newScore = (track.bpm ? 1 : 0) + (track.key ? 1 : 0) + (track.storeUrl ? 1 : 0);
        if (newScore > existingScore) {
          seen.set(key, track);
        }
      }
    }

    return Array.from(seen.values());
  }
}
