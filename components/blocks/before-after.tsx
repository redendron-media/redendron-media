'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

type Side = { url: string; alt: string }

/**
 * Draggable before/after comparison.
 *
 * Keyboard accessible via a real range input rather than a div with pointer
 * handlers - the slider is the control, styled to look like a handle.
 */
export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: Side
  after: Side
  beforeLabel: string
  afterLabel: string
}) {
  const [position, setPosition] = useState(50)
  const wrap = useRef<HTMLDivElement>(null)

  const onPointer = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return
    const rect = wrap.current?.getBoundingClientRect()
    if (!rect) return
    setPosition(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)))
  }, [])

  return (
    <div
      ref={wrap}
      className="relative aspect-16/9 w-full touch-pan-y select-none overflow-hidden bg-bone"
      onPointerDown={onPointer}
      onPointerMove={onPointer}
    >
      <Image src={after.url} alt={after.alt} fill sizes="100vw" className="object-cover" />

      {/* Before is clipped to the slider position. */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={before.url} alt={before.alt} fill sizes="100vw" className="object-cover" />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-paper mix-blend-difference"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper text-small text-paper">
          &harr;
        </span>
      </div>

      <span className="pointer-events-none absolute bottom-4 left-4 bg-ink/70 px-2.5 py-1 text-small text-paper">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 bg-ink/70 px-2.5 py-1 text-small text-paper">
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={`Reveal ${beforeLabel} or ${afterLabel}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}
