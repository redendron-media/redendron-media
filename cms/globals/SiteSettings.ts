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
          ],
        },
        {
          // Everything the site chrome renders. Previously these were files in
          // /public, which meant a logo change was a code change.
          label: 'Branding',
          fields: [
            {
              name: 'logoLight',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo — light ground',
              admin: {
                description:
                  'Used wherever the header sits on a pale background. Oxblood mark, ink wordmark.',
              },
            },
            {
              name: 'logoDark',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo — dark ground',
              admin: {
                description:
                  'The reversed lockup. Used in the footer and whenever the header is over a dark section.',
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Square. A PNG at 512x512 or an SVG both work.' },
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
