# Traxscout Legal & Compliance

## Business Model

**Traxscout is a music discovery service for DJs.**

We help DJs find new tracks faster by:
1. Scanning public release information from Beatport and Traxsource
2. Filtering based on user preferences (genre, BPM, key)
3. Optionally applying AI curation for Pro users
4. Delivering curated track lists via email/dashboard

**We do NOT:**
- Sell music
- Host audio files
- Provide downloads
- Bypass paywalls
- Store copyrighted content

**Users purchase directly from stores** (Beatport, Traxsource) via external links.

---

## Data We Access

### Public Information Only
All track metadata we collect is publicly available on store websites:

| Data | Source | Public |
|------|--------|--------|
| Artist name | Store listing | ✅ Yes |
| Track title | Store listing | ✅ Yes |
| Label name | Store listing | ✅ Yes |
| Genre | Store listing | ✅ Yes |
| BPM | Store listing | ✅ Yes |
| Key | Store listing | ✅ Yes |
| Release date | Store listing | ✅ Yes |
| Artwork URL | Store CDN | ✅ Yes (linked, not hosted) |
| Preview URL | Store embed | ✅ Yes (their player, not our file) |

### What We Don't Access
- Full audio files
- Purchase/download links (behind paywall)
- User purchase history from stores
- Private store APIs (without permission)

---

## Store Terms Compliance

### Beatport
- We access publicly visible release information
- We link to their purchase pages (with affiliate ID if approved)
- We use their official embed player for previews
- We do not circumvent their paywall

### Traxsource
- We access publicly visible release information
- We link to their purchase pages (with affiliate ID if approved)
- We do not download or redistribute their content

### Promo Pools (Inflyte, etc.)
- User connects their OWN account
- We access only what the user has access to
- We never share promo content between users
- We don't store audio files

---

## Affiliate Relationships

We may participate in affiliate programs:
- Beatport Affiliate Program
- Traxsource Affiliate Program

This means we may earn a commission when users purchase tracks through our links. This is disclosed in our Terms of Service.

---

## User Data Handling

See SECURITY.md for full details. Summary:

| User Data | How We Handle |
|-----------|---------------|
| Email | Stored in Supabase, used for auth + digests |
| Preferences | Stored to personalize results |
| API Keys (BYOK) | Encrypted with AES-256-GCM |
| Promo Sessions | Encrypted, user's own credentials |
| Track History | Stored for personalization |

We never sell user data to third parties.

---

## DMCA Compliance

If any rights holder believes we are infringing:
1. We display only publicly available metadata
2. We link to official store pages
3. We do not host copyrighted audio

Contact: legal@traxscout.app

---

## Terms of Service (Summary)

Users agree to:
- Use service for personal DJ research only
- Not scrape or redistribute our curated results
- Not share their account credentials
- Provide their own AI API keys (Pro tier)
- Purchase music through official store links

Full ToS at: https://traxscout.app/terms

---

## Privacy Policy (Summary)

- We collect: email, preferences, usage data
- We encrypt: API keys, session tokens
- We don't sell: any user data
- We retain: data while account is active
- Users can: delete their account and all data

Full Privacy Policy at: https://traxscout.app/privacy

---

## Jurisdiction

Traxscout operates under US law. 

For EU users: We comply with GDPR requirements for data handling, consent, and right to deletion.
