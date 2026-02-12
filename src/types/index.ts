// Track Scout Types

export type Tier = 'basic' | 'pro' | 'elite';

export type Source = 'beatport' | 'traxsource' | 'inflyte' | 'trackstack' | 'trackscout' | 'promo';

// Config-driven source connector system (user-auth model)
export type SourceStatus = 'active' | 'coming_soon' | 'disabled';
export type SourceAuthType = 'oauth' | 'credentials' | 'none';

export interface SourceConfig {
  id: Source;
  name: string;
  description: string;
  status: SourceStatus;
  authType: SourceAuthType;
  tier: Tier[];
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  features: {
    search: boolean;
    browse: boolean;
    preview: boolean;
    affiliate: boolean;
  };
  oauth?: {
    authorizeUrl: string;
    tokenUrl: string;
    scopes: string[];
  };
  connectInstructions?: string;
}

// User's connected account for a platform
export interface ConnectedAccount {
  id: string;
  userId: string;
  sourceId: Source;
  status: 'connected' | 'expired' | 'error';
  // For OAuth: encrypted access/refresh tokens
  // For credentials: encrypted email + password
  credentialsEncrypted: string;
  lastSyncAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DeliveryMethod = 'email' | 'dashboard' | 'telegram';

export type TrackStatus = 'new' | 'heard' | 'saved' | 'skipped';

export interface User {
  id: string;
  email: string;
  tier: Tier;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Preferences {
  id: string;
  userId: string;
  genres: string[];
  bpmMin: number;
  bpmMax: number;
  labels: string[];
  artistsLike: string[];      // Pro only
  vibeDescription: string;    // Pro only
  deliveryMethod: DeliveryMethod;
  deliveryFrequency: 'daily' | 'weekly';
}

export interface ApiKey {
  id: string;
  userId: string;
  provider: 'anthropic' | 'openai';
  keyEncrypted: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface PromoSession {
  id: string;
  userId: string;
  provider: 'inflyte' | string;
  sessionEncrypted: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Track {
  id: string;
  source: Source;
  artist: string;
  title: string;
  label: string;
  genre: string;
  bpm: number;
  key?: string;
  releaseDate: Date;
  externalId: string;
  
  // External links (we don't host files)
  storeUrl: string;           // Link to purchase on Beatport/Traxsource
  previewEmbedUrl?: string;   // Store's embed player (not our file)
  artworkUrl?: string;        // CDN link (not hosted by us)
  
  // Cache management
  cachedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface UserTrack {
  id: string;
  userId: string;
  trackId: string;
  track?: Track;
  score?: number;           // Relevance score (0-100)
  reason?: string;          // Why this track surfaced ("Matched your BPM range")
  description?: string;     // AI generated
  deliveredAt: Date;
  status: TrackStatus;
  createdAt: Date;
}

export interface ScanResult {
  source: Source;
  tracks: Track[];
  scannedAt: Date;
  error?: string;
}

export interface FilterOptions {
  genres?: string[];
  bpmMin?: number;
  bpmMax?: number;
  labels?: string[];
  releaseDaysAgo?: number;
}

export interface AICurationOptions {
  vibeDescription?: string;
  artistsLike?: string[];
  maxTracks?: number;
}

export interface DigestOptions {
  userId: string;
  method: DeliveryMethod;
  tracks: UserTrack[];
}
