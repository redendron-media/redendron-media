import type { Metadata } from 'next'

import { QuoteForm } from '@/components/forms/quote-form'
import { Reveal } from '@/components/motion/reveal'
import { getSiteSettings } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Start a project',
  description:
    'Tell us what you are trying to move. Three short steps, and someone reads the whole thing.',
  alternates: { canonical: '/get-a-quote' },
  robots: { index: true, follow: true },
}

export default async function QuotePage() {
  const settings = await getSiteSettings().catch(() => null)
  const email = settings?.email || 'team@redendron.com'

  return (
    <section className="gutter pb-28 pt-40 lg:pb-40 lg:pt-52">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
        {/* The argument for filling it in sits alongside the form the whole
            way down, rather than above it where it scrolls away. */}
        <div className="lg:col-span-4">
          <Reveal className="lg:sticky lg:top-32">
            <p className="eyebrow text-accent">Start a project</p>
            <h1 className="mt-7 text-display-3 font-bold">
              Tell us what you&rsquo;re trying to move.
            </h1>
            <p className="mt-8 max-w-sm text-lead text-muted">
              Three short steps. No forms-for-the-sake-of-forms &mdash; every answer
              changes what we would actually propose.
            </p>
            <p className="mt-8 max-w-sm text-small text-muted">
              Prefer email?{' '}
              <a
                href={`mailto:${email}`}
                className="border-b hairline-2 pb-0.5 transition-colors hover:border-accent hover:text-accent"
              >
                {email}
              </a>
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <QuoteForm />
        </div>
      </div>
    </section>
  )
}
