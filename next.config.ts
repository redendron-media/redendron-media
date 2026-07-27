import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Media is served from this app in development and from Vercel Blob in
    // production. The Sanity and Facebook patterns are gone with Sanity, and
    // the old `/api/:path*` proxy to api.sembark.com - an unrelated third
    // party - has been removed entirely.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
  },

  // SVGs imported as React components. Next 16 runs Turbopack by default, so
  // this replaces the old `webpack()` rule, which would no longer apply.
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  async redirects() {
    // The old site used camelCase paths. Preserve inbound links and search
    // equity by permanently redirecting them to the new kebab-case URLs.
    const legacy: Array<[string, string]> = [
      ['/caseStudies', '/case-studies'],
      ['/caseStudies/:slug', '/case-studies/:slug'],
      ['/aboutUs', '/about'],
      ['/getAQuote', '/get-a-quote'],
      ['/privacyPolicy', '/privacy-policy'],
    ]
    return legacy.map(([source, destination]) => ({ source, destination, permanent: true }))
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
