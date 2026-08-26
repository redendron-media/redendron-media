import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://redendron.com').replace(/\/$/, '')

/**
 * The old site shipped neither robots.txt nor a sitemap. Both matter more
 * than usual here, because this build changes almost every URL on the site
 * and crawlers need to be pointed at the new set.
 *
 * `/admin` and `/api` are disallowed rather than left to chance: Payload
 * mounts both, and neither belongs in an index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
