import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import './globals.css'

/**
 * Helvetica Neue, converted from the original .otf files to .woff2
 * (1743kb -> 585kb). `display: swap` means text is readable immediately
 * rather than invisible while the face downloads.
 */
const neue = localFont({
  src: [
    { path: './fonts/HelveticaNeueLight.woff2', weight: '300', style: 'normal' },
    { path: './fonts/HelveticaNeueRoman.woff2', weight: '400', style: 'normal' },
    { path: './fonts/HelveticaNeueMedium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/HelveticaNeueBold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-neue',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redendron.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Redendron Media — Brand strategy, design and marketing',
    // Every page sets its own title; this is the wrapper.
    template: '%s — Redendron Media',
  },
  description:
    'We build anti-fragile brands rooted in truth, strategy and craft. Born in Sikkim, built for global relevance.',
  openGraph: {
    type: 'website',
    siteName: 'Redendron Media',
    locale: 'en_GB',
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#fdfad5',
  colorScheme: 'light',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={neue.variable}>
      <body>{children}</body>
    </html>
  )
}
