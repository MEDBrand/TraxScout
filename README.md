# Traxscout

AI-powered track discovery for DJs.

## Overview

Traxscout automatically scans music sources (Beatport, Traxsource, promo pools) and delivers filtered/curated track lists based on your preferences.

## Features

### Basic Tier ($19.99/mo)
- Beatport scanning
- Traxsource scanning
- Promo pool connection (via browser extension)
- Genre, BPM, label filters
- Daily/weekly email digests

### Pro Tier ($39.99/mo)
- Everything in Basic
- AI-powered curation (user provides API key)
- Vibe matching
- Quality filtering
- Track descriptions

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **AI:** User's Anthropic/OpenAI key
- **Email:** Resend

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and config
├── services/
│   ├── scanners/     # Beatport, Traxsource, promo pool scanners
│   ├── ai/           # AI curation service
│   └── delivery/     # Email/notification delivery
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (Email)
RESEND_API_KEY=

# Encryption
ENCRYPTION_KEY=
```

## Spec

Full product specification: `/specs/track-scout-app-spec.md`

## Status

🚧 Under development

### Done
- [x] Project scaffolding
- [x] Type definitions
- [x] Scanner base class
- [x] Beatport scanner
- [x] Traxsource scanner
- [x] AI curator service
- [x] Landing page

### TODO
- [ ] Auth setup (Supabase)
- [ ] Stripe integration
- [ ] Onboarding flow
- [ ] Dashboard
- [ ] Email delivery
- [ ] Browser extension
- [ ] Promo pool scanner
- [ ] API routes
- [ ] Cron jobs

---

**Domain:** traxscout.app (Porkbun)

Built by MEDNAS
