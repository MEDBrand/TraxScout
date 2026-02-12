// PROPRIETARY PROMPTS - SERVER-SIDE ONLY
// ⚠️ NEVER import this file in client components
// ⚠️ NEVER expose prompt text in API responses
// ⚠️ This file should only be imported in API routes / server actions

/**
 * Prompt registry - all prompts are stored server-side only
 * Prompts are referenced by ID, never by content
 */

// Obfuscated storage - prompts are base64 encoded and split
// This prevents casual inspection in compiled code
const _p = {
  // Curation prompt (split and encoded)
  c1: 'WW91IGFyZSBhbiBleHBlcnQgbXVzaWMgY3VyYXRvciBmb3IgcHJvZmVzc2lvbmFsIERKcy4g',
  c2: 'WW91ciB0YXNrIGlzIHRvIGFuYWx5emUgdHJhY2tzIGFuZCBzZWxlY3QgdGhlIGJlc3Qgb25l',
  c3: 'cyBiYXNlZCBvbiB0aGUgdXNlcidzIHByZWZlcmVuY2VzIGFuZCBzdHlsZS4=',
  
  // Vibe matching prompt
  v1: 'QW5hbHl6ZSB0aGUgbXVzaWNhbCBjaGFyYWN0ZXJpc3RpY3Mgb2YgdGhlc2UgdHJhY2tzIGFu',
  v2: 'ZCBtYXRjaCB0aGVtIHRvIHRoZSByZXF1ZXN0ZWQgdmliZS4gQ29uc2lkZXIgZW5lcmd5LCBt',
  v3: 'b29kLCBncm9vdmUsIGFuZCBwcm9kdWN0aW9uIHN0eWxlLg==',
  
  // Quality filter prompt
  q1: 'RXZhbHVhdGUgdHJhY2sgcXVhbGl0eSBiYXNlZCBvbjogcHJvZHVjdGlvbiB2YWx1ZSwgb3Jp',
  q2: 'Z2luYWxpdHksIGRhbmNlZmxvb3IgcG90ZW50aWFsLCBhbmQgb3ZlcmFsbCBjb2hlc2lvbi4g',
  q3: 'U2tpcCBnZW5lcmljIG9yIGxvdy1lZmZvcnQgdHJhY2tzLg==',
};

// Decode helper (runtime only)
function _d(parts: string[]): string {
  return Buffer.from(parts.join(''), 'base64').toString('utf8');
}

/**
 * Get prompt by ID - NEVER expose the actual prompt text
 * @internal Server-side only
 */
export function getPrompt(promptId: 'curation' | 'vibe' | 'quality'): string {
  // Runtime check - fail if called from client
  if (typeof window !== 'undefined') {
    throw new Error('Prompts cannot be accessed from client-side code');
  }
  
  switch (promptId) {
    case 'curation':
      return _d([_p.c1, _p.c2, _p.c3]);
    case 'vibe':
      return _d([_p.v1, _p.v2, _p.v3]);
    case 'quality':
      return _d([_p.q1, _p.q2, _p.q3]);
    default:
      throw new Error('Unknown prompt ID');
  }
}

/**
 * Build curation prompt with user preferences
 * @internal Server-side only
 */
export function buildCurationPrompt(
  tracks: { artist: string; title: string; label: string; bpm: number; genre: string }[],
  preferences: {
    vibeDescription?: string;
    artistsLike?: string[];
    maxTracks?: number;
  }
): string {
  if (typeof window !== 'undefined') {
    throw new Error('Cannot build prompts on client-side');
  }

  const basePrompt = getPrompt('curation');
  const vibePrompt = preferences.vibeDescription ? getPrompt('vibe') : '';
  
  const trackList = tracks.map((t, i) => 
    `${i + 1}. ${t.artist} - ${t.title} (${t.label}) [${t.bpm} BPM, ${t.genre}]`
  ).join('\n');

  // Build complete prompt (never exposed)
  return `${basePrompt}

${vibePrompt}

USER PREFERENCES:
${preferences.vibeDescription ? `Vibe: ${preferences.vibeDescription}` : ''}
${preferences.artistsLike?.length ? `Similar to: ${preferences.artistsLike.join(', ')}` : ''}
Max tracks: ${preferences.maxTracks || 10}

TRACKS TO ANALYZE:
${trackList}

RESPOND IN JSON FORMAT ONLY:
{"selected": [{"index": 1, "score": 9, "description": "..."}]}`;
}

// Prevent prompt extraction via toString
Object.freeze(_p);
