// Traxsource Scanner

import * as cheerio from 'cheerio';
import { Track, ScanResult, FilterOptions } from '@/types';
import { BaseScanner } from './base';

const TRAXSOURCE_BASE = 'https://www.traxsource.com';

// Genre slugs for Traxsource
const GENRE_SLUGS: Record<string, string> = {
  'Tech House': 'tech-house',
  'Deep House': 'deep-house',
  'Afro House': 'afro-house',
  'Minimal / Deep Tech': 'minimal-deep-tech',
  'House': 'house',
};

export class TraxsourceScanner extends BaseScanner {
  source = 'traxsource' as const;
  
  async scan(options?: FilterOptions): Promise<ScanResult> {
    try {
      const tracks: Track[] = [];
      const genres = options?.genres || ['Tech House'];
      
      for (const genre of genres) {
        const slug = GENRE_SLUGS[genre];
        if (!slug) continue;
        
        const genreTracks = await this.scanGenre(slug, genre);
        tracks.push(...genreTracks);
      }
      
      // Apply filters
      const filtered = this.filterTracks(tracks, options);
      
      // Remove duplicates
      const unique = this.deduplicateTracks(filtered);
      
      return {
        source: 'traxsource',
        tracks: unique,
        scannedAt: new Date(),
      };
    } catch (error) {
      return {
        source: 'traxsource',
        tracks: [],
        scannedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  private async scanGenre(slug: string, genreName: string): Promise<Track[]> {
    const url = `${TRAXSOURCE_BASE}/genre/${slug}/all?cn=tracks&ob=releaseDate&so=desc`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Traxsource returned ${response.status}`);
    }
    
    const html = await response.text();
    return this.parseTracksPage(html, genreName);
  }
  
  private parseTracksPage(html: string, genre: string): Track[] {
    const $ = cheerio.load(html);
    const tracks: Track[] = [];
    
    // Parse track listings
    // Note: Actual selectors will need adjustment based on Traxsource's current HTML
    $('.trk-row, .track-item, [data-track-id]').each((_, el) => {
      try {
        const $el = $(el);
        
        const artist = $el.find('.artists, .artist a').text().trim();
        const title = $el.find('.title, .track-title a').text().trim();
        const label = $el.find('.label, .label-name a').text().trim();
        const bpmText = $el.find('.bpm, .track-bpm').text().trim();
        const bpm = parseInt(bpmText) || 0;
        const externalId = $el.attr('data-track-id') || '';
        
        if (artist && title) {
          tracks.push({
            id: crypto.randomUUID(),
            source: 'traxsource',
            artist,
            title,
            label: label || 'Unknown',
            genre,
            bpm,
            releaseDate: new Date(),
            externalId,
            storeUrl: externalId ? `https://www.traxsource.com/track/${externalId}` : '',
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
