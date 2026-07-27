import type { CollectionConfig } from 'payload'

import { editors, publishedOrSignedIn } from '../access'
import { contentBlocks } from '../blocks'
import { publishedAtField, seoField, slugField } from '../fields'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case Study', plural: 'Case Studies' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'industry', '_status', 'publishedAt'],
    description:
      'Long-form proof of work. Compose the body from blocks in whatever order the story needs.',
    preview: (doc) => (doc?.slug ? `/case-studies/${doc.slug}` : null),
  },
  access: {
    read: publishedOrSignedIn,
    create: editors,
    update: editors,
    delete: editors,
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 25,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: 'The headline of the story, e.g. "Stitching Sustainability".' },
            },
            {
              name: 'client',
              type: 'text',
              required: true,
              admin: { description: 'Client or project name, e.g. "Crafted Fibers".' },
            },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              maxLength: 280,
              admin: {
                description:
                  'One or two sentences used on cards, listings and link previews. Lead with the outcome.',
              },
            },
            {
              name: 'industry',
              type: 'text',
              admin: { description: 'e.g. "Sustainable Fashion".' },
            },
            {
              name: 'year',
              type: 'number',
              min: 2000,
              max: 2100,
            },
            {
              name: 'services',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
              admin: {
                description:
                  'Which services this project used. Drives the cross-links from each service page.',
              },
            },
            {
              name: 'tags',
              type: 'array',
              labels: { singular: 'Tag', plural: 'Tags' },
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Free-form labels used by the archive filter.' },
            },
          ],
        },
        {
          label: 'Framing',
          description:
            'The three-beat summary shown near the top of the page. Optional, but it is what a skimming prospect reads.',
          fields: [
            {
              name: 'challenge',
              type: 'textarea',
              admin: { description: 'What was the problem the client came with?' },
            },
            {
              name: 'approach',
              type: 'textarea',
              admin: { description: 'What did Redendron do about it?' },
            },
            {
              name: 'outcome',
              type: 'textarea',
              admin: { description: 'What changed as a result? Be concrete.' },
            },
            {
              name: 'metrics',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Metric', plural: 'Metrics' },
              admin: {
                description:
                  'Headline numbers. These carry more weight with high-value prospects than any amount of copy.',
              },
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Visuals',
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Used on the archive grid, the hover preview and link previews.' },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Full-bleed image at the top of the case study. Falls back to the cover.' },
            },
            {
              name: 'accentColor',
              type: 'text',
              admin: {
                description:
                  'Optional hex colour sampled from the project, used to tint this case study\'s page. Defaults to the brand oxblood.',
                placeholder: '#81120F',
              },
              validate: (value: unknown) => {
                if (!value) return true
                return /^#[0-9a-fA-F]{6}$/.test(String(value))
                  ? true
                  : 'Enter a 6-digit hex colour, e.g. #81120F'
              },
            },
          ],
        },
        {
          label: 'Body',
          fields: [
            {
              name: 'body',
              type: 'blocks',
              blocks: contentBlocks,
              admin: {
                description:
                  'Add as many blocks as the story needs, in any order. Drag to reorder.',
              },
            },
          ],
        },
        {
          label: 'Testimonial',
          fields: [
            {
              name: 'testimonial',
              type: 'relationship',
              relationTo: 'testimonials',
              admin: { description: 'Optional client quote pinned to the end of the study.' },
            },
          ],
        },
      ],
    },

    // Sidebar
    slugField('client'),
    publishedAtField,
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Surface this on the homepage.' },
    },
    seoField,
  ],
}
