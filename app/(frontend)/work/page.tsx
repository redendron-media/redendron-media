import type { Metadata } from 'next'

import { WorkGrid } from '@/components/home/work-grid'
import { Reveal } from '@/components/motion/reveal'
import { getFeaturedCaseStudies } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Case studies',
  description:
    'Selected work from Redendron Media — brand strategy, identity, websites and campaigns for brands that intend to last.',
  alternates: { canonical: '/work' },
}

export default async function WorkPage() {
  const studies = await getFeaturedCaseStudies(24)

  return (
    <>
      <section className="gutter pb-16 pt-40 lg:pb-24 lg:pt-52">
        <Reveal>
          <p className="eyebrow text-accent">Selected work</p>
          <h1 className="mt-7 max-w-4xl text-display-2 font-bold">
            The work is the argument.
          </h1>
          <p className="mt-8 max-w-xl text-lead text-muted">
            Strategy you can point at. Every project here started with a decision about
            positioning, not a mood board.
          </p>
        </Reveal>
      </section>

      <section className="gutter pb-28 lg:pb-40">
        {studies.length ? (
          <WorkGrid studies={studies} />
        ) : (
          <p className="text-lead text-muted">Case studies are on their way.</p>
        )}
      </section>
    </>
  )
}
