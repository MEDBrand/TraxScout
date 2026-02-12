// Track Scoring + Transparency Reasons
// Ranks tracks by relevance and generates a human-readable reason for each
// Philosophy: curator, not search engine. Best 20, not 500.

import { Track } from '@/types';

export const DAILY_TRACK_LIMIT = 20;

interface UserPreferences {
  genres: string[];
  bpmMin: number;
  bpmMax: number;
  labels: string[];
  savedArtists: string[];   // Artists the user has saved before
}

export interface ScoredTrack extends Track {
  score: number;       // 0-100
  reason: string;      // "Matched your BPM range"
  reasons: string[];   // All matching reasons (primary is first)
}

// Score a single track against user preferences
function scoreTrack(track: Track, prefs: UserPreferences): ScoredTrack {
  let score = 0;
  const reasons: string[] = [];

  // Genre match (0-30 points)
  if (prefs.genres.length > 0) {
    const genreLower = track.genre.toLowerCase();
    if (prefs.genres.some(g => genreLower.includes(g.toLowerCase()))) {
      score += 30;
      reasons.push('Matches your genres');
    }
  }

  // BPM range match (0-20 points)
  if (track.bpm > 0 && track.bpm >= prefs.bpmMin && track.bpm <= prefs.bpmMax) {
    score += 20;
    reasons.push('Matched your BPM range');
  }

  // Label match (0-15 points)
  if (prefs.labels.length > 0) {
    const labelLower = track.label.toLowerCase();
    if (prefs.labels.some(l => labelLower.includes(l.toLowerCase()))) {
      score += 15;
      reasons.push(`From ${track.label}`);
    }
  }

  // Artist previously saved (0-25 points)
  if (prefs.savedArtists.length > 0) {
    const artistLower = track.artist.toLowerCase();
    if (prefs.savedArtists.some(a => artistLower.includes(a.toLowerCase()))) {
      score += 25;
      reasons.push('Artist you saved before');
    }
  }

  // Recency bonus (0-10 points) — newer tracks score higher
  const ageMs = Date.now() - new Date(track.releaseDate || track.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 1) {
    score += 10;
    reasons.push('Released today');
  } else if (ageDays < 3) {
    score += 7;
    reasons.push('New release');
  } else if (ageDays < 7) {
    score += 4;
    reasons.push('This week');
  }

  // Promo pool bonus (promo tracks are exclusive)
  if (track.source === 'inflyte' || track.source === 'trackstack') {
    score += 5;
    if (!reasons.some(r => r.includes('promo'))) {
      reasons.push('From your promo pool');
    }
  }

  // Fallback reason
  if (reasons.length === 0) {
    reasons.push('Curated pick');
  }

  return {
    ...track,
    score: Math.min(100, score),
    reason: reasons[0],
    reasons,
  };
}

// Score, rank, and cap to daily limit
export function rankTracks(
  tracks: Track[],
  prefs: UserPreferences,
  limit: number = DAILY_TRACK_LIMIT,
): ScoredTrack[] {
  return tracks
    .map(t => scoreTrack(t, prefs))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
