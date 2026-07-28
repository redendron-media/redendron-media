import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '../revalidate'

import { editors, publishedOrSignedIn } from '../access'
import { contentBlocks } from '../blocks'
import { seoField, slugField } from '../fields'

export const Packages: CollectionConfig = {
  slug: 'packages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'priceLabel', 'order', '_status'],
    preview: (doc) => (doc?.slug ? `/packages/${doc.slug}` : null),
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
          label: 'Offer',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'positioning',
              type: 'text',
              admin: { description: 'Who this is for, e.g. "For founders preparing to raise".' },
            },
            { name: 'summary', type: 'textarea', required: true, maxLength: 280 },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            {
              name: 'priceLabel',
              type: 'text',
              admin: {
                description:
                  'Shown as written, e.g. "From $12,000" or "On application". Free text so pricing can stay strategic.',
              },
            },
            {
              name: 'timeline',
              type: 'text',
              admin: { description: 'e.g. "6-8 weeks".' },
            },
            {
              name: 'includes',
              type: 'array',
              labels: { singular: 'Inclusion', plural: 'Inclusions' },
              fields: [
                { name: 'item', type: 'text', required: true },
                { name: 'detail', type: 'text' },
              ],
            },
            {
              name: 'services',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Body',
          fields: [{ name: 'body', type: 'blocks', blocks: contentBlocks }],
        },
        {
          label: 'FAQs',
          fields: [
            {
              name: 'faqs',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
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
      name: 'highlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Visually emphasise this package in the pricing grid.' },
    },
    seoField,
  ],
  hooks: revalidateHooks,
}
