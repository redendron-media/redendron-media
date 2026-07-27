import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    // Only admins can create or delete accounts; editors can update their own.
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) =>
      user?.role === 'admin' ? true : { id: { equals: user?.id } },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Stops an editor from promoting themselves to admin.
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
