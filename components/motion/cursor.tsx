'use client'

import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'

/**
 * A colour bubble that replaces the pointer over anything interactive.
 *
 * It is painted with `mix-blend-mode`, so it does not sit on top of what it
 * is over - it combines with it. Over paper the oxblood multiplies down into
 * the ink of the words; over something dark the mode flips to `screen` so it
 * lifts out instead of disappearing into it. That is the intersection effect,
 * and it is why the bubble is a single flat colour rather than something with
 * its own shading.
 *
 * The light/dark decision is made from the actual element under the pointer,
 * not from the page ground. Keying it to the ground looked right until the
 * pointer reached a dark button on a light page - the primary CTA fills with
 * ink on hover - where a multiplied oxblood bubble simply vanished.
 *
 * Pointer-driven and desktop-only. A touch device has no hover state to
 * respond to, and a bubble chasing taps around is noise.
 */

/** Anything that should get the bubble instead of an arrow. */
const INTERACTIVE = 'a[href], button:not([disabled]), [role="button"], summary, label'

/**
 * Perceived lightness of the first painted background at or above `el`.
 *
 * Walks up through transparent ancestors because most elements set no
 * background of their own, and returns 1 (light) if it reaches the top
 * without finding one - the page ground is light far more often than not.
 */
function backdropIsDark(el: Element | null): boolean {
  let node: Element | null = el
  for (let i = 0; node && i < 8; i++, node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor
    const m = bg.match(/[\d.]+/g)
    if (!m || m.length < 3) continue
    const alpha = m.length > 3 ? Number(m[3]) : 1
    if (alpha < 0.5) continue
    const [r, g, b] = m.map(Number)
    // Rec. 601 luma is close enough for a light/dark decision and far
    // cheaper than a full contrast calculation on every pointer move.
    return (r * 0.299 + g * 0.587 + b * 0.114) / 255 < 0.5
  }
  return false
}

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    if (reduced) return
    // `fine` excludes touch; `hover` excludes stylus-only and TV browsers.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const el = dot.current
    if (!el) return
    const root = document.documentElement
    root.dataset.cursor = 'on'

    // Target and eased position, so the bubble trails slightly rather than
    // being welded to the pointer - a rigid follower reads as a rendering
    // artefact, a lagging one reads as a thing.
    let tx = -100
    let ty = -100
    let x = tx
    let y = ty
    let over = false
    let raf = 0
    let idle = false

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null
      const next = Boolean(hit)
      if (next !== over) {
        over = next
        el.dataset.over = over ? 'true' : 'false'
      }
      if (next) {
        const dark = backdropIsDark(hit) ? 'true' : 'false'
        if (el.dataset.dark !== dark) el.dataset.dark = dark
      }
      if (idle) {
        idle = false
        raf = requestAnimationFrame(tick)
      }
    }

    const onLeave = () => {
      over = false
      el.dataset.over = 'false'
      tx = -100
      ty = -100
    }

    const tick = () => {
      x += (tx - x) * 0.22
      y += (ty - y) * 0.22
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${over ? 1 : 0})`
      // Stop burning frames once it has caught up and there is nothing to show.
      if (!over && Math.abs(tx - x) < 0.4 && Math.abs(ty - y) < 0.4) {
        idle = true
        return
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      delete root.dataset.cursor
    }
  }, [reduced])

  return (
    <div
      ref={dot}
      aria-hidden
      data-cursor-bubble
      data-over="false"
      data-dark="false"
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-14 w-14 rounded-full will-change-transform"
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
    />
  )
}
