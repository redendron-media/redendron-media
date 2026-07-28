'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'

type Logo = { id: string; name: string; url: string }

/**
 * Infinite logo marquee.
 *
 * The track is duplicated once and translated by exactly -50%, so the loop
 * point is seamless. Driven by rAF rather than a CSS animation so it can
 * react to scroll direction and pause off-screen.
 */
export function ClientMarquee({ logos }: { logos: Logo[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    const track = trackRef.current
    const wrap = wrapRef.current
    if (!track || !wrap || reduced) return

    let offset = 0
    let raf = 0
    let visible = true
    let last = performance.now()

    // Stop burning frames when the marquee is off-screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      last = performance.now()
    })
    io.observe(wrap)

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      if (visible) {
        offset -= dt * 0.028
        // The track holds two copies; wrapping at half its width is seamless.
        const half = track.scrollWidth / 2
        if (half > 0 && -offset >= half) offset += half
        track.style.transform = `translate3d(${offset}px,0,0)`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduced])

  if (!logos.length) return null

  // Reduced motion gets a static, wrapped grid rather than a frozen strip.
  if (reduced) {
    return (
      <div className="gutter flex flex-wrap items-center justify-center gap-x-12 gap-y-8 py-4">
        {logos.map((logo) => (
          <LogoMark key={logo.id} logo={logo} />
        ))}
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="relative overflow-hidden py-4">
      {/* Fade the strip into the page edges instead of cutting it. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent" />
      <div ref={trackRef} className="flex w-max items-center gap-16 will-change-transform">
        {[...logos, ...logos].map((logo, i) => (
          <LogoMark key={`${logo.id}-${i}`} logo={logo} aria-hidden={i >= logos.length} />
        ))}
      </div>
    </div>
  )
}

function LogoMark({ logo, ...rest }: { logo: Logo; 'aria-hidden'?: boolean }) {
  return (
    <div className="relative h-12 w-40 shrink-0 lg:h-16 lg:w-56" {...rest}>
      <Image
        src={logo.url}
        alt={rest['aria-hidden'] ? '' : logo.name}
        fill
        sizes="224px"
        // Full opacity, desaturated. Greyscale alone keeps the strip coherent
        // without the logos also looking faded or unfinished; colour returns
        // on hover.
        className="object-contain grayscale transition-[filter] duration-500 ease-brand hover:grayscale-0"
      />
    </div>
  )
}
