# Traxscout Security Architecture

## Overview

This document outlines the security measures implemented to protect Traxscout, its users, and our proprietary intellectual property.

---

## 🔐 Intellectual Property Protection

### Prompt Protection
Our AI curation prompts are proprietary and protected by:

| Measure | Implementation |
|---------|----------------|
| Server-side only | Prompts never sent to client |
| Obfuscation | Prompts stored encoded, assembled at runtime |
| No API exposure | Responses contain results only, never prompts |
| Runtime checks | Throws error if accessed client-side |
| Object freezing | Prevents runtime modification |

### Code Protection
| Measure | Implementation |
|---------|----------------|
| Source maps disabled | `productionBrowserSourceMaps: false` |
| Minification | Aggressive terser settings |
| Variable mangling | All non-public names obfuscated |
| Console removal | `removeConsole` in production |
| Chunk splitting | Business logic separated from UI |

### Anti-Copying Measures
| Measure | Implementation |
|---------|----------------|
| Output watermarking | User ID encoded in response metadata |
| Response fingerprinting | Traceable response IDs |
| Scraping detection | Behavior analysis for bot detection |
| Rate limiting | Per-user API limits |
| CORS enforcement | Strict origin allowlist |

### Repository Security
| Measure | Implementation |
|---------|----------------|
| Private repo | GitHub private repository |
| CODEOWNERS | Critical files require Med's approval |
| Secret scanning | GitHub + CI checks for leaked secrets |
| Audit logs | All access logged |
| Branch protection | Main branch requires review |

---

## 1. Authentication & Authorization

### Supabase Auth
- Email/password + OAuth (Google)
- JWT tokens with short expiry (1 hour)
- Refresh token rotation
- Email verification required

### Session Security
- HTTP-only cookies
- Secure flag (HTTPS only)
- SameSite=Strict
- CSRF protection via origin validation

### Row Level Security (RLS)
- All database tables have RLS enabled
- Users can only access their own data
- Service role used only server-side

---

## 2. Data Encryption

### At Rest
- **User API Keys**: AES-256-GCM encryption
  - PBKDF2 key derivation (100,000 iterations)
  - Random salt per encryption
  - Authentication tag validation
- **Promo Sessions**: AES-256-GCM encryption
- **Database**: Supabase encryption at rest

### In Transit
- TLS 1.3 enforced
- HSTS enabled (1 year, includeSubDomains, preload)
- Certificate pinning for API calls

### Key Management
- ENCRYPTION_KEY: 32+ character secret, stored in environment
- Key rotation procedure documented
- Separate keys per environment (dev/staging/prod)

---

## 3. API Security

### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 req | 1 min |
| Auth routes | 10 req | 15 min |
| Scan triggers | 5 req | 1 hour |
| Checkout | 5 req | 1 min |

### Input Validation
- Zod schemas for all API inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- Email format validation

### Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [strict policy]
Strict-Transport-Security: max-age=31536000
```

---

## 4. Payment Security (Stripe)

### PCI Compliance
- Stripe.js handles card data (never touches our servers)
- Stripe Elements for payment forms
- Webhook signature verification

### Subscription Security
- Webhook events verified with signing secret
- Idempotency keys for operations
- Subscription status synced to database

---

## 5. BYOK (Bring Your Own Key) Security

### User API Key Handling
1. User enters API key in browser
2. Key sent over HTTPS to our API
3. Key encrypted with AES-256-GCM
4. Encrypted key stored in database
5. Only last 4 chars stored in plain text (for UI)

### Key Usage
1. Encrypted key retrieved from database
2. Decrypted in memory (server-side only)
3. Used for single API call
4. Never logged or cached

### Key Validation
- Format validation before storage
- Optional: Test API call to verify key works
- Usage tracking (count, last used)

---

## 6. Infrastructure Security

### Hosting (Vercel)
- DDoS protection included
- Edge network with automatic scaling
- Environment variable encryption
- Preview deployments isolated

### Database (Supabase)
- Managed PostgreSQL
- Daily backups (7-day retention)
- Point-in-time recovery available
- Connection pooling (PgBouncer)
- SSL required for connections

### DNS (Porkbun)
- 2FA enabled ✅
- DNSSEC available
- Registrar lock enabled

---

## 7. Monitoring & Alerting

### Error Tracking
- Sentry for error monitoring
- Source maps for stack traces
- User context (anonymized)

### Uptime Monitoring
- Better Uptime / Pingdom
- 1-minute check intervals
- Slack/email alerts

### Security Monitoring
- Failed login attempt tracking
- Unusual API usage patterns
- Suspicious IP blocking

### Audit Logging
- All security events logged
- 90-day retention
- User ID, IP, action, timestamp

---

## 8. Backup & Recovery

### Database Backups
- Daily automated backups (Supabase)
- 7-day retention (Pro plan)
- Point-in-time recovery (PITR)

### Disaster Recovery
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 24 hours
- Runbook documented for common scenarios

### Additional Backups
- Weekly pg_dump to S3 (recommended)
- Configuration in version control
- Secrets in password manager

---

## 9. Incident Response

### Severity Levels
| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Data breach, complete outage | Immediate |
| High | Partial outage, security vulnerability | < 1 hour |
| Medium | Degraded performance | < 4 hours |
| Low | Minor issue | < 24 hours |

### Response Procedure
1. Detect (monitoring alerts)
2. Assess (severity, scope)
3. Contain (isolate if needed)
4. Eradicate (fix root cause)
5. Recover (restore service)
6. Document (post-mortem)

---

## 10. Security Checklist

### Pre-Launch
- [ ] All secrets in environment variables
- [ ] ENCRYPTION_KEY is 32+ chars, random
- [ ] Stripe webhook secret configured
- [ ] Rate limiting tested
- [ ] RLS policies verified
- [ ] Security headers verified
- [ ] SSL certificate valid
- [ ] 2FA on all service accounts

### Ongoing
- [ ] Weekly dependency updates
- [ ] Monthly security review
- [ ] Quarterly penetration test
- [ ] Annual security audit

---

## Reporting Security Issues

If you discover a security vulnerability, please email:
**security@traxscout.app**

Do not disclose publicly until we've had a chance to address it.
