import type { CollectionConfig } from 'payload'

import { anyone, editors } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: editors,
    update: editors,
    delete: editors,
  },
  upload: {
    staticDir: 'public/media',
    // Serve modern formats. The legacy library is 122MB of unoptimised PNGs
    // (one cover is 4672x2952 at 12MB); these sizes are what actually reach
    // the browser.
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    imageSizes: [
      { name: 'thumbnail', width: 480, height: undefined, position: 'centre' },
      { name: 'card', width: 900, height: undefined, position: 'centre' },
      { name: 'wide', width: 1600, height: undefined, position: 'centre' },
      { name: 'hero', width: 2400, height: undefined, position: 'centre' },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 85 } },
      },
    ],
    mimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description:
          'Describe the image for screen readers and search engines. Leave blank only if the image is purely decorative.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional visible caption, shown beneath the image where the layout supports it.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source attribution.' },
    },
  ],
}
