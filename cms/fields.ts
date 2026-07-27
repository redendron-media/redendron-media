import type { Field } from 'payload'

/** Lowercase, hyphen-separated, ASCII-safe. Matches the site's kebab-case URLs. */
export const slugify = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * URL slug, auto-derived from `sourceField` when left blank but always
 * editable. Deriving on the server rather than in the admin UI means imports
 * and API writes get a slug too.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Leave blank to generate from the title. Changing this changes the public URL.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = data?.[sourceField]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})

/**
 * Per-page search metadata. Every public collection gets this so no page can
 * ship without a title and description - the single biggest gap on the old
 * site, where every post inherited the root layout's tags.
 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO & Sharing',
  admin: { position: 'sidebar' },
  fields: [
    {
      name: 'title',
      type: 'text',
      maxLength: 70,
      admin: {
        description: 'Falls back to the page title. Aim for under 60 characters.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 180,
      admin: {
        description: 'Shown in search results and link previews. Aim for 140-160 characters.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Social share image. Falls back to the cover image, then to a generated card.',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Hide this page from search engines.' },
    },
  ],
}

/** Publication date, defaulting to now, used for ordering and display. */
export const publishedAtField: Field = {
  name: 'publishedAt',
  type: 'date',
  admin: {
    position: 'sidebar',
    date: { pickerAppearance: 'dayAndTime' },
    description: 'Used for ordering. Can be backdated or set in the future.',
  },
  hooks: {
    beforeChange: [
      ({ value, siblingData }) => {
        // Stamp on first publish if the editor never touched the field.
        if (!value && siblingData?._status === 'published') return new Date().toISOString()
        return value
      },
    ],
  },
}
