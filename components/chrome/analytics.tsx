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

export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  if (!id) return null

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
