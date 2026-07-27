import type { CollectionConfig } from 'payload'

import { editors, publishedOrSignedIn } from '../access'
import { contentBlocks } from '../blocks'
import { publishedAtField, seoField, slugField } from '../fields'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog Post', plural: 'Blog Posts' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'category', '_status', 'publishedAt'],
    preview: (doc) => (doc?.slug ? `/blog/${doc.slug}` : null),
  },
  access: {
    read: publishedOrSignedIn,
    create: editors,
    update: editors,
    delete: editors,
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  defaultSort: '-publishedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Post',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              maxLength: 280,
              admin: { description: 'Shown on cards and in link previews.' },
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
            {
              name: 'body',
              type: 'blocks',
              blocks: contentBlocks,
              required: true,
            },
          ],
        },
        {
          label: 'Attribution',
          fields: [
            {
              // Was a plain text field on the old site, repeated per post.
              name: 'author',
              type: 'relationship',
              relationTo: 'authors',
              required: true,
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
            },
            {
              name: 'readingTime',
              type: 'number',
              admin: {
                description: 'Minutes. Leave blank to calculate automatically from the body.',
                position: 'sidebar',
              },
            },
          ],
        },
      ],
    },

    slugField('title'),
    publishedAtField,
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    seoField,
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Rough reading time from the text inside the block tree, so editors
        // do not have to guess. Only fills a value they left blank.
        if (data?.readingTime || !Array.isArray(data?.body)) return data
        const words = JSON.stringify(data.body).split(/\s+/).length
        data.readingTime = Math.max(1, Math.round(words / 220))
        return data
      },
    ],
  },
}
