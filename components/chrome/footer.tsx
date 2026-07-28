import Image from 'next/image'
import Link from 'next/link'

import { getSiteSettings } from '@/lib/payload'

const COLUMNS = [
  {
    title: 'Work',
    links: [
      { href: '/work', label: 'Case studies' },
      { href: '/services', label: 'Services' },
      { href: '/packages', label: 'Packages' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Journal' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [{ href: '/privacy-policy', label: 'Privacy policy' }],
  },
]

export async function Footer() {
  const settings = await getSiteSettings().catch(() => null)
  const email = settings?.email || 'team@redendron.com'
  const socials = settings?.socials || []

  return (
    <footer className="inverted relative z-10">
      <div className="gutter py-20 lg:py-28">
        {/* Oversized CTA - the last thing on every page is an invitation. */}
        <div className="border-b hairline pb-16 lg:pb-24">
          <p className="eyebrow text-faint">Have something in mind?</p>
          <Link href="/get-a-quote" className="group mt-6 block">
            <span className="text-display-2 font-bold leading-[0.92] tracking-tight">
              Let&rsquo;s build something
              <br />
              <span className="inline-flex items-baseline gap-4">
                worth remembering
                <span
                  aria-hidden
                  className="inline-block translate-x-0 text-oxblood transition-transform duration-500 ease-brand group-hover:translate-x-4"
                >
                  &rarr;
                </span>
              </span>
            </span>
          </Link>
        </div>

        <div className="grid gap-12 pt-16 lg:grid-cols-[2fr_repeat(3,1fr)]">
          <div>
            <Image
              src="/logo/logodark.svg"
              alt="Redendron Media"
              width={62}
              height={22}
              className="h-9 w-auto"
            />
            <p className="mt-4 max-w-xs text-small text-muted">
              {settings?.tagline ||
                'Anti-fragile brands, built from truth, strategy and craft.'}
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-6 inline-block border-b hairline-2 pb-0.5 text-small transition-colors hover:border-oxblood hover:text-oxblood"
            >
              {email}
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-faint">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-small text-muted transition-colors hover:text-(--on-ground)"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t hairline pt-8 text-small text-faint sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Redendron Media. All rights reserved.</p>
          {socials.length > 0 && (
            <ul className="flex gap-6">
              {socials.map((s) => (
                <li key={s.id ?? s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="capitalize transition-colors hover:text-(--on-ground)"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
