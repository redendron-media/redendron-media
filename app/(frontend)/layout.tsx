import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { Footer } from '@/components/chrome/footer'
import { Header } from '@/components/chrome/header'
import { MotionProvider } from '@/components/motion/motion-provider'
import { PageEntrance } from '@/components/motion/page-entrance'
import { SiteBackdrop } from '@/components/motion/site-backdrop'
import { getBranding, getServices } from '@/lib/payload'

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

/**
 * Resolved per request rather than static, because the favicon and the
 * fallback share image now come from the CMS.
 */
export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding()
  const description =
    branding.tagline ||
    'We build anti-fragile brands rooted in truth, strategy and craft. Born in Sikkim, built for global relevance.'

  return {
    metadataBase: new URL(siteUrl),
    icons: { icon: branding.favicon },
    title: {
      default: `${branding.siteName} — Brand strategy, design and marketing`,
      template: `%s — ${branding.siteName}`,
    },
    description,
    openGraph: {
      type: 'website',
      siteName: branding.siteName,
      locale: 'en_GB',
      url: siteUrl,
      images: branding.ogImage ? [{ url: branding.ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  }
}

export const viewport: Viewport = {
  themeColor: '#f4f2ed',
  colorScheme: 'light',
}

/**
 * Decides before first paint whether this visitor gets motion, so the reveal
 * pre-hide in CSS only applies when something will actually animate it back.
 * Must stay in step with the same check in MotionProvider.
 */
const MOTION_PROBE = `(function(){try{
var r=matchMedia('(prefers-reduced-motion: reduce)').matches,
c=matchMedia('(pointer: coarse)').matches,
w=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;
document.documentElement.dataset.motion=(r||(c&&w))?'off':'on'
}catch(e){document.documentElement.dataset.motion='off'}})()`

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [branding, services] = await Promise.all([getBranding(), getServices()])

  return (
    <html lang="en" className={neue.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_PROBE }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <MotionProvider>
          <PageEntrance />
          {/* Fixed ground + particle field, behind everything. Content sits
              above it on its own stacking level. */}
          <SiteBackdrop />
          <Header
            logoLight={branding.logoLight}
            logoDark={branding.logoDark}
            siteName={branding.siteName}
            services={services.map((s) => ({
              slug: s.slug!,
              title: s.title,
              tagline: s.tagline || undefined,
            }))}
          />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  )
}
