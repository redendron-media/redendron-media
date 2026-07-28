import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '../revalidate'

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
    // Each size needs its own formatOptions - the upload-level setting above
    // only converts the original, leaving derived sizes as source-format PNGs
    // (a 1600px derivative of the cover was 2.5MB before this was added).
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 900,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'wide',
        width: 1600,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'hero',
        width: 2400,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        // JPEG, not WebP: some social scrapers still handle it more reliably.
        formatOptions: { format: 'jpeg', options: { quality: 85 } },
      },
    ],
    mimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
  },
  fields: [
    {
      // Stable identity for the migration. Sanity's originalFilename is not
      // unique (four assets were named image.png), so the importer keys off
      // this instead - matching on filename both duplicated and mis-mapped.
      name: 'legacyId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Sanity asset id, set during migration. Blank for anything uploaded since.',
      },
    },
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
  hooks: revalidateHooks,
}
