import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/reveal'
import { ScrollStatement } from '@/components/motion/scroll-statement'
import { PrimaryLink } from '@/components/ui/cta'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Born in Gangtok, Sikkim. We help brands find the unshakable core that makes them anti-fragile — not just resilient, but stronger when tested.',
  alternates: { canonical: '/about' },
}

/**
 * The eight values, carried over from the old site because the words were
 * already right. The team section that sat below them there is not carried
 * over: it was still lorem ipsum in production, and an empty section is more
 * honest than a fake one.
 */
const VALUES = [
  {
    title: 'Think forward',
    body: 'We approach each project like a blank canvas — informed by first principles, cultural insight, and a willingness to disrupt the default.',
  },
  {
    title: 'Build with strategy',
    body: 'Every output is tied to a larger strategic outcome. Nothing here is ever just design.',
  },
  {
    title: 'Create like a craftsman',
    body: 'Creativity as a discipline. We prototype early, iterate often, and treat every deliverable as a reflection of intentional craft.',
  },
  {
    title: 'Open systems, open minds',
    body: 'We thrive on information flow. Transparent, accessible systems unlock smarter ideas and faster feedback.',
  },
  {
    title: 'Stay human',
    body: 'We design for context, empathy and lived experience — not personas and pixels.',
  },
  {
    title: 'Own the process',
    body: 'From daily standups to weekly reviews, we run on rhythm. We document, evaluate and refine relentlessly.',
  },
  {
    title: 'Iterate to infinity',
    body: 'Every version is a draft. Always testing, learning, evolving — not chasing perfection, but progress.',
  },
  {
    title: 'Leverage wisely',
    body: 'Judgment over hustle. We choose leverage — of tools, thinking, systems and networks — to scale impact without burning out.',
  },
]

export default function AboutPage() {
  return (
    <>
      <section className="gutter pb-16 pt-40 lg:pb-24 lg:pt-52">
        <Reveal>
          <p className="eyebrow text-accent">About</p>
          <h1 className="mt-7 max-w-4xl text-display-2 font-bold">
            We don&rsquo;t chase trends. We chase truth.
          </h1>
          <p className="mt-8 max-w-xl text-lead text-muted">
            In a world drowning in digital noise, we help brands find their unshakable core
            &mdash; the raw, human heartbeat that makes them anti-fragile. Not just resilient,
            but stronger when tested.
          </p>
        </Reveal>
      </section>

      <section data-ground="ink" className="on-ink gutter py-28 lg:py-40">
        <ScrollStatement
          eyebrow="Where we are from"
          text="Born in Gangtok, Sikkim. Our roots keep us grounded. Marketing is not about shouting louder — it is about speaking truer."
        />
      </section>

      <section className="gutter py-20 lg:py-28">
        <Reveal className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 className="text-h1 font-bold lg:col-span-5">Your brand is a legacy.</h2>
          <div className="max-w-xl space-y-6 lg:col-span-7">
            <p className="text-lead text-muted">
              It is the late nights, the calloused hands, the &ldquo;why&rdquo; that keeps you
              awake yet alive. That is why we weave strategies steeped in honesty, not hype.
            </p>
            <p className="text-body text-muted">
              From Himalayan villages to global stages, we help you turn sincerity into your
              sharpest edge &mdash; because profit without purpose is hollow, but purpose
              without profit is unsustainable. For the dreamers, the artisans, the brands who
              refuse to compromise their values for vanity metrics, we craft narratives that
              don&rsquo;t just sell. They resonate.
            </p>
          </div>
        </Reveal>
      </section>

      <section data-ground="dim" className="gutter bg-paper-dim py-24 lg:py-32">
        <Reveal className="mb-14 lg:mb-20">
          <p className="eyebrow text-accent">How we work</p>
          <h2 className="mt-5 max-w-2xl text-h1 font-bold">
            Systems for relevance, resonance and results.
          </h2>
        </Reveal>

        <Reveal stagger className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <div key={value.title} className="border-t hairline pt-5">
              <span className="eyebrow text-accent tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-h3 font-bold">{value.title}</h3>
              <p className="mt-3 text-small text-muted">{value.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="gutter py-24 lg:py-32">
        <Reveal>
          <h2 className="max-w-3xl text-display-3 font-bold">
            Let&rsquo;s build something that outlasts algorithms.
          </h2>
          <PrimaryLink href="/get-a-quote" className="mt-10">
            Start a project
          </PrimaryLink>
        </Reveal>
      </section>
    </>
  )
}
