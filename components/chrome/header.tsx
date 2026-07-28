'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/packages', label: 'Packages' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Journal' },
]

export function Header() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
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

  // Close the overlay on navigation.
  useEffect(() => setOpen(false), [pathname])

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
          <Link href="/" className="relative block" aria-label="Redendron Media, home">
            {/* logolight is the light-ground lockup: oxblood mark, ink
                wordmark. logodark is the reversed one. Both are rendered and
                crossfaded by the ground - a two-colour mark cannot simply
                inherit currentColor. */}
            <span className="relative block h-8 w-auto lg:h-9">
              <Image
                src="/logo/logolight.svg"
                alt="Redendron Media"
                width={62}
                height={22}
                priority
                data-logo="light"
                className="h-8 w-auto transition-opacity duration-500 ease-brand lg:h-9"
              />
              <Image
                src="/logo/logodark.svg"
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative text-small transition-colors duration-200',
                    active ? 'text-oxblood' : 'text-(--on-ground) hover:text-oxblood'
                  )}
                >
                  {item.label}
                  {/* Underline wipes in from the left on hover. */}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-px w-full origin-left bg-oxblood transition-transform duration-300 ease-brand',
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              )
            })}

            <Link
              href="/get-a-quote"
              className="group relative overflow-hidden border border-(--on-ground) px-5 py-2.5 text-small"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-(--ground)">
                Start a project
              </span>
              {/* Fill wipes up from the bottom. */}
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-(--on-ground) transition-transform duration-300 ease-brand group-hover:scale-y-100" />
            </Link>
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
        <nav className="gutter flex h-full flex-col justify-center gap-2" aria-label="Mobile">
          {[...NAV, { href: '/get-a-quote', label: 'Start a project' }].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              className="text-display-3 font-bold transition-transform duration-500 ease-brand hover:text-oxblood"
              style={{
                transform: open ? 'translateY(0)' : 'translateY(1.5rem)',
                opacity: open ? 1 : 0,
                transitionDelay: `${open ? 80 + i * 55 : 0}ms`,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
