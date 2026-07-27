import type { CollectionConfig } from 'payload'

import { editors, publishedOrSignedIn } from '../access'
import { contentBlocks } from '../blocks'
import { seoField, slugField } from '../fields'

/**
 * New in v2 - the old site had no services model at all, only thin "packages".
 * Each service is a real landing page and a funnel entry point.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', '_status'],
    preview: (doc) => (doc?.slug ? `/services/${doc.slug}` : null),
  },
  access: {
    read: publishedOrSignedIn,
    create: editors,
    update: editors,
    delete: editors,
  },
  versions: { drafts: { autosave: { interval: 800 } } },
  defaultSort: 'order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'tagline',
              type: 'text',
              admin: { description: 'One line, shown under the title in the services accordion.' },
            },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              maxLength: 280,
              admin: { description: 'Used on listings, the homepage accordion and link previews.' },
            },
            {
              name: 'previewImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Shown when a visitor hovers this service in the homepage accordion. Make it striking. The accordion degrades to a type-only treatment when this is empty, so a service can be drafted before its art exists.',
              },
            },
            {
              name: 'deliverables',
              type: 'array',
              labels: { singular: 'Deliverable', plural: 'Deliverables' },
              admin: { description: 'What the client actually receives.' },
              fields: [
                { name: 'item', type: 'text', required: true },
                { name: 'detail', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Process',
          fields: [
            {
              name: 'process',
              type: 'array',
              labels: { singular: 'Step', plural: 'Steps' },
              admin: { description: 'The engagement, step by step. Rendered as a scroll-driven sequence.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
                { name: 'duration', type: 'text', admin: { description: 'e.g. "1-2 weeks"' } },
              ],
            },
          ],
        },
        {
          label: 'Body',
          fields: [
            { name: 'body', type: 'blocks', blocks: contentBlocks },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'faqs',
              type: 'array',
              labels: { singular: 'FAQ', plural: 'FAQs' },
              admin: { description: 'Also emitted as FAQ structured data for search engines.' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
            {
              name: 'relatedPackages',
              type: 'relationship',
              relationTo: 'packages',
              hasMany: true,
            },
          ],
        },
      ],
    },

    slugField('title'),
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Show in the homepage services accordion.' },
    },
    seoField,
  ],
}
