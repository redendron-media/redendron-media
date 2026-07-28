import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '../revalidate'

import { anyone, editors } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'System' },
  access: { read: anyone, update: editors },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'siteName', type: 'text', required: true, defaultValue: 'Redendron Media' },
            {
              name: 'tagline',
              type: 'text',
              admin: { description: 'Used as the default meta description suffix.' },
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Fallback social share image for pages without their own.' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email', defaultValue: 'team@redendron.com' },
            { name: 'phone', type: 'text' },
            { name: 'address', type: 'textarea' },
            {
              name: 'socials',
              type: 'array',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: ['Instagram', 'LinkedIn', 'Behance', 'Dribbble', 'X', 'YouTube', 'Facebook'].map(
                    (p) => ({ label: p, value: p.toLowerCase() })
                  ),
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Announcement',
          fields: [
            {
              name: 'announcement',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                { name: 'text', type: 'text' },
                { name: 'linkLabel', type: 'text' },
                { name: 'linkUrl', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobalAfterChange] },
}
