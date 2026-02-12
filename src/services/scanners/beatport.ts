// Beatport Scanner

import * as cheerio from 'cheerio';
import { Track, ScanResult, FilterOptions } from '@/types';
import { BaseScanner } from './base';

const BEATPORT_BASE = 'https://www.beatport.com';

// Genre IDs for Beatport
const GENRE_IDS: Record<string, number> = {
  'Tech House': 11,
  'Deep House': 12,
  'Afro House': 89,
  'Minimal / Deep Tech': 14,
  'House': 5,
  'Melodic House & Techno': 90,
};

export class BeatportScanner extends BaseScanner {
  source = 'beatport' as const;
  
  async scan(options?: FilterOptions): Promise<ScanResult> {
    try {
      const tracks: Track[] = [];
      const genres = options?.genres || ['Tech House'];
      
      for (const genre of genres) {
        const genreId = GENRE_IDS[genre];
        if (!genreId) continue;
        
        const genreTracks = await this.scanGenre(genreId, genre);
        tracks.push(...genreTracks);
      }
      
      // Apply filters
      const filtered = this.filterTracks(tracks, options);
      
      // Remove duplicates
      const unique = this.deduplicateTracks(filtered);
      
      return {
        source: 'beatport',
        tracks: unique,
        scannedAt: new Date(),
      };
    } catch (error) {
      return {
        source: 'beatport',
        tracks: [],
        scannedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  private async scanGenre(genreId: number, genreName: string): Promise<Track[]> {
    const url = `${BEATPORT_BASE}/genre/${genreName.toLowerCase().replace(/\s+/g, '-')}/${genreId}/releases?page=1&per_page=50`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Beatport returned ${response.status}`);
    }
    
    const html = await response.text();
    return this.parseReleasePage(html, genreName);
  }
  
  private parseReleasePage(html: string, genre: string): Track[] {
    const $ = cheerio.load(html);
    const tracks: Track[] = [];
    
    // Parse release cards
    // Note: Actual selectors will need adjustment based on Beatport's current HTML
    $('[data-testid="track-row"], .track-row, .release-cell').each((_, el) => {
      try {
        const $el = $(el);
        
        const artist = $el.find('.artist-name, [data-testid="artist-name"]').text().trim();
        const title = $el.find('.track-title, [data-testid="track-title"]').text().trim();
        const label = $el.find('.label-name, [data-testid="label-name"]').text().trim();
        const bpmText = $el.find('.bpm, [data-testid="bpm"]').text().trim();
        const bpm = parseInt(bpmText) || 0;
        const externalId = $el.attr('data-track-id') || $el.find('a').attr('href') || '';
        
        if (artist && title) {
          tracks.push({
            id: crypto.randomUUID(),
            source: 'beatport',
            artist,
            title,
            label: label || 'Unknown',
            genre,
            bpm,
            releaseDate: new Date(),
            externalId,
            storeUrl: externalId ? `https://www.beatport.com${externalId}` : '',
            createdAt: new Date(),
          });
        }
      } catch {
        // Skip malformed entries
      }
    });
    
    return tracks;
  }
  
  private deduplicateTracks(tracks: Track[]): Track[] {
    const seen = new Set<string>();
    return tracks.filter(track => {
      const key = `${track.artist}-${track.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
