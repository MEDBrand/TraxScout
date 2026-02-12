// Base Scanner Interface

import { Track, ScanResult, FilterOptions, Source } from '@/types';

export interface Scanner {
  source: Source;
  scan(options?: FilterOptions): Promise<ScanResult>;
}

export abstract class BaseScanner implements Scanner {
  abstract source: Source;
  
  abstract scan(options?: FilterOptions): Promise<ScanResult>;
  
  protected normalizeGenre(genre: string): string {
    // Normalize genre names across sources
    const mappings: Record<string, string> = {
      'tech-house': 'Tech House',
      'techhouse': 'Tech House',
      'deep-house': 'Deep House',
      'deephouse': 'Deep House',
      'afro-house': 'Afro House',
      'afrohouse': 'Afro House',
      'minimal-deep-tech': 'Minimal / Deep Tech',
    };
    
    const lower = genre.toLowerCase().replace(/\s+/g, '-');
    return mappings[lower] || genre;
  }
  
  protected filterTracks(tracks: Track[], options?: FilterOptions): Track[] {
    if (!options) return tracks;
    
    return tracks.filter(track => {
      // Genre filter
      if (options.genres?.length) {
        const normalized = this.normalizeGenre(track.genre);
        if (!options.genres.some(g => 
          normalized.toLowerCase().includes(g.toLowerCase())
        )) {
          return false;
        }
      }
      
      // BPM filter
      if (options.bpmMin && track.bpm < options.bpmMin) return false;
      if (options.bpmMax && track.bpm > options.bpmMax) return false;
      
      // Label filter
      if (options.labels?.length) {
        if (!options.labels.some(l => 
          track.label.toLowerCase().includes(l.toLowerCase())
        )) {
          return false;
        }
      }
      
      // Release date filter
      if (options.releaseDaysAgo) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - options.releaseDaysAgo);
        if (track.releaseDate < cutoff) return false;
      }
      
      return true;
    });
  }
}
