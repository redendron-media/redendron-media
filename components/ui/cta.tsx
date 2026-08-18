import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The site's call-to-action links.
 *
 * Two shapes only, because a marketing page with three button weights reads
 * as three competing offers. Both use the same fill-wipes-up-from-the-bottom
 * motion as the header CTA, so pressing anything on the site feels the same.
 */

const PRIMARY =
  'group relative inline-flex items-center gap-2 overflow-hidden bg-accent px-8 py-4 text-small text-paper'

const GHOST =
  'group relative inline-flex items-center gap-2 overflow-hidden border border-(--on-ground) px-8 py-4 text-small'

/**
 * Primary: solid oxblood at rest, ink on hover.
 *
 * Deliberately coloured rather than neutral - it is the only element on a
 * page allowed to claim the eye that hard, so it has to be unmistakably the
 * brand rather than "a dark rectangle".
 */
export function PrimaryLink({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={cn(PRIMARY, className)}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-400 ease-brand group-hover:scale-y-100" />
    </Link>
  )
}

/**
 * The same button, as a span.
 *
 * For rows where the whole card is already the link: a nested <a> would be
 * invalid, but the affordance still has to look like the button it is. Set
 * `hover` to the ancestor's group name so the wipe still fires - by default
 * it responds to the nearest `group`.
 */
export function PrimaryTag({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span className={cn(PRIMARY, className)}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-400 ease-brand group-hover:scale-y-100" />
    </span>
  )
}

/** The primary button, as a real <button>. Same paint, different element. */
export function PrimaryButton({
  className,
  children,
  ...rest
}: ComponentProps<'button'>) {
  return (
    <button {...rest} className={cn(PRIMARY, 'disabled:opacity-60', className)}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-400 ease-brand group-hover:scale-y-100" />
    </button>
  )
}

/** The secondary button, as a real <button>. */
export function GhostButton({ className, children, ...rest }: ComponentProps<'button'>) {
  return (
    <button {...rest} className={cn(GHOST, className)}>
      <span className="relative z-10 transition-colors duration-300 group-hover:text-(--ground)">
        {children}
      </span>
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-(--on-ground) transition-transform duration-400 ease-brand group-hover:scale-y-100" />
    </button>
  )
}

/**
 * Secondary: an outline in whatever the current ground's ink is, filling with
 * it on hover. Ground-relative so it survives the page-wide crossfade.
 */
export function GhostLink({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={cn(GHOST, className)}>
      <span className="relative z-10 transition-colors duration-300 group-hover:text-(--ground)">
        {children}
      </span>
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-(--on-ground) transition-transform duration-400 ease-brand group-hover:scale-y-100" />
    </Link>
  )
}
