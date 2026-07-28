import type { CollectionConfig } from 'payload'

import { revalidateHooks } from '../revalidate'

import { anyone, editors } from '../access'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    group: 'Proof',
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    description: 'Logos for the client marquee.',
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'SVG preferred. It will be rendered in a single flat colour.' },
    },
    { name: 'url', type: 'text', admin: { description: 'Optional link to the client site.' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: revalidateHooks,
}
