// AI Curation Service (Pro Tier)
// ⚠️ SERVER-SIDE ONLY - Never import in client components

import { Track, AICurationOptions, UserTrack } from '@/types';
import { buildCurationPrompt } from '@/lib/prompts';
import { watermarkOutput } from '@/lib/anti-abuse';
import { logSecurityEvent } from '@/lib/security';

interface AIProvider {
  name: 'anthropic' | 'openai';
  apiKey: string;
}

interface CurationResult {
  tracks: UserTrack[];
  tokensUsed: number;
}

export class AICurator {
  private provider: AIProvider;
  
  constructor(provider: AIProvider) {
    // Runtime check - ensure server-side only
    if (typeof window !== 'undefined') {
      throw new Error('AICurator can only be instantiated server-side');
    }
    this.provider = provider;
  }
  
  async curateTracks(
    tracks: Track[],
    userId: string,
    options: AICurationOptions
  ): Promise<CurationResult> {
    // Build prompt server-side (never exposed)
    const prompt = buildCurationPrompt(
      tracks.map(t => ({
        artist: t.artist,
        title: t.title,
        label: t.label,
        bpm: t.bpm,
        genre: t.genre,
      })),
      options
    );
    
    let result: CurationResult;
    
    if (this.provider.name === 'anthropic') {
      result = await this.callAnthropic(prompt, tracks, userId);
    } else {
      result = await this.callOpenAI(prompt, tracks, userId);
    }
    
    // Watermark output for leak tracing
    result.tracks = watermarkOutput(userId, result.tracks as unknown as Array<{ id: string; [key: string]: unknown }>) as unknown as UserTrack[];
    
    return result;
  }
  
  private async callAnthropic(
    prompt: string,
    tracks: Track[],
    userId: string
  ): Promise<CurationResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logSecurityEvent('ai_api_error', { provider: 'anthropic', userId, status: response.status }, 'warning');
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.content[0].text;
    
    return {
      tracks: this.parseResponse(content, tracks, userId),
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }
  
  private async callOpenAI(
    prompt: string,
    tracks: Track[],
    userId: string
  ): Promise<CurationResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
      }),
    });
    
    if (!response.ok) {
      logSecurityEvent('ai_api_error', { provider: 'openai', userId, status: response.status }, 'warning');
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return {
      tracks: this.parseResponse(content, tracks, userId),
      tokensUsed: data.usage?.total_tokens || 0,
    };
  }
  
  private parseResponse(content: string, tracks: Track[], userId: string): UserTrack[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.selected
        .map((item: { index: number; score: number; description: string }) => {
          const track = tracks[item.index - 1];
          if (!track) return null;
          
          return {
            id: crypto.randomUUID(),
            userId,
            trackId: track.id,
            track,
            score: item.score / 10,
            description: item.description,
            deliveredAt: new Date(),
            status: 'new' as const,
            createdAt: new Date(),
          };
        })
        .filter(Boolean) as UserTrack[];
        
    } catch (error) {
      logSecurityEvent('ai_parse_error', { userId }, 'warning');
      // Fallback without AI enhancement
      return tracks.slice(0, 10).map(track => ({
        id: crypto.randomUUID(),
        userId,
        trackId: track.id,
        track,
        deliveredAt: new Date(),
        status: 'new' as const,
        createdAt: new Date(),
      }));
    }
  }
}

// Prevent inspection
Object.freeze(AICurator);
