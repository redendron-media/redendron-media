import type { CollectionConfig } from 'payload'

import { admins } from '../access'

/**
 * Leads live in our own database first.
 *
 * On the old site a submission went straight to Brevo and nowhere else, so any
 * Brevo outage or API change lost the enquiry silently - the route only
 * console.logged the failure. Here the record is written locally and Brevo
 * sync is tracked as its own state, so a failed sync is visible and
 * retryable rather than invisible.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    group: 'System',
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'source', 'budget', 'status', 'createdAt'],
    description: 'Every enquiry from the site. Never edited by the public.',
  },
  access: {
    // Public submissions come through a server action using the Local API with
    // overrideAccess, so nothing here needs to be world-writable.
    read: admins,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, index: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          defaultValue: 'quote',
          options: [
            { label: 'Quote form', value: 'quote' },
            { label: 'Contact form', value: 'contact' },
            { label: 'Newsletter', value: 'newsletter' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Proposal sent', value: 'proposal' },
            { label: 'Won', value: 'won' },
            { label: 'Lost', value: 'lost' },
          ],
        },
      ],
    },

    // Quote-form specifics
    {
      name: 'budget',
      type: 'text',
      admin: { description: 'Budget band selected in the quote form.' },
    },
    { name: 'timeline', type: 'text', admin: { description: 'When they want to start.' } },
    { name: 'company', type: 'text' },
    { name: 'website', type: 'text' },
    { name: 'businessDescription', type: 'textarea' },
    { name: 'projectGoals', type: 'textarea', admin: { description: 'What they want help with, and how they will measure success.' } },
    { name: 'message', type: 'textarea', admin: { description: 'Contact-form message body.' } },
    {
      name: 'referral',
      type: 'json',
      admin: { description: 'How they heard about Redendron.' },
    },

    // Internal
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal notes. Never shown publicly.' },
    },

    // Brevo sync state
    {
      name: 'brevo',
      type: 'group',
      label: 'Brevo sync',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Synced', value: 'synced' },
            { label: 'Failed', value: 'failed' },
            { label: 'Skipped (no API key)', value: 'skipped' },
          ],
        },
        { name: 'syncedAt', type: 'date' },
        { name: 'error', type: 'textarea', admin: { readOnly: true } },
      ],
    },

    // Request metadata, useful for spam triage
    {
      name: 'meta',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'page', type: 'text', admin: { description: 'Page the form was submitted from.' } },
        { name: 'userAgent', type: 'text' },
      ],
    },
  ],
  timestamps: true,
}
