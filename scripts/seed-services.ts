/**
 * Fills the gaps in the service pages.
 *
 * Additive on purpose: FAQs already written in the CMS are kept and only
 * topped up to three, and nothing that already has a value is overwritten.
 * Re-running it is a no-op, so it is safe to run after an editor has been in
 * there making changes.
 */
import { getPayload } from 'payload'

import config from '../payload.config'

type Faq = { question: string; answer: string }

/** Package slugs each service most naturally leads into, best fit first. */
const PACKAGES: Record<string, string[]> = {
  'brand-strategy': ['brand-strategy-visual-identity-design', 'the-complete-brand-bundle'],
  'brand-identity': ['brand-strategy-visual-identity-design', 'the-complete-brand-bundle'],
  websites: ['the-complete-brand-bundle', 'the-go-to-market-bundle'],
  advertising: ['the-go-to-market-bundle', 'the-complete-brand-bundle'],
  'marketing-collateral': ['the-complete-brand-bundle', 'the-go-to-market-bundle'],
  'content-social': ['the-go-to-market-bundle', 'the-complete-brand-bundle'],
}

const FAQS: Record<string, Faq[]> = {
  'brand-strategy': [
    {
      question: 'We already have a brand. Is this a rebrand?',
      answer:
        'Usually not. Most of the work is deciding what you already are and saying it in a way the market can repeat. A rebrand is what happens when the answer turns out to be genuinely different from what you have been showing — and we will tell you if that is the case rather than selling it to you up front.',
    },
    {
      question: 'How much of our time does this take?',
      answer:
        'Two or three workshop sessions of about ninety minutes each, plus whoever owns the answer being reachable for questions in between. We do the research and the writing; you make the decisions, because a positioning nobody internally believes is worth nothing.',
    },
    {
      question: 'What do we actually walk away with?',
      answer:
        'A written strategy document you can hand to any agency, freelancer or new hire, and have them produce work that fits. Positioning, audience, narrative, messaging architecture and the words to use — not a slide deck of adjectives.',
    },
  ],
  'brand-identity': [
    {
      question: 'Can you do identity without doing strategy first?',
      answer:
        'We can, and sometimes it is the right call when the positioning is genuinely settled. But if it is not, we are guessing about what the design is meant to signal — and design that is guessing is expensive to redo. We will say which situation you are in.',
    },
    {
      question: 'Do we own the files?',
      answer:
        'Yes, entirely. You get working files, exports in every format you will need, and the fonts licensed to you. Nothing is held back as leverage and there is no ongoing fee to keep using your own identity.',
    },
    {
      question: 'How many logo options do we see?',
      answer:
        'Fewer than you might expect, and each one argued for. Presenting eight directions is a way of asking the client to do the strategy, and the choice usually gets made on personal taste rather than on fit. We bring the routes we can defend.',
    },
  ],
  websites: [
    {
      question: 'What do you build it on?',
      answer:
        'Usually Next.js with a headless CMS, hosted on Vercel — the same stack as this site. It gives you fast pages, real editorial control and no plugin maintenance treadmill. If you have an existing platform you need to stay on, we will tell you honestly whether it can hit the targets.',
    },
    {
      question: 'Can we edit it ourselves afterwards?',
      answer:
        'Yes. Every piece of text and every image is in the CMS, and we hand over with a walkthrough. If you need a new section that does not exist yet, that is a small piece of work rather than a rebuild.',
    },
    {
      question: 'How fast is fast?',
      answer:
        'We target a Largest Contentful Paint under two seconds on a mid-range phone over 4G, not on a desktop over office fibre. Speed is measured on the connection your customers actually have, and it is in scope rather than a nice-to-have.',
    },
  ],
  advertising: [
    {
      question: 'Do you buy the media as well?',
      answer:
        'We plan it and we will run it if you want us to, but we are equally happy handing a campaign to your existing media buyer. The idea and the craft are what we are for; we do not mark up media to make the numbers work.',
    },
    {
      question: 'What size of spend does this make sense at?',
      answer:
        'Below a certain budget, production eats the media and nobody sees the work. If your spend is small, we would rather build you something that compounds — content, a site, collateral — than make one beautiful thing that fifty people see. We will say so before you commit.',
    },
    {
      question: 'How do you know if it worked?',
      answer:
        'We agree the measure before we start, and it is a business number rather than an engagement one. Impressions and likes are inputs. Enquiries, qualified leads, search volume for your name, cost per acquisition — those are outcomes.',
    },
  ],
  'marketing-collateral': [
    {
      question: 'Is this just making our deck prettier?',
      answer:
        'No. Most decks fail on sequence, not on styling — the argument arrives in the wrong order and the reader is asked to care before they have been given a reason to. We rebuild the argument first, then design it.',
    },
    {
      question: 'Can we update these ourselves?',
      answer:
        'Yes. Everything is delivered as templates in the software your team already uses, with the type styles and layouts set up properly, so a new case study or a changed number does not need to come back to us.',
    },
    {
      question: 'What about print production?',
      answer:
        'We supply print-ready artwork and will liaise with your printer on stock, finish and proofing. If you do not have one, we will recommend one — a good print job on the wrong paper still looks cheap.',
    },
  ],
  'content-social': [
    {
      question: 'Do you write the posts, or just the strategy?',
      answer:
        'Both, and the split is up to you. Some clients want the whole thing run; others want the system, the templates and the editorial calendar, and then their own team writes into it. The second is cheaper and usually more sustainable if you have anyone in-house who can write.',
    },
    {
      question: 'How long before it does anything?',
      answer:
        'Three to six months before the compounding starts to show, which is the honest answer and the reason most companies quit at month two. If you need enquiries next week, that is an advertising problem, not a content one.',
    },
    {
      question: 'How much do you need from our team?',
      answer:
        'An hour or two a month from someone who actually knows the subject. The bottleneck in content is never the writing — it is access to a person with a real opinion worth publishing.',
    },
  ],
}

async function main() {
  const payload = await getPayload({ config })

  const { docs: packages } = await payload.find({
    collection: 'packages',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  const packageId = new Map(packages.map((p) => [p.slug as string, p.id]))

  const { docs: services } = await payload.find({
    collection: 'services',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  for (const service of services) {
    const slug = service.slug as string
    const data: Record<string, unknown> = {}
    const changes: string[] = []

    // Top the FAQs up to three, keeping anything already written.
    const existing = (service.faqs || []) as Faq[]
    const seen = new Set(existing.map((f) => f.question.trim().toLowerCase()))
    const additions = (FAQS[slug] || []).filter(
      (f) => !seen.has(f.question.trim().toLowerCase())
    )
    const merged = [...existing, ...additions].slice(0, 3)
    if (merged.length !== existing.length) {
      data.faqs = merged
      changes.push(`faqs ${existing.length} -> ${merged.length}`)
    }

    // Only set related packages when the field is empty, so an editor's
    // deliberate choice is never overwritten.
    const related = (service.relatedPackages || []) as unknown[]
    if (related.length === 0) {
      const ids = (PACKAGES[slug] || []).map((s) => packageId.get(s)).filter(Boolean)
      if (ids.length) {
        data.relatedPackages = ids
        changes.push(`relatedPackages -> ${ids.length}`)
      }
    }

    if (!changes.length) {
      console.log(`  ${slug.padEnd(22)} already complete`)
      continue
    }

    await payload.update({
      collection: 'services',
      id: service.id,
      overrideAccess: true,
      data,
      // Published straight away: these pages are live and a draft would leave
      // the public page half-populated.
      draft: false,
    })
    console.log(`  ${slug.padEnd(22)} ${changes.join(', ')}`)
  }

  console.log('\nDone.')
  process.exit(0)
}

main()
