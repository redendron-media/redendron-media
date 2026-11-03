/**
 * Short case studies, written from the client case-study decks (the 51-page
 * "Client Case Studies" document and the Finova and Offbeat Sikkim decks).
 *
 * Every figure below is one those decks report. Where a project's deck gives
 * no number, the study has no metric - it is not padded with one.
 *
 * Images are not set here. They come from incoming/case-<slug>-cover|hero|NN
 * via scripts/assign-images.ts, which runs after this.
 */

export const shortCaseStudies = [
  {
    slug: 'offbeat-sikkim',
    client: 'Offbeat Sikkim',
    title: 'An experiential travel brand, built from scratch',
    industry: 'Travel & Tourism',
    year: 2023,
    tags: ['Brand Strategy', 'Visual Identity', 'Website', 'Social Media'],
    services: ['brand-strategy', 'brand-identity', 'websites', 'content-social'],
    testimonialFrom: null,
    summary:
      'A Sikkim travel agency with no brand foundations, repositioned as the home of experiential travel - and past its first-year revenue goal in 75 days.',
    challenge:
      'Offbeat Sikkim helped travellers curate unique trips and treks across Sikkim, with a glimpse of the local culture and heritage. But it had no solid brand foundation, which made it hard to stand apart in Sikkim’s highly competitive tourism market. Most agencies were selling the same popular spots in the same way.',
    approach:
      'We started with the people. Stakeholder interviews, user personas and an empathy map showed us a traveller who was overwhelmed by city life and wanted headspace, nature and something real. A competitive audit found the gap: competitors fought over popular spots, while nobody owned Sikkim’s lesser-known culture and landscapes. With the tourist season approaching, we ran brand strategy and identity in parallel and built the website in the background rather than cutting corners on either.',
    outcome:
      'A positioning around adventure and genuine connection with local culture and nature, a visual identity drawn from Sikkim’s greens, a website with real-time booking and travel guides, and a content strategy built on sustainability and local stories.',
    metrics: [
      { value: '75 days', label: 'to pass a $30,000 first-year revenue goal' },
      { value: '~50%', label: 'month-on-month growth in website traffic' },
      { value: '20–30', label: 'bookings through the website, with no paid ads' },
    ],
    body: [
      {
        heading: 'Where the competitors left the door open',
        paragraphs: [
          'The audit was blunt. A few established brands took the buying experience seriously; most agencies blended into the noise and competed on the same handful of destinations.',
          'That left an opening nobody was using: Sikkim’s lesser-known places, its culture, and the slower kind of trip a burnt-out professional actually wants. Offbeat Sikkim was positioned to own it, with set-departure packages that mix popular and offbeat destinations and a way for travellers to design their own trip.',
        ],
      },
      {
        heading: 'What we would do again',
        paragraphs: [
          'Consistent messaging and visuals on every platform did more for recognition and trust than any single campaign. Informative content and user-generated posts drove the biggest jumps in engagement.',
          'What we learned: traffic grew faster than bookings at first, so the journey and the calls to action needed another pass, and the off-season needs its own lead system rather than hoping the peak carries the year.',
        ],
      },
    ],
  },
  {
    slug: 'finova-finance',
    client: 'Finova Finance',
    title: 'A funnel that turns free value into paid members',
    industry: 'Finance Education',
    year: 2023,
    tags: ['Sales Funnel', 'Lead Magnet', 'Email Marketing', 'Landing Pages'],
    services: ['brand-strategy', 'websites', 'content-social'],
    testimonialFrom: 'Max Maher',
    summary:
      'Finance YouTuber Max Maher’s trading education platform, given a lead magnet, nurture sequences and a sales page - with an opt-in that converted at 93.57%.',
    challenge:
      'In 2023 Max Maher built Finova Finance to teach his audience how to trade in volatile markets, led by industry experts. The landing page converted poorly, and finance education looked complex and overwhelming to the newcomers it most needed to win.',
    approach:
      'A two-week research sprint narrowed the audience to two personas - a Gen-Z student chasing fast wealth and a busy business owner who needed quick, time-efficient trades - and an empathy map of what each wanted and feared. A competitive audit showed that the winners had clear design, direct calls to action and simple conversion paths. On a tight deadline we built in order: lead magnets first, then the nurturing sequences, then the sales page with A/B testing.',
    outcome:
      'The Millionaire Trader’s Playbook as a scarce lead magnet ("only 100 free downloads"), email and Discord nurture sequences tailored to each platform, and a 17-section sales page designed to guide a visitor step by step to checkout.',
    metrics: [
      { value: '93.57%', label: 'opt-in conversion rate' },
      { value: '39.2%', label: 'email open rate' },
      { value: '16.66%', label: 'click-through rate on Discord' },
    ],
    body: [
      {
        heading: 'Scarcity, then substance',
        paragraphs: [
          'The lead magnet borrowed from Max’s personal brand and capped downloads at one hundred, so the free offer read as exclusive rather than as another PDF. Behind it sat an eight-email sequence over fifteen days: identify the problem, go deeper, introduce the solution, pitch, then remind, prove and close.',
          'In the first month, 18 users reached the checkout pages.',
        ],
      },
      {
        heading: 'What the numbers told us',
        paragraphs: [
          'Not everything won. A second opt-in variant converted at 75.67%, and an email to ex-Patreon members drew a 0.92% click-through, both clear signals for the next round of messaging. The lesson we keep: an evergreen funnel is never finished, and it needs traffic channels feeding it to be worth the build.',
        ],
      },
    ],
  },
  {
    slug: 'easy-eats',
    client: 'Easy Eats',
    title: 'A cloud kitchen people wanted to order from',
    industry: 'Food & Beverage',
    year: 2021,
    tags: ['Brand Strategy', 'Identity Design', 'Content Marketing'],
    services: ['brand-strategy', 'brand-identity', 'content-social'],
    testimonialFrom: 'Shubham Pradhan',
    summary:
      'A cloud kitchen with no shopfront to stand on, given a brand strong enough to do the job - and more than ₹1 lakh in revenue in its first 10 days.',
    challenge:
      'A cloud kitchen has no dining room, no street presence and no décor to do its talking. Easy Eats wanted to position itself in the market and recreate the food experience entirely through its brand.',
    approach:
      'We built the identity around a single hand-drawn "e" that scales from the full Easy Eats wordmark down to a stamp and a lone mark, so it works on a fries carton, a cup or a sweatshirt. Packaging, merchandise and a social presence followed, with content written to sound like the kitchen itself - irreverent, specific, and about the food.',
    outcome:
      'A recognisable brand that set Easy Eats apart from its competition, with precise customer targeting driving social impressions and healthy community engagement, online and offline.',
    metrics: [{ value: '₹1 Lakh+', label: 'in revenue within 10 days of launch' }],
    body: [
      {
        heading: 'One mark, every surface',
        paragraphs: [
          'For a delivery-only brand, the packaging is the restaurant. The mark had to hold on fries cartons, cups and bags, on social posts and on a sweatshirt, so it was designed as a responsive system rather than a single logo.',
          'Community work went offline too, with a "take what you need, give what you can" poster campaign.',
        ],
      },
    ],
  },
  {
    slug: 'dash',
    client: 'Dash',
    title: 'The dark horse of delivery in Gangtok',
    industry: 'Delivery & E-commerce',
    year: 2019,
    tags: ['UI/UX Design', 'Web Development', 'Content Marketing'],
    services: ['websites', 'content-social'],
    testimonialFrom: null,
    summary:
      'A home-delivery brand in Gangtok that wanted faster, easier ordering and more sales - website visits grew by more than 2000%.',
    challenge:
      'Dash was a home-delivery service looking to increase sales and make delivery in Gangtok faster and more convenient. It needed a digital front door that local customers would actually use, and a reason to follow it.',
    approach:
      'We designed and built the ordering website around local brands people already loved, and ran a content programme on Instagram and Facebook alongside it - bright, food-first and made to be shared.',
    outcome:
      'More sales, more followers on Instagram and Facebook, and more website visits - enough to position Dash as the dark horse of delivery in Gangtok.',
    metrics: [
      { value: '2000%+', label: 'increase in website visits' },
      { value: '10.9K', label: 'accounts reached on Instagram in 30 days' },
    ],
    body: [],
  },
  {
    slug: 'cats-learning-centre',
    client: 'Cats Learning Centre',
    title: 'Forty seats, and the parents to fill them',
    industry: 'Early Education',
    year: 2023,
    tags: ['Advertising Strategy', 'Copywriting', 'Creative Production'],
    services: ['advertising', 'content-social'],
    testimonialFrom: null,
    summary:
      'A preschool moving parents toward modern play-to-learn methods, with a goal of filling 40 seats - enquiries rose by 1,133%.',
    challenge:
      'Cats Learning Centre wanted to help parents of toddlers and preschoolers move toward modern, play-to-learn environments and techniques through its programmes, and to fill 40 seats doing it.',
    approach:
      'We wrote an ad strategy that set out how we would test and experiment, how the budget would be allocated, and how retargeting and remarketing would work. The creative spoke to parents directly: every child learns differently, and we are here for yours. We found the most profitable traction channels and deployed the ads with ongoing analysis.',
    outcome: 'Enquiries from 37 interested parents.',
    metrics: [{ value: '1,133%', label: 'increase in enquiries — 37 interested parents' }],
    body: [],
  },
  {
    slug: 'agency-on-notion',
    client: 'Agency on Notion',
    title: 'A second brain for growing agencies',
    industry: 'Productivity & SaaS',
    year: 2023,
    tags: ['Landing Page', 'Webinar Funnel', 'UI Design'],
    services: ['websites', 'advertising'],
    testimonialFrom: null,
    summary:
      'Information-management systems in Notion for agencies that want to scale - launched with a webinar that drew more than 50 registrations.',
    challenge:
      'Agency on Notion set out to help professionals and agencies scale their operations by building advanced information-management systems in Notion.',
    approach:
      'We designed the sign-up experience and a webinar funnel to gather that audience, and used the first session as research as much as a launch.',
    outcome:
      'The inaugural webinar had 14 people live and over 50 registered. Their feedback reshaped the approach, and the project keeps evolving with its audience.',
    metrics: [{ value: '50+', label: 'registrations for the first webinar' }],
    body: [],
  },
  {
    slug: 'sikkim-state-aids-control-society',
    client: 'Sikkim State AIDS Control Society',
    title: 'Breaking the stigma',
    industry: 'Public Health',
    year: 2021,
    tags: ['Brand Identity', 'Website', 'Content Strategy'],
    services: ['brand-strategy', 'brand-identity', 'websites', 'content-social'],
    testimonialFrom: null,
    summary:
      'A public-health body cutting through online noise to raise awareness about AIDS and drug abuse, and reach the people who need help.',
    challenge:
      'The society needed to break through the online noise to spread awareness about AIDS and drug abuse, and to reach those in need - with a visual identity that was not speaking to the younger audience it most had to reach.',
    approach:
      'We rebranded the society to resonate with a younger audience, rebuilt its website around its programmes, and planned a content strategy for awareness about AIDS and drug abuse.',
    outcome:
      'Increased participation in online and offline awareness programmes, and campaigns that were easier to run.',
    metrics: [],
    body: [],
  },
  {
    slug: 'pure-sikkim',
    client: 'Pure Sikkim',
    title: 'Experience Sikkim like never before',
    industry: 'Travel & Tourism',
    year: 2022,
    tags: ['Brand Strategy', 'Brand Identity', 'Brand Guidelines'],
    services: ['brand-strategy', 'brand-identity'],
    testimonialFrom: null,
    summary:
      'A travel agency looking to stand out in Sikkim’s hyper-competitive tourism industry, given a brand strategy and identity to build on.',
    challenge:
      'Pure Sikkim was a travel agency in one of the most crowded categories in the state. To stand out, it needed more than a new logo: a clear reason to be chosen over every other agency selling the same mountains.',
    approach:
      'We developed a brand strategy to differentiate it from competing agencies, and an identity and guidelines to carry it consistently - from the mountain mark to signage and screens.',
    outcome: 'A solid brand foundation and an ongoing go-to-market strategy.',
    metrics: [],
    body: [],
  },
  {
    slug: 'crypto-gravity',
    client: 'Crypto Gravity',
    title: 'AI meets the crypto market',
    industry: 'Fintech',
    year: 2022,
    tags: ['Brand Strategy', 'Brand Identity', 'Web Design', 'Content Marketing'],
    services: ['brand-strategy', 'brand-identity', 'websites', 'content-social'],
    testimonialFrom: null,
    summary:
      'An AI-based crypto trading firm rebranded, positioned and given a selling system - with a high-converting sales page and social content to match.',
    challenge:
      'Crypto Gravity, an AI-based cryptocurrency trading firm, wanted to rebrand, build brand awareness and set up a selling system.',
    approach:
      'We rebranded the identity, wrote a positioning strategy, designed the selling system and a high-converting sales page, and ran targeted social content - including a series that explained crypto slang to newcomers.',
    outcome:
      'Significant online impressions through targeted social media content, and an ongoing go-to-market strategy.',
    metrics: [],
    body: [],
  },
  {
    slug: 'dreamer-tribe',
    client: 'Dreamer Tribe',
    title: 'Self-discovery in a fast-paced world',
    industry: 'Personal Development',
    year: 2022,
    tags: ['Brand Strategy', 'Brand Identity', 'Brand Guidelines'],
    services: ['brand-strategy', 'brand-identity'],
    testimonialFrom: null,
    summary:
      'A brand strategy and messaging framework to establish expertise and stand apart in the personal-development space.',
    challenge:
      'Personal development is crowded with voices that sound alike. Dreamer Tribe needed to establish its expertise and a clear difference from everyone else in the space.',
    approach:
      'We built a brand strategy and messaging framework, then an identity and guidelines - a ram’s-head mark and a newsletter that promises ideas that spark the magic in you.',
    outcome:
      'A brand strategy that differentiates Dreamer Tribe from the competition while establishing brand value and expertise, and an ongoing go-to-market strategy.',
    metrics: [],
    body: [],
  },
  {
    slug: 'max-for-ceo',
    client: 'Max for CEO',
    title: 'Meet your new CEO',
    industry: 'Business Consulting',
    year: 2023,
    tags: ['Microsite', 'Copywriting', 'Campaign'],
    services: ['websites', 'content-social'],
    testimonialFrom: null,
    summary:
      'A microsite for a visionary entrepreneur offering to step in as the CEO that businesses with broken systems need.',
    challenge:
      'Max Maher, an entrepreneur with several multi-million-dollar businesses behind him, wanted to help businesses with broken systems - and needed a way to make that offer land.',
    approach:
      'We created a campaign around a single provocative idea, "Meet your new CEO", and a microsite that tells the story of Max’s track record.',
    outcome:
      'A microsite that shows the benefits of having Max in your corner and lets prospects sign up for the programme.',
    metrics: [],
    body: [],
  },
]
