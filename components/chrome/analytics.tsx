'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

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

export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID

  return (
    <>
      <VercelAnalytics />
      {id && <GoogleAnalytics id={id} />}
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
