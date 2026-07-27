import type { CollectionConfig } from 'payload'

import { anyone, editors } from '../access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Proof',
    useAsTitle: 'author',
    defaultColumns: ['author', 'company', 'featured'],
  },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'author', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Company logo, shown alongside the quote where the layout allows.' },
    },
    {
      name: 'caseStudy',
      type: 'relationship',
      relationTo: 'case-studies',
      admin: { description: 'Optional link to the work this quote refers to.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Eligible for the homepage.' },
    },
  ],
}
