import type { Metadata } from 'next'
import Image from 'next/image'

import { ClientMarquee } from '@/components/home/client-marquee'
import { AutoTestimonials } from '@/components/landing/auto-testimonials'
import { BookCallButton, BookingProvider } from '@/components/landing/booking'
import { CaseCarousel, type CaseCard } from '@/components/landing/case-carousel'
import { Reveal } from '@/components/motion/reveal'
import { asMedia, getClients, getFeaturedCaseStudies, getTestimonials } from '@/lib/payload'

const title = 'Free brand strategy call'
const description =
  'Stop gambling your marketing budget. Book a free 45-minute strategy call: we audit your brand, find where competitors are leaving the door open, and hand you a plan for your brand and your revenue.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/free-strategy-call' },
  robots: { index: true, follow: true },
  openGraph: { title: `${title} — Redendron Media`, description, url: '/free-strategy-call' },
}

/**
 * The order case studies appear in, strongest result first. Anything
 * published but not listed follows, so a new study still shows up.
 */
const CASE_ORDER = [
  'offbeat-sikkim',
  'easy-eats',
  'finova-finance',
  'dash',
  'cats-learning-centre',
  'agency-on-notion',
  'quadraplus',
  'sikkim-state-aids-control-society',
  'zor-sports',
  'crypto-gravity',
]

/** The three studies fanned out behind the hero copy. */
const HERO_STACK = ['offbeat-sikkim', 'finova-finance', 'easy-eats']

const FOUNDATIONS = [
  {
    title: 'Who you are for',
    body: 'The customers worth winning, described precisely enough that every ad, post and page speaks to them and nobody else.',
  },
  {
    title: 'What you stand for',
    body: 'The one idea your business can own, so people choose you for a reason instead of a discount.',
  },
  {
    title: 'Where the door is open',
    body: 'The gaps your competitors are leaving, and how to walk through them before they notice.',
  },
]

/** The home page's four stages (constants/branding.ts), a line each. */
const STAGES = [
  {
    title: 'Brand Strategy',
    body: 'Who you are for, what you stand for and how you beat competitors, grounded in real data.',
  },
  { title: 'Brand Expression', body: 'A logo, look and voice that say who you are at a glance.' },
  {
    title: 'Brand Presence',
    body: 'That identity carried consistently across your website, social media, packaging and email.',
  },
  { title: 'Marketing', body: 'Ads, content and PR that build the brand while they sell.' },
]

const STEPS = [
  { title: 'Pick a time', body: 'Thirty seconds. Choose a 45-minute slot that suits you.' },
  {
    title: 'We do our homework',
    body: 'Before the call we study your brand, your market and your competitors the way a customer would.',
  },
  {
    title: 'Leave with the formula',
    body: 'A strategic audit and a clear plan you can act on, whether or not you ever work with us.',
  },
]

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. Forty-five minutes, no card, no obligation. If we are not the right fit, we will tell you, and the plan is still yours.',
  },
  {
    q: 'Is this a sales pitch or a course?',
    a: 'Neither. No bootcamp, no course. It is a working session with the people who would actually do the work, built around your business.',
  },
  {
    q: 'What happens on the call?',
    a: 'We walk you through the audit we prepared: who you are for, what you stand for, and where your competitors are leaving the door open. Then we lay out the formula to fix it.',
  },
  {
    q: 'Do I need to prepare anything?',
    a: 'No. If you have a website or an Instagram page, mention it in the form and we will look at it beforehand.',
  },
]

export default async function FreeStrategyCallPage() {
  const [clients, testimonials, studies] = await Promise.all([
    getClients().catch(() => []),
    getTestimonials(12).catch(() => []),
    getFeaturedCaseStudies(40).catch(() => []),
  ])

  const logos = clients
    .map((c) => {
      const media = asMedia(c.logo)
      return media?.url ? { id: String(c.id), name: c.name, url: media.url } : null
    })
    .filter(Boolean) as { id: string; name: string; url: string }[]

  const rank = (slug?: string | null) => {
    const i = CASE_ORDER.indexOf(slug || '')
    return i === -1 ? CASE_ORDER.length : i
  }
  const cards: CaseCard[] = [...studies]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((s) => {
      const media = asMedia(s.coverImage)
      const url = media?.sizes?.card?.url || media?.url
      const metric = s.metrics?.[0]
      return {
        id: String(s.id),
        slug: s.slug,
        client: s.client || s.title,
        industry: s.industry,
        title: s.title,
        image: url ? { url, alt: media?.alt || s.title } : null,
        metric: metric ? { value: metric.value, label: metric.label } : null,
      }
    })

  const stack = HERO_STACK.map((slug) => cards.find((c) => c.slug === slug)).filter(
    (c): c is CaseCard => Boolean(c?.image)
  )
  const lead = stack[0]

  return (
    <BookingProvider>
      {/* ------------------------------------------------------------ hero -- */}
      <section className="gutter relative pb-14 pt-28 sm:pt-36 lg:grid lg:min-h-svh lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pb-20">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full border hairline-2 bg-paper-lift px-4 py-2 text-small">
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-oxblood opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-oxblood" />
            </span>
            Free 45-minute strategy call
          </p>

          <h1 className="mt-6 text-display-2 font-bold lg:text-[clamp(3.5rem,5.4vw,5.75rem)]">
            Stop <span className="text-oxblood">gambling</span> your marketing budget.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-muted">
            Book a free strategy call. We&rsquo;ll audit your brand, find the openings your
            competitors have missed, and give you a clear plan to grow your brand&nbsp;— and your
            bottom line.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <BookCallButton from="hero" className="w-full sm:w-auto" />
            <p className="text-small text-ink-muted">45 min · Google Meet · No obligation</p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t hairline pt-6 sm:max-w-lg">
            {[
              ['₹2 Cr+', 'revenue generated for clients last year'],
              ['8 yrs', 'in the advertising industry'],
              ['50+', 'clients we’ve built with'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-h2 font-bold leading-none">{value}</dd>
                <dd className="mt-2 text-small leading-snug text-ink-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Work, fanned out. The proof sits beside the promise. */}
        {stack.length > 0 && (
          <div aria-hidden className="relative mx-auto mt-14 aspect-[5/4] w-full max-w-md lg:mt-0 lg:max-w-none">
            {stack.map((card, i) => (
              <div
                key={card.id}
                className="absolute overflow-hidden rounded-xl bg-bone shadow-(--shadow-card-lift) ring-1 ring-ink/5"
                style={{
                  width: '72%',
                  aspectRatio: '4 / 3',
                  left: ['14%', '0%', '28%'][i],
                  top: ['8%', '26%', '40%'][i],
                  rotate: ['-2deg', '-7deg', '5deg'][i],
                  zIndex: [3, 1, 2][i],
                }}
              >
                <Image
                  src={card.image!.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 32vw, 72vw"
                  priority
                  className="object-cover"
                />
              </div>
            ))}
            {lead?.metric && (
              <div className="absolute -bottom-2 right-0 z-10 max-w-[62%] rounded-xl bg-ink p-4 text-paper shadow-(--shadow-card-lift) sm:p-5">
                <p className="text-h3 font-bold leading-none">{lead.metric.value}</p>
                <p className="mt-2 text-small leading-snug text-paper/75">
                  {lead.metric.label} · {lead.client}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------- client strip -- */}
      <section className="on-paper relative z-10 border-y hairline py-6 lg:py-8">
        <p className="gutter eyebrow mb-2 text-ink-muted">Brands we have built with</p>
        <ClientMarquee logos={logos} />
      </section>

      {/* ------------------------------------------------- foundations -- */}
      <section className="gutter py-20 lg:py-28">
        <Reveal>
          <h2 className="max-w-3xl text-h1 font-bold">
            Paying for marketing that <em className="not-italic text-oxblood">almost</em> works?
          </h2>
          <p className="mt-6 max-w-2xl text-lead text-ink-muted">
            Most business owners learn this only after years of spending: campaigns rarely fail
            because the ads were bad. They fail because the brand underneath wasn&rsquo;t
            consistent. So we start with the foundations.
          </p>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {FOUNDATIONS.map((f, i) => (
            <div key={f.title} className="rounded-xl border hairline bg-paper-lift p-6 lg:p-8">
              <p className="text-small font-medium text-oxblood">0{i + 1}</p>
              <h3 className="mt-4 text-h3 font-bold">{f.title}</h3>
              <p className="mt-3 text-body text-ink-muted">{f.body}</p>
            </div>
          ))}
        </Reveal>

        {/* The same four stages as the home page, cut down to a line each. */}
        <Reveal className="mt-16 lg:mt-20">
          <h3 className="max-w-2xl text-h2 font-bold">Then we build it in four stages, in this order.</h3>
        </Reveal>
        <Reveal stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STAGES.map((s, i) => (
            <article
              key={s.title}
              className="group flex flex-col rounded-lg bg-paper-dim/60 p-6 shadow-(--shadow-card) ring-1 ring-ink/5 lg:p-8"
            >
              <span className="eyebrow text-oxblood tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="mt-5 text-h3 font-bold">{s.title}</h4>
              <p className="mt-3 text-body text-ink-muted">{s.body}</p>
            </article>
          ))}
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-6 rounded-xl bg-paper-dim p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
          <p className="max-w-xl text-lead">
            On the call, we run that audit on <strong>your</strong> brand and hand you the plan.
          </p>
          <BookCallButton from="foundations" className="w-full shrink-0 sm:w-auto">
            Claim my free call
          </BookCallButton>
        </Reveal>
      </section>

      {/* -------------------------------------------------- case studies -- */}
      {cards.length > 0 && (
        <section data-ground="dim" className="bg-paper-dim py-20 lg:py-28">
          <Reveal className="gutter mb-10 lg:mb-14">
            <p className="eyebrow text-oxblood">Client results</p>
            <h2 className="mt-5 max-w-2xl text-h1 font-bold">Proof, not promises.</h2>
          </Reveal>
          <CaseCarousel cards={cards} />
          <div className="gutter mt-10">
            <BookCallButton from="case-studies" className="w-full sm:w-auto">
              Get results like these
            </BookCallButton>
          </div>
        </section>
      )}

      {/* -------------------------------------------------- testimonials -- */}
      {testimonials.length > 0 && (
        // Solid black, not a `data-ground` band: the backdrop turns those
        // transparent and only crossfades them in at mid-screen, and the
        // off-white cards would sit on paper until it did.
        <section className="relative z-10 bg-ink py-20 text-paper lg:py-28">
          <Reveal className="gutter mb-10 lg:mb-14">
            <p className="eyebrow text-paper/60">What our clients say</p>
            <h2 className="mt-5 max-w-2xl text-h1 font-bold">Don&rsquo;t take our word for it.</h2>
          </Reveal>
          <AutoTestimonials
            items={testimonials.map((t) => ({
              id: String(t.id),
              quote: t.quote,
              author: t.author,
              role: t.role,
              company: t.company,
            }))}
          />
          <div className="gutter mt-10">
            <BookCallButton from="testimonials" tone="paper" className="w-full sm:w-auto">
              Book my free strategy call
            </BookCallButton>
          </div>
        </section>
      )}

      {/* ------------------------------------------------- how it works -- */}
      <section className="gutter py-20 lg:py-28">
        <Reveal>
          <p className="eyebrow text-oxblood">How it works</p>
          <h2 className="mt-5 max-w-2xl text-h1 font-bold">Three steps. No pitch deck.</h2>
        </Reveal>
        <Reveal stagger className="mt-12 grid gap-8 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex gap-5 border-t hairline-2 pt-6">
              <span className="text-h2 font-bold leading-none text-oxblood">{i + 1}</span>
              <div>
                <h3 className="text-h4 font-bold">{s.title}</h3>
                <p className="mt-2 text-body text-ink-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </Reveal>

        {/* Native details/summary: works before hydration and with no JS. */}
        <Reveal className="mt-20 lg:mt-28">
          <h2 className="text-h2 font-bold">Questions, answered</h2>
          <div className="mt-8 border-t hairline-2">
            {FAQS.map((f) => (
              <details key={f.q} className="group border-b hairline-2">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lead font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="text-h3 text-oxblood transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-body text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------- final CTA -- */}
      <section className="relative z-10 bg-ink text-paper">
        <div className="gutter py-20 lg:py-28">
          <p className="eyebrow text-paper/60">Your move</p>
          <h2 className="mt-5 max-w-3xl text-display-3 font-bold">
            Stop gambling. Start with a plan.
          </h2>
          <p className="mt-6 max-w-xl text-lead text-paper/75">
            Forty-five minutes with the team that builds brands from the ground up. Free, and yours
            to keep.
          </p>
          <BookCallButton from="final" className="mt-10 w-full sm:w-auto" />
        </div>
      </section>

      <StickyCta />
    </BookingProvider>
  )
}

/**
 * Always on screen, at the foot of it. The page has no footer, so this is
 * the last thing in view at every scroll position.
 */
function StickyCta() {
  return (
    <>
      {/* Room for the bar, so it never sits over the end of the page. */}
      <div aria-hidden className="h-24 bg-ink sm:h-20" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-ink/95 text-paper backdrop-blur-md">
        <div className="gutter flex items-center justify-between gap-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="truncate text-body font-bold">Your free strategy call</p>
            <p className="truncate text-small text-paper/65">45 min · only 4 slots a day</p>
          </div>
          <BookCallButton from="sticky" className="min-h-12 shrink-0 px-5 py-3">
            Book now
          </BookCallButton>
        </div>
      </div>
    </>
  )
}
