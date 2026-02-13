// Stripe Configuration

import Stripe from 'stripe';

// Lazy init — avoids build crash when STRIPE_SECRET_KEY isn't set yet
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

// Backward compat — will throw at runtime if key missing, but won't crash build
export const stripe = undefined as unknown as Stripe;

export const PLANS = {
  basic: {
    name: 'Basic',
    price: 1988, // $19.88 in cents
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    features: [
      'Beatport scanning',
      'Traxsource scanning',
      'Genre & BPM filters',
      'Key filter (Camelot)',
      'Daily email digest',
      'Audio previews',
    ],
  },
  pro: {
    name: 'Pro',
    price: 3888, // $38.88 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Everything in Basic',
      'AI-powered curation',
      'Vibe matching',
      'Quality filtering',
      'Track descriptions',
      'Promo pool connection',
      'Priority support',
    ],
  },
} as const;

export const TRIAL_DAYS = 7;
