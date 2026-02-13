// Source Registry — Config-driven, user-auth model
// "Mint.com for DJ tracks" — each user connects their own accounts
// Adding a new source:
//   1. Add config entry here
//   2. Create connector in /services/connectors/
//   3. Register in CONNECTOR_MAP in /services/connectors/index.ts

import { SourceConfig } from '@/types';

export const SOURCE_REGISTRY: Record<string, SourceConfig> = {
  beatport: {
    id: 'beatport',
    name: 'Beatport',
    description: 'Your Beatport purchases, charts, and wishlist.',
    status: 'active',
    authType: 'oauth',
    tier: ['basic', 'pro', 'elite'],
    rateLimit: { requestsPerMinute: 30, requestsPerDay: 5000 },
    features: {
      search: true,
      browse: true,
      preview: true,
      affiliate: true,
    },
    oauth: {
      authorizeUrl: 'https://oauth-api.beatport.com/identity/1/oauth/authorize',
      tokenUrl: 'https://oauth-api.beatport.com/identity/1/oauth/access-token',
      scopes: ['read'],
    },
    connectInstructions: 'Connect your Beatport account to sync purchases, wishlist, and personalized charts.',
  },

  traxsource: {
    id: 'traxsource',
    name: 'Traxsource',
    description: 'Your Traxsource purchases, crate, and download queue.',
    status: 'active',
    authType: 'credentials',
    tier: ['basic', 'pro', 'elite'],
    rateLimit: { requestsPerMinute: 10, requestsPerDay: 1000 },
    features: {
      search: true,
      browse: true,
      preview: true,
      affiliate: true,
    },
    connectInstructions: 'Enter your Traxsource email and password. Credentials are encrypted with AES-256 and never stored in plaintext.',
  },

  inflyte: {
    id: 'inflyte',
    name: 'Inflyte',
    description: 'Your promo pool inbox. Unreleased tracks from labels.',
    status: 'active',
    authType: 'credentials',
    tier: ['pro', 'elite'],
    features: {
      search: false,
      browse: true,
      preview: true,
      affiliate: false,
    },
    connectInstructions: 'Enter your Inflyte login credentials to sync your promo inbox automatically.',
  },

  trackstack: {
    id: 'trackstack',
    name: 'Trackstack',
    description: 'Your Flow Inbox. Demos and promos from producers.',
    status: 'active',
    authType: 'credentials',
    tier: ['pro', 'elite'],
    features: {
      search: false,
      browse: true,
      preview: true,
      affiliate: false,
    },
    connectInstructions: 'Enter your Trackstack login to sync demos and promos from your inbox.',
  },

  bandcamp: {
    id: 'bandcamp',
    name: 'Bandcamp',
    description: 'Your Bandcamp collection, wishlist, and followed artists.',
    status: 'active',
    authType: 'credentials',
    tier: ['basic', 'pro', 'elite'],
    rateLimit: { requestsPerMinute: 15, requestsPerDay: 2000 },
    features: {
      search: true,
      browse: true,
      preview: true,
      affiliate: false,
    },
    connectInstructions: 'Enter your Bandcamp login to sync your collection and wishlist.',
  },

  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    description: 'Your SoundCloud likes, reposts, and followed artists.',
    status: 'active',
    authType: 'oauth',
    tier: ['basic', 'pro', 'elite'],
    rateLimit: { requestsPerMinute: 20, requestsPerDay: 3000 },
    features: {
      search: true,
      browse: true,
      preview: true,
      affiliate: false,
    },
    connectInstructions: 'Connect your SoundCloud account to sync likes and discover new tracks from artists you follow.',
  },

  'promo-box': {
    id: 'promo-box',
    name: 'Promo Box',
    description: 'Your promo pool deliveries from labels and distributors.',
    status: 'active',
    authType: 'credentials',
    tier: ['pro', 'elite'],
    features: {
      search: false,
      browse: true,
      preview: true,
      affiliate: false,
    },
    connectInstructions: 'Enter your Promo Box login to sync promo deliveries.',
  },

  'label-worx': {
    id: 'label-worx',
    name: 'Label Worx',
    description: 'Your Label Worx promo pool and pre-release tracks.',
    status: 'active',
    authType: 'credentials',
    tier: ['pro', 'elite'],
    features: {
      search: false,
      browse: true,
      preview: true,
      affiliate: false,
    },
    connectInstructions: 'Enter your Label Worx credentials to sync your promo pool.',
  },

  trackscout: {
    id: 'trackscout',
    name: 'Traxscout Picks',
    description: 'Curated daily picks from our scanning and editorial team.',
    status: 'active',
    authType: 'none',
    tier: ['basic', 'pro', 'elite'],
    features: {
      search: false,
      browse: true,
      preview: false,
      affiliate: false,
    },
    connectInstructions: 'Always on. Fresh picks delivered daily.',
  },
};

// Get all sources (regardless of status)
export function getAllSources(): SourceConfig[] {
  return Object.values(SOURCE_REGISTRY);
}

// Get sources available for a given tier
export function getSourcesForTier(tier: string): SourceConfig[] {
  return Object.values(SOURCE_REGISTRY).filter(
    s => s.status === 'active' && s.tier.includes(tier as SourceConfig['tier'][number])
  );
}

// Get source config by ID
export function getSourceConfig(sourceId: string): SourceConfig | undefined {
  return SOURCE_REGISTRY[sourceId];
}
