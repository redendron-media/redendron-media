import type { CollectionConfig } from 'payload'

import { anyone, editors } from '../access'
import { slugField } from '../fields'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    group: 'People',
    useAsTitle: 'title',
    description:
      'Real taxonomy rather than a free-text field, so renaming a category updates every post at once.',
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', admin: { description: 'Shown on the category archive page.' } },
    slugField('title'),
  ],
}
