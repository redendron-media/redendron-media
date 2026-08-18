'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { PrimaryLink } from '@/components/ui/cta'
import { cn } from '@/lib/utils'

/**
 * Services is deliberately absent: it has no page of its own. It is a menu
 * that drops the visitor straight onto the service they came for, because an
 * index page listing six services is a page nobody wants to be on.
 */
const NAV: { href: string; label: string; menu?: true }[] = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services', menu: true },
  { href: '/packages', label: 'Packages' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Journal' },
]

export type NavService = { slug: string; title: string; tagline?: string }

export function Header({
  logoLight,
  logoDark,
  siteName,
  services,
}: {
  logoLight: string
  logoDark: string
  siteName: string
  services: NavService[]
}) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const lastY = useRef(0)
  const pathname = usePathname()
  const { lenis } = useMotion()

  // Hide on scroll down, reveal on scroll up. Reading from Lenis when it is
  // running avoids a second scroll listener fighting it.
  useEffect(() => {
    const onScroll = (y: number) => {
      setScrolled(y > 24)
      setHidden(y > 240 && y > lastY.current)
      lastY.current = y
    }

    if (lenis) {
      const handler = ({ scroll }: { scroll: number }) => onScroll(scroll)
      lenis.on('scroll', handler)
      return () => lenis.off('scroll', handler)
    }

    const handler = () => onScroll(window.scrollY)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [lenis])

  // A short close delay, so crossing the gap between the label and the panel
  // does not shut it in the visitor's face.
  const openServices = () => {
    window.clearTimeout(closeTimer.current)
    setServicesOpen(true)
  }
  const scheduleCloseServices = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 160)
  }
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Close the overlay on navigation.
  useEffect(() => {
    setOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // The menu closes when the header hides itself on a scroll-down, otherwise
  // it slides off the top still open and comes back the same way.
  useEffect(() => {
    if (hidden) setServicesOpen(false)
  }, [hidden])

  // Lock scrolling behind the mobile overlay.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-brand',
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        {/* The header floats over a ground that changes colour as you scroll,
            so it tints itself from --ground / --on-ground rather than
            hard-coding paper. Over the inverted bands it goes dark with the
            page instead of sitting on it as a light bar. */}
        <div
          className={cn(
            'gutter flex items-center justify-between text-(--on-ground) transition-[padding,background-color] duration-500 ease-brand',
            scrolled && !open
              ? 'bg-[color-mix(in_srgb,var(--ground)_85%,transparent)] py-4 backdrop-blur-md'
              : 'bg-transparent py-6 lg:py-8'
          )}
        >
          <Link href="/" className="relative block" aria-label={`${siteName}, home`}>
            {/* logolight is the light-ground lockup: oxblood mark, ink
                wordmark. logodark is the reversed one. Both are rendered and
                crossfaded by the ground - a two-colour mark cannot simply
                inherit currentColor. */}
            <span className="relative block h-8 w-auto lg:h-9">
              {/* Plain img: these are SVGs from the media library, and
                  next/image refuses to optimise SVG without
                  dangerouslyAllowSVG - which is not worth turning on for two
                  files that have nothing to optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoLight}
                alt={siteName}
                width={62}
                height={22}
                data-logo="light"
                className="h-8 w-auto transition-opacity duration-500 ease-brand lg:h-9"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoDark}
                alt=""
                width={62}
                height={22}
                aria-hidden
                data-logo="dark"
                className="absolute inset-0 h-8 w-auto transition-opacity duration-500 ease-brand lg:h-9"
              />
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              const underline = (
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ease-brand',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )}
                />
              )

              // Services has no page of its own, so its label is a menu
              // trigger rather than a link. Opening on hover keeps it as
              // quick as the other items; the button and the Escape key are
              // what make it reachable without a pointer.
              if (item.menu) {
                if (!services.length) return null
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={openServices}
                    onMouseLeave={scheduleCloseServices}
                    onFocus={openServices}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setServicesOpen(false)
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setServicesOpen((v) => !v)}
                      onKeyDown={(e) => e.key === 'Escape' && setServicesOpen(false)}
                      aria-expanded={servicesOpen}
                      aria-controls="services-menu"
                      className={cn(
                        'group relative flex items-center gap-1.5 text-small transition-colors duration-200',
                        active || servicesOpen
                          ? 'text-accent'
                          : 'text-(--on-ground) hover:text-accent'
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={cn(
                          'text-[0.6em] transition-transform duration-300 ease-brand',
                          servicesOpen && 'rotate-180'
                        )}
                      >
                        &#9660;
                      </span>
                      <span
                        className={cn(
                          'absolute -bottom-1 left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ease-brand',
                          active || servicesOpen
                            ? 'scale-x-100'
                            : 'scale-x-0 group-hover:scale-x-100'
                        )}
                      />
                    </button>

                    {/* Kept mounted and faded, so the pointer can travel from
                        the label into the panel without the gap closing it. */}
                    <div
                      id="services-menu"
                      className={cn(
                        'absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-5 transition-[opacity,transform] duration-300 ease-brand',
                        servicesOpen
                          ? 'pointer-events-auto translate-y-0 opacity-100'
                          : 'pointer-events-none -translate-y-1 opacity-0'
                      )}
                    >
                      <div className="rounded-lg bg-(--ground) p-2 shadow-(--shadow-card-lift) ring-1 ring-current/10">
                        {services.map((service) => (
                          <Link
                            key={service.slug}
                            href={`/services/${service.slug}`}
                            tabIndex={servicesOpen ? 0 : -1}
                            className="block rounded-md px-4 py-3 transition-colors duration-200 hover:bg-accent hover:text-paper"
                          >
                            <span className="block text-small font-medium">{service.title}</span>
                            {service.tagline && (
                              <span className="mt-1 block text-small opacity-60">
                                {service.tagline}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative text-small transition-colors duration-200',
                    active ? 'text-accent' : 'text-(--on-ground) hover:text-accent'
                  )}
                >
                  {item.label}
                  {/* Underline wipes in from the left on hover. */}
                  {underline}
                </Link>
              )
            })}

            {/* Same primary button as everywhere else, just tighter - the
                header is not the place to introduce a fourth button style. */}
            <PrimaryLink href="/get-a-quote" className="px-5 py-2.5">
              Start a project
            </PrimaryLink>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span
              className={cn(
                'block h-px w-6 bg-(--on-ground) transition-transform duration-300',
                open && 'translate-y-[3.5px] rotate-45'
              )}
            />
            <span
              className={cn(
                'block h-px w-6 bg-(--on-ground) transition-transform duration-300',
                open && '-translate-y-[3.5px] -rotate-45'
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-nav"
        className={cn(
          'fixed inset-0 z-40 bg-paper transition-opacity duration-400 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!open}
      >
        <nav
          className="gutter flex h-full flex-col justify-center gap-2 overflow-y-auto py-24"
          aria-label="Mobile"
        >
          {/* No hover on a phone, so the menu is flattened: the services are
              listed in place of the trigger, one tap each. */}
          {NAV.flatMap((item) =>
            item.menu
              ? [
                  { href: null, label: item.label, small: false },
                  ...services.map((service) => ({
                    href: `/services/${service.slug}`,
                    label: service.title,
                    small: true,
                  })),
                ]
              : [{ href: item.href, label: item.label, small: false }]
          )
            .concat([{ href: '/get-a-quote', label: 'Start a project', small: false }])
            .map((item, i) => {
              const style = {
                transform: open ? 'translateY(0)' : 'translateY(1.5rem)',
                opacity: open ? 1 : 0,
                transitionDelay: `${open ? 80 + i * 40 : 0}ms`,
              }

              // The Services label has nowhere to go, so it is a heading here
              // rather than a dead link.
              if (!item.href) {
                return (
                  <p
                    key={item.label}
                    className="mt-4 text-display-3 font-bold transition-transform duration-500 ease-brand"
                    style={style}
                  >
                    {item.label}
                  </p>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  className={cn(
                    'font-bold transition-transform duration-500 ease-brand hover:text-accent',
                    item.small ? 'pl-6 text-h2 text-muted' : 'mt-4 text-display-3 first:mt-0'
                  )}
                  style={style}
                >
                  {item.label}
                </Link>
              )
            })}
        </nav>
      </div>
    </>
  )
}
