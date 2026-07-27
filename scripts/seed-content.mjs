/**
 * Authored seed content: the six services (the old site had no services model
 * at all) and the blog. The three legacy blog posts were test fixtures, so
 * these replace them outright.
 *
 * This is editorial copy, not filler. Edit it in the CMS once imported.
 */

export const serviceSeeds = [
  {
    slug: 'brand-strategy',
    title: 'Brand Strategy',
    tagline: 'Decide what you are before you decide how you look.',
    summary:
      'Positioning, audience, narrative and messaging architecture, grounded in real market evidence rather than a mood board.',
    bodyHeading: 'Strategy is a decision, not a document',
    body: [
      'Most brands do not have a visibility problem. They have a clarity problem. They are legible to the people who built them and ambiguous to everyone else, and no amount of design fixes an unmade decision.',
      'We start with evidence: what your market actually believes, what your competitors have already claimed, and where the unoccupied ground is. Then we make the hard calls about who you are for, who you are not for, and what you are willing to be known for at the cost of everything else.',
      'The output is a positioning you can defend, a narrative your team can repeat without a script, and a messaging architecture that tells every downstream decision what to do. It is the document every other engagement on this list depends on.',
    ],
    deliverables: [
      'Market and competitor audit',
      'Audience definition and segmentation',
      'Positioning statement and territory',
      'Brand narrative and origin story',
      'Messaging architecture and proof points',
      'Tone of voice guidelines',
    ],
    process: [
      {
        title: 'Immersion',
        description:
          'Stakeholder interviews, category audit and a hard look at what your customers already say about you.',
        duration: '1–2 weeks',
      },
      {
        title: 'Definition',
        description:
          'We converge on the positioning, pressure-test it against the competitive set, and make the trade-offs explicit.',
        duration: '2 weeks',
      },
      {
        title: 'Articulation',
        description:
          'Narrative, messaging architecture and voice, written so your team can actually use them.',
        duration: '1–2 weeks',
      },
    ],
    faqs: [
      {
        question: 'We already have a logo. Do we still need strategy?',
        answer:
          'A logo is an identifier, not a position. Strategy decides what that identifier is supposed to mean and to whom. If your team cannot answer "why you and not them" in one sentence, the logo is not the gap.',
      },
      {
        question: 'How is this different from a marketing plan?',
        answer:
          'A marketing plan decides where to spend. Strategy decides what to say and why anyone should care. Plans built on unresolved positioning tend to buy attention for a message that does not land.',
      },
    ],
  },
  {
    slug: 'brand-identity',
    title: 'Brand Identity & Design',
    tagline: 'A visual system that holds up everywhere it is used.',
    summary:
      'Logo, typography, colour, art direction and a design system built to survive contact with real applications.',
    bodyHeading: 'Identity is a system, not an artwork',
    body: [
      'An identity is judged on the thousandth application, not the first. It has to work at sixteen pixels and on a building, in the hands of a junior designer and in a template a founder edits at midnight.',
      'We design the system, not just the mark: a typographic hierarchy with real rules, a palette that carries meaning rather than decoration, art direction that briefs a photographer, and layout principles that keep the brand recognisable when we are not in the room.',
      'Everything ships with a guide that explains the reasoning, because a rule nobody understands is a rule nobody follows.',
    ],
    deliverables: [
      'Logo suite and lockups',
      'Typographic system and hierarchy',
      'Colour palette with usage rules',
      'Art direction and photography guidelines',
      'Iconography and graphic language',
      'Brand guidelines document',
    ],
    process: [
      {
        title: 'Territories',
        description:
          'Two or three distinct visual directions, each a genuine argument rather than a variation on one idea.',
        duration: '2 weeks',
      },
      {
        title: 'Development',
        description:
          'We take the chosen direction and build it out across the applications that will stress it hardest.',
        duration: '3–4 weeks',
      },
      {
        title: 'Systemisation',
        description: 'Rules, assets and guidelines, packaged so your team can run it without us.',
        duration: '1–2 weeks',
      },
    ],
    faqs: [
      {
        question: 'How many logo concepts do we get?',
        answer:
          'Two or three territories, each a real position. Presenting a dozen options usually means the strategy was not settled first, and it turns a business decision into a preference poll.',
      },
    ],
  },
  {
    slug: 'websites',
    title: 'Websites & Digital Experience',
    tagline: 'Sites that convert, and load in under two seconds doing it.',
    summary:
      'Design and build of marketing sites and digital products, engineered for speed, search and conversion in equal measure.',
    bodyHeading: 'Beautiful and fast is the only acceptable pair',
    body: [
      'The agency web is full of sites that win awards and lose customers: eight seconds to first paint, a scroll-jacked hero that fights the user, and no clear next step anywhere on the page.',
      'We build the other kind. Considered motion that rewards scrolling rather than obstructing it, a content model your team can actually publish into, and a conversion path that is obvious without being loud.',
      'Every build ships with real performance budgets, semantic markup, per-page metadata and structured data. Craft and Core Web Vitals are not in tension unless you build them that way.',
    ],
    deliverables: [
      'UX architecture and wireframes',
      'Full visual design across breakpoints',
      'Front-end build with motion design',
      'CMS setup and editor training',
      'Technical SEO and structured data',
      'Analytics and conversion tracking',
    ],
    process: [
      {
        title: 'Architecture',
        description:
          'Sitemap, content model and conversion paths, agreed before a single pixel is drawn.',
        duration: '1–2 weeks',
      },
      {
        title: 'Design',
        description: 'Page design and motion direction, reviewed in the browser rather than in a static file.',
        duration: '3–4 weeks',
      },
      {
        title: 'Build & launch',
        description: 'Production build, CMS wiring, performance passes, redirects and launch.',
        duration: '3–5 weeks',
      },
    ],
    faqs: [
      {
        question: 'Can our team edit the site afterwards?',
        answer:
          'Yes. That is a design requirement, not an afterthought. Content is modelled in composable blocks so pages can be built and rearranged without a developer.',
      },
      {
        question: 'What about the heavy animation? Will it hurt our SEO?',
        answer:
          'Only if it is built carelessly. Motion is loaded progressively, gated on device capability, and disabled entirely for visitors who ask for reduced motion. Content renders on the server and is indexable regardless.',
      },
    ],
  },
  {
    slug: 'advertising',
    title: 'Advertising & Campaigns',
    tagline: 'Ideas big enough to be worth the media spend.',
    summary:
      'Campaign concepts, art direction and production across paid, out-of-home and social, built from the positioning outward.',
    bodyHeading: 'The idea has to be bigger than the budget',
    body: [
      'Media buying is a solved problem. Having something worth putting in front of people is not. Most underperforming campaigns are not targeting failures — they are ideas that were never strong enough to interrupt anyone.',
      'We build campaigns from the positioning outward, so the creative argues for something specific rather than gesturing at a category. Then we produce it properly across every format the plan calls for.',
      'We will tell you when the honest answer is that the product, not the campaign, is the constraint.',
    ],
    deliverables: [
      'Campaign concept and platform idea',
      'Art direction and key visuals',
      'Copywriting across formats',
      'Production and asset delivery',
      'Channel adaptation and versioning',
      'Performance review and iteration',
    ],
    process: [
      {
        title: 'Brief',
        description: 'A single-minded proposition and a measurable objective. Both written down.',
        duration: '1 week',
      },
      {
        title: 'Concept',
        description: 'Campaign platforms presented as arguments, with the media logic attached.',
        duration: '2 weeks',
      },
      {
        title: 'Production',
        description: 'Full asset production and channel versioning.',
        duration: '2–4 weeks',
      },
    ],
    faqs: [],
  },
  {
    slug: 'marketing-collateral',
    title: 'Marketing Collateral',
    tagline: 'The documents that close the deal.',
    summary:
      'Pitch decks, brochures, packaging, reports and sales material designed to the same standard as the brand itself.',
    bodyHeading: 'The unglamorous work that decides deals',
    body: [
      'A pitch deck is often the highest-stakes design object a company owns, and it is usually the worst-designed. The same is true of the sales brochure, the annual report and the packaging that a customer holds for thirty seconds before deciding.',
      'We treat collateral as brand-critical, because a beautiful website undermined by a Times New Roman proposal has not solved anything.',
      'Where it makes sense we build templates your team can run, so quality survives after the engagement ends.',
    ],
    deliverables: [
      'Pitch and sales decks',
      'Brochures and printed collateral',
      'Packaging design and artwork',
      'Annual and impact reports',
      'Editable templates for your team',
      'Print production management',
    ],
    process: [
      {
        title: 'Audit',
        description: 'What exists, what is working, and what is quietly costing you credibility.',
        duration: '1 week',
      },
      {
        title: 'Design',
        description: 'Design and copy, produced against the brand system.',
        duration: '2–3 weeks',
      },
      {
        title: 'Handover',
        description: 'Templates, source files and production-ready artwork.',
        duration: '1 week',
      },
    ],
    faqs: [],
  },
  {
    slug: 'content-social',
    title: 'Content & Social',
    tagline: 'A publishing habit, not a posting schedule.',
    summary:
      'Editorial strategy, content production and social systems that compound instead of evaporating each month.',
    bodyHeading: 'Consistency beats intensity',
    body: [
      'Most social output is expensive noise: high effort, no compounding return, abandoned in month four. The brands that win treat content as a publishing operation with a point of view, not a calendar to fill.',
      'We build the editorial strategy, the pillars, the production system and the formats — then we either run it or hand it over with everything your team needs to run it themselves.',
      'Success is measured in qualified inbound and share of conversation, not in follower counts.',
    ],
    deliverables: [
      'Editorial strategy and content pillars',
      'Channel strategy and format design',
      'Content production and art direction',
      'Publishing calendar and workflow',
      'Community and engagement guidelines',
      'Monthly performance reporting',
    ],
    process: [
      {
        title: 'Strategy',
        description: 'Pillars, formats and channels, chosen against where your buyers actually are.',
        duration: '2 weeks',
      },
      {
        title: 'System',
        description: 'Templates, workflow and calendar, built so production does not depend on inspiration.',
        duration: '2 weeks',
      },
      {
        title: 'Run',
        description: 'Ongoing production, publishing and reporting.',
        duration: 'Monthly',
      },
    ],
    faqs: [],
  },
]

export const blogPosts = [
  {
    slug: 'your-website-is-not-your-brand',
    title: 'Your website is not your brand',
    category: 'Brand Strategy',
    categorySlug: 'brand-strategy',
    excerpt:
      'Redesigns are the most common response to a brand problem and the least likely to fix one. A look at what the website can and cannot carry.',
    publishedAt: '2026-06-18T09:00:00.000Z',
    body: [
      {
        type: 'text',
        paragraphs: [
          'The call usually arrives in the same shape. Growth has flattened, the pipeline feels thinner than last year, and somebody in the leadership meeting says the website looks dated. Three months and a significant budget later there is a new website, and the pipeline is exactly where it was.',
          'This happens because the website is the most visible artefact of the brand and therefore the easiest thing to blame. It is measurable, it is owned, and it can be changed without anyone renegotiating what the company actually stands for. Redesigning it feels like progress in a way that revisiting positioning does not.',
        ],
      },
      {
        type: 'text',
        heading: 'What a website can actually fix',
        paragraphs: [
          'A website is very good at a narrow set of problems. It can fix comprehension: if visitors cannot work out what you sell within a few seconds, better information architecture solves that. It can fix friction: if your enquiry form asks for eleven fields before it asks what the person needs, fewer people finish it. It can fix credibility signals: proof, specificity and evidence of real work.',
          'These are real problems and they are worth money. But notice what they have in common — they are all problems of transmission. The website is the channel. Fixing the channel improves how faithfully a message arrives. It does nothing about whether the message was worth sending.',
        ],
      },
      {
        type: 'quote',
        quote:
          'A website makes your positioning legible. It cannot make an unmade decision on your behalf.',
        attribution: 'Redendron Media',
      },
      {
        type: 'text',
        heading: 'The test',
        paragraphs: [
          'Ask five people in your company, separately and without warning, why a customer should choose you over the nearest competitor. Write the answers down side by side.',
          'If you get five materially different answers, you do not have a website problem. You have an unresolved positioning problem, and the redesign will faithfully reproduce that ambiguity in a nicer typeface. If you get five versions of the same answer and your site does not say it clearly in the first screen, then yes — build the site.',
          'The order matters. Strategy first is not agency preference. It is the difference between a site that converts and an expensive one that does not.',
        ],
      },
    ],
  },
  {
    slug: 'what-high-ticket-clients-look-for',
    title: 'What high-ticket clients actually look for',
    category: 'Business',
    categorySlug: 'business',
    excerpt:
      'Buyers spending serious money are not scanning for polish. They are looking for evidence that you have done this exact thing before.',
    publishedAt: '2026-05-30T09:00:00.000Z',
    body: [
      {
        type: 'text',
        paragraphs: [
          'There is a persistent belief that winning larger clients is a matter of looking more expensive. Nicer photography, a more restrained palette, the word "bespoke" somewhere above the fold. It is a reasonable theory and it is mostly wrong.',
          'People authorising six-figure engagements are not shopping on aesthetics. They are managing risk. Somebody has staked their internal credibility on the recommendation, and the entire evaluation is an attempt to answer one question: how likely is this to go badly?',
        ],
      },
      {
        type: 'text',
        heading: 'Specificity beats polish',
        paragraphs: [
          '"We help brands grow" is a sentence that survives every review round because nobody objects to it. It also communicates nothing. "We reposition sustainable fashion brands moving from wholesale into direct-to-consumer" narrows the market and dramatically raises conviction among the people it describes.',
          'The fear is that specificity costs you opportunities. In practice it costs you unqualified enquiries, which are the expensive kind. Narrowing is what makes the buyer think: this firm has seen my situation before.',
        ],
      },
      {
        type: 'text',
        heading: 'Show the work, including the middle',
        paragraphs: [
          'Most case studies are trophies: the finished identity, the glowing quote, the number that went up. They are pleasant and they persuade nobody, because everyone knows the failures are not on the site.',
          'The case studies that work show the reasoning. What the constraint was. Which direction was rejected and why. What you would do differently. That kind of writing signals judgement, and judgement is the thing actually being bought.',
        ],
      },
      {
        type: 'quote',
        quote:
          'Nobody spends six figures on taste. They spend it on the belief that you have solved this exact problem before.',
        attribution: 'Redendron Media',
      },
      {
        type: 'text',
        heading: 'Make the money conversation early',
        paragraphs: [
          'Hiding price does not protect the deal, it filters for the wrong people. Publishing a genuine floor — "engagements typically start at" — removes the buyers who were never going to proceed and reassures the ones who were that they are in the right room.',
          'The uncomfortable corollary is that if your work does not justify the number, no amount of presentation will fix it. That is a work problem, and it is the only one worth solving first.',
        ],
      },
    ],
  },
  {
    slug: 'the-case-for-boring-consistency',
    title: 'The case for boring consistency',
    category: 'Design',
    categorySlug: 'design',
    excerpt:
      'Brand systems fail in the gap between the guidelines and the Tuesday afternoon deadline. Designing for that gap is most of the job.',
    publishedAt: '2026-05-12T09:00:00.000Z',
    body: [
      {
        type: 'text',
        paragraphs: [
          'Every brand guideline document contains a sentence like "the logo should always be surrounded by clear space equal to the height of the D". Every brand also has a social post where somebody put the logo on a busy photograph at 4:45pm on a Tuesday because it had to go out.',
          'The gap between those two facts is where brand systems actually live, and most of them are not designed for it.',
        ],
      },
      {
        type: 'text',
        heading: 'Guidelines are not the deliverable',
        paragraphs: [
          'A hundred-page PDF is a record of decisions, not a mechanism for enforcing them. The people who most need it are the least likely to read it: the intern, the freelancer with two days, the regional partner who has never met your design team.',
          'The mechanism that works is defaults. Templates that are correct before anyone touches them. A component library where the wrong thing is harder to build than the right one. Constraints that make the fast path and the correct path the same path.',
        ],
      },
      {
        type: 'quote',
        quote: 'A rule nobody understands is a rule nobody follows. A default nobody notices is a rule that never breaks.',
        attribution: 'Redendron Media',
      },
      {
        type: 'text',
        heading: 'Consistency is compound interest',
        paragraphs: [
          'Recognition is built by repetition, and repetition is boring by definition. The internal pressure to refresh is always strongest exactly when the system has started working, because the team has seen it far more often than any customer has.',
          'The brands that feel substantial are almost never the ones that reinvented themselves most often. They are the ones that made a decision and then had the discipline to be slightly bored by it for a decade.',
        ],
      },
    ],
  },
  {
    slug: 'motion-that-earns-its-weight',
    title: 'Motion that earns its weight',
    category: 'Design',
    categorySlug: 'design',
    excerpt:
      'Scroll animation is the easiest way to look expensive and the easiest way to lose a customer. The difference is whether it carries information.',
    publishedAt: '2026-04-22T09:00:00.000Z',
    body: [
      {
        type: 'text',
        paragraphs: [
          'Motion has become the default signal for a serious agency site. Things fade up, headlines split into characters, a WebGL blob follows the cursor. Some of it is extraordinary craft. A lot of it is a tax the visitor pays on the way to finding a phone number.',
          'The distinction is not how much motion there is. It is whether the motion is carrying information.',
        ],
      },
      {
        type: 'text',
        heading: 'Motion that carries information',
        paragraphs: [
          'Good motion answers a question the visitor already has. A card that expands from the exact position it was clicked answers "where did this come from". A hover state that previews the destination answers "is this worth my click". A staged reveal answers "what order should I read this in".',
          'Bad motion answers no question. It delays content that was ready, hijacks a scroll gesture the visitor understands better than you do, and adds a second and a half to a task they wanted to finish.',
        ],
      },
      {
        type: 'quote',
        quote: 'If the animation would be missed only by the person who built it, it is decoration wearing the costume of craft.',
        attribution: 'Redendron Media',
      },
      {
        type: 'text',
        heading: 'The constraints that keep it honest',
        paragraphs: [
          'Three rules survive contact with real projects. Content renders on the server and is readable whether or not the animation layer loads. Nothing that carries information is gated behind a transition. And every effect is disabled for visitors whose system asks for reduced motion — which is a meaningful share of people, some of whom get genuinely ill from parallax.',
          'Those constraints are not a compromise on ambition. They are what separates a site that feels expensive from one that merely was.',
        ],
      },
    ],
  },
]
