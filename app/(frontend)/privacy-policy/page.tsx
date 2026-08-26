import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal } from '@/components/motion/reveal'
import { getSiteSettings } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How Redendron Media collects, uses and protects the personal information you share with us.',
  alternates: { canonical: '/privacy-policy' },
}

/**
 * Last substantive revision. Shown to the reader and worth updating by hand
 * whenever a section changes - a policy that silently claims to be current
 * because it renders `new Date()` is worse than one with an honest date.
 */
const UPDATED = '26 August 2026'

/**
 * Named processors.
 *
 * Under both the GDPR and India's DPDP Act it is not enough to say "trusted
 * third parties"; the categories and, in practice, the names are what make
 * the disclosure meaningful. These are the three that actually touch a
 * visitor's data on this site.
 */
const PROCESSORS = [
  {
    name: 'Vercel',
    role: 'Hosting and content delivery',
    detail: 'Serves this website and keeps short-lived request logs.',
  },
  {
    name: 'Neon',
    role: 'Database',
    detail: 'Stores the site content and any enquiry you submit.',
  },
  {
    name: 'Brevo',
    role: 'Email delivery and CRM',
    detail: 'Delivers our email and holds enquiry contact records.',
  },
]

const SECTIONS = [
  {
    heading: 'What we collect',
    body: [
      'When you send us an enquiry we collect what you type into the form: your name, email address, and — if you choose to give them — your phone number, company name and website. We also collect what you tell us about the work: a description of your business, the services you are interested in, your goals, your timeline, your budget range, and how you heard about us.',
      'Separately, our hosting provider records ordinary technical information about requests to this site, such as IP address, browser and the pages requested. This site sets no analytics or advertising cookies.',
    ],
  },
  {
    heading: 'Why we collect it',
    body: [
      'To reply to you and to have the conversation you started. To understand which services people are asking for, so we can shape ours. To keep the site working and secure. Nothing you send us through this site is used for advertising, and we do not add you to a marketing list on the strength of an enquiry alone.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'Enquiries are kept for as long as the conversation is live and for up to three years afterwards, so we can pick up where we left off if you come back. Technical request logs are short-lived and held by our hosting provider under their own retention policy. Ask us to delete your record sooner and we will.',
    ],
  },
  {
    heading: 'Who else sees it',
    body: [
      'We do not sell your personal information, and we do not share it for anyone else’s marketing. It is handled by the people at Redendron Media working on your enquiry, and by the service providers listed above, each of whom processes it only on our instructions.',
    ],
  },
  {
    heading: 'Where it is processed',
    body: [
      'Our providers operate internationally, so your information may be processed outside the country you are in, including in the European Union and the United States. Where that happens for someone in the UK or EEA, it is covered by the transfer safeguards those providers have in place.',
    ],
  },
  {
    heading: 'Keeping it safe',
    body: [
      'Traffic to this site is encrypted in transit. Access to the enquiry records is limited to accounts that need it. No system is perfectly secure, and we will not pretend otherwise — but we will tell you promptly if something goes wrong in a way that affects you.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'Depending on where you live, you can ask us for a copy of what we hold about you, ask us to correct it, ask us to delete it, ask us to stop using it, or ask for it in a portable format. You can also withdraw consent at any time. We will not charge you for asking and we will not make the site worse for you because you did.',
      'To exercise any of these, email us. If you are in the UK or EEA and you think we have got it wrong, you also have the right to complain to your national data protection authority.',
    ],
  },
  {
    heading: 'Links to other sites',
    body: [
      'Our work and journal pages link out to other people’s websites. Once you follow one of those links you are on their terms, not ours.',
    ],
  },
  {
    heading: 'Changes',
    body: [
      'If we change something material here, we will change the date at the top. Continued use of the site after that means you accept the revised policy.',
    ],
  },
]

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings().catch(() => null)
  const email = settings?.email || 'team@redendron.com'

  return (
    <>
      <section className="gutter pb-16 pt-40 lg:pb-24 lg:pt-52">
        <Reveal>
          <p className="eyebrow text-accent">Legal</p>
          <h1 className="mt-7 max-w-3xl text-display-2 font-bold">Privacy policy</h1>
          <p className="mt-8 max-w-xl text-lead text-muted">
            The short version: we collect what you type into the enquiry form, we use it to
            reply to you, we do not sell it, and you can ask us to delete it.
          </p>
          <p className="mt-6 text-small text-faint">Last updated {UPDATED}</p>
        </Reveal>
      </section>

      {/* A two-column measure: headings hold the left rail so the page can be
          skimmed by section, and the prose stays at a readable width rather
          than running the full gutter. */}
      <section className="gutter pb-24 lg:pb-32">
        <div className="border-t hairline">
          {SECTIONS.map((section) => (
            <Reveal key={section.heading} className="border-b hairline">
              <div className="grid gap-6 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
                <h2 className="text-h3 font-bold lg:col-span-4">{section.heading}</h2>
                <div className="max-w-2xl space-y-5 lg:col-span-8">
                  {section.body.map((para) => (
                    <p key={para.slice(0, 32)} className="text-body text-muted">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal className="border-b hairline">
            <div className="grid gap-6 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
              <h2 className="text-h3 font-bold lg:col-span-4">Who processes your data</h2>
              <ul className="max-w-2xl lg:col-span-8">
                {PROCESSORS.map((p) => (
                  <li key={p.name} className="border-t hairline py-4 first:border-t-0 first:pt-0">
                    <p className="text-body font-medium">
                      {p.name} <span className="text-muted">&mdash; {p.role}</span>
                    </p>
                    <p className="mt-1 text-small text-muted">{p.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <p className="eyebrow text-accent">Contact</p>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Questions about any of this, or a request about your own data, go to{' '}
            <a
              href={`mailto:${email}`}
              className="border-b hairline-2 pb-0.5 text-(--on-ground) transition-colors hover:border-accent hover:text-accent"
            >
              {email}
            </a>
            .
          </p>
          <p className="mt-8 text-small text-muted">
            Redendron Media, Sanctorum Coworking, Development Area, Gangtok, Sikkim, India.{' '}
            <Link href="/get-a-quote" className="text-accent hover:underline">
              Start a project
            </Link>
          </p>
        </Reveal>
      </section>
    </>
  )
}
