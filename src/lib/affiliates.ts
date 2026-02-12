// Affiliate Links & External Store Integration
// Traxscout = Discovery only. Users buy from stores directly.

/**
 * Beatport affiliate program
 * Apply at: https://www.beatport.com/affiliate-program
 */
const BEATPORT_AFFILIATE_ID = process.env.BEATPORT_AFFILIATE_ID || '';

/**
 * Traxsource affiliate program  
 * Apply at: https://www.traxsource.com/affiliate
 */
const TRAXSOURCE_AFFILIATE_ID = process.env.TRAXSOURCE_AFFILIATE_ID || '';

/**
 * Generate Beatport purchase link with affiliate tracking
 */
export function getBeatportLink(trackId: string, trackSlug?: string): string {
  const baseUrl = trackSlug 
    ? `https://www.beatport.com/track/${trackSlug}/${trackId}`
    : `https://www.beatport.com/track/-/${trackId}`;
  
  if (BEATPORT_AFFILIATE_ID) {
    return `${baseUrl}?ref=${BEATPORT_AFFILIATE_ID}`;
  }
  return baseUrl;
}

/**
 * Generate Traxsource purchase link with affiliate tracking
 */
export function getTraxsourceLink(trackId: string): string {
  const baseUrl = `https://www.traxsource.com/track/${trackId}`;
  
  if (TRAXSOURCE_AFFILIATE_ID) {
    return `${baseUrl}?ref=${TRAXSOURCE_AFFILIATE_ID}`;
  }
  return baseUrl;
}

/**
 * Generate preview player embed (no file hosting)
 * Uses store's official embed/widget
 */
export function getBeatportPreviewEmbed(trackId: string): string {
  // Beatport offers an official widget
  return `https://embed.beatport.com/?id=${trackId}&type=track`;
}

/**
 * Get external link based on source
 */
export function getStoreLink(
  source: 'beatport' | 'traxsource' | 'promo',
  externalId: string,
  slug?: string
): string {
  switch (source) {
    case 'beatport':
      return getBeatportLink(externalId, slug);
    case 'traxsource':
      return getTraxsourceLink(externalId);
    case 'promo':
      // Promo pool tracks - link back to pool or no link
      return '';
    default:
      return '';
  }
}

/**
 * Track affiliate click for analytics
 */
export function trackAffiliateClick(
  userId: string,
  source: string,
  trackId: string
): void {
  // Log for analytics - helps understand conversion
  console.log(`[Affiliate] User ${userId} clicked ${source} track ${trackId}`);
  // TODO: Store in analytics table
}
