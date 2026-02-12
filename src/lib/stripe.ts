// Stripe Configuration

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

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
