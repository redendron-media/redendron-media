'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

/**
 * Google Analytics 4.
 *
 * Renders nothing at all unless NEXT_PUBLIC_GA_ID is set, so local
 * development and preview deployments do not pollute the property.
 *
 * `send_page_view: false` plus an explicit send on every route change is
 * deliberate. The App Router navigates on the client, so gtag's automatic
 * page_view fires once on first load and never again - a site where every
 * visitor appears to read exactly one page. Sending it ourselves covers the
 * first render and every navigation after it, with no double count.
 */
function PageViews({ id }: { id: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    if (!gtag) return
    const query = searchParams.toString()
    gtag('event', 'page_view', {
      page_path: pathname + (query ? `?${query}` : ''),
      page_location: window.location.href,
      page_title: document.title,
      send_to: id,
    })
  }, [pathname, searchParams, id])

  return null
}

/**
 * Vercel Web Analytics, without the npm package.
 *
 * @vercel/analytics declares optional peers for every framework it supports,
 * and npm insists on resolving the Remix one against React 18 - so installing
 * it means either --legacy-peer-deps for the whole project or a build that can
 * fail on Vercel. The package is a thin loader for this same script; this is
 * Vercel's documented plain-HTML setup. Production builds only, because the
 * script is served by Vercel's edge and 404s anywhere else.
 */
function VercelAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null
  return (
    <>
      <Script id="va-init" strategy="afterInteractive">
        {`window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)}`}
      </Script>
      <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
    </>
  )
}

/** A custom event in both GA4 and Vercel Analytics. Safe to call when neither is loaded. */
export function trackEvent(name: string, data: Record<string, string | number | boolean> = {}) {
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void
    va?: (...args: unknown[]) => void
  }
  w.gtag?.('event', name, data)
  w.va?.('event', { name, data })
}

/** A custom event for the Meta Pixel. Safe to call when the pixel is not loaded. */
export function trackMetaEvent(name: string, data: Record<string, string | number | boolean> = {}) {
  const w = window as unknown as { fbq?: (...args: unknown[]) => void }
  w.fbq?.('trackCustom', name, data)
}

export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <>
      <VercelAnalytics />
      {id && <GoogleAnalytics id={id} />}
      {metaId && <MetaPixel id={metaId} />}
    </>
  )
}

/**
 * Meta Pixel, for conversion reporting in Redendron Ad Account.
 *
 * Like GA4 it renders nothing unless NEXT_PUBLIC_META_PIXEL_ID is set. The init
 * script sends the first PageView; MetaPageViews sends one for every client-side
 * navigation after it. No advanced matching: Meta is told that a form was sent,
 * never what was in it.
 */
function MetaPageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
    fbq?.('track', 'PageView')
  }, [pathname, searchParams])

  return null
}

function MetaPixel({ id }: { id: string }) {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');
fbq('track','PageView');`}
      </Script>
      <Suspense fallback={null}>
        <MetaPageViews />
      </Suspense>
    </>
  )
}

function GoogleAnalytics({ id }: { id: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;
gtag('js',new Date());
gtag('config','${id}',{send_page_view:false});`}
      </Script>
      {/* useSearchParams needs a boundary, or every page opts out of static
          rendering and the whole site turns dynamic. */}
      <Suspense fallback={null}>
        <PageViews id={id} />
      </Suspense>
    </>
  )
}
