import type { CollectionConfig } from 'payload'

import { anyone, editors } from '../access'
import { slugField } from '../fields'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    group: 'People',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role'],
    description: 'Write each person once and reference them from posts.',
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', admin: { description: 'e.g. "Brand Strategist".' } },
    { name: 'bio', type: 'textarea' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'links',
      type: 'group',
      fields: [
        { name: 'linkedin', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'website', type: 'text' },
      ],
    },
    slugField('name'),
  ],
}
