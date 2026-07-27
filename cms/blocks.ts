import type { Block } from 'payload'

/**
 * Composable content blocks.
 *
 * These replace the legacy schema's fixed `contentTitle1..8` /
 * `contentImages1..8` slots. An editor now adds any number of blocks of any
 * type in any order, so a case study is shaped by its story rather than by a
 * numbered template.
 */

const widthField = {
  name: 'width',
  type: 'select' as const,
  defaultValue: 'contained',
  options: [
    { label: 'Contained', value: 'contained' },
    { label: 'Wide', value: 'wide' },
    { label: 'Full bleed', value: 'full' },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional section heading.' },
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Small label above the heading, e.g. "The challenge".' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      ...widthField,
      defaultValue: 'contained',
    },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'caption', type: 'text' },
    widthField,
    {
      name: 'parallax',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Image drifts against the scroll. Ignored for reduced-motion visitors.' },
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid-2',
      options: [
        { label: 'Two across', value: 'grid-2' },
        { label: 'Three across', value: 'grid-3' },
        { label: 'Offset / staggered', value: 'offset' },
        { label: 'Horizontal scroll', value: 'scroll' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      minRows: 2,
      required: true,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Results / stats', plural: 'Results / stats' },
  admin: { group: 'Proof' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      required: true,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "312%", "4.2x", "60-page"' },
        },
        { name: 'label', type: 'text', required: true, admin: { description: 'What the number measures.' } },
        { name: 'detail', type: 'text', admin: { description: 'Optional qualifier, e.g. "in the first 90 days".' } },
      ],
    },
  ],
}

export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  labels: { singular: 'Pull quote', plural: 'Pull quotes' },
  admin: { group: 'Proof' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text', admin: { description: 'Name of the person quoted.' } },
    { name: 'role', type: 'text', admin: { description: 'Their title and company.' } },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'upload',
      options: [
        { label: 'Uploaded file', value: 'upload' },
        { label: 'YouTube / Vimeo', value: 'embed' },
      ],
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, sibling) => sibling?.source === 'upload' },
    },
    {
      name: 'url',
      type: 'text',
      admin: { condition: (_, sibling) => sibling?.source === 'embed' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Still frame shown before playback.' },
    },
    { name: 'caption', type: 'text' },
    widthField,
  ],
}

export const SplitBlock: Block = {
  slug: 'split',
  labels: { singular: 'Text + image', plural: 'Text + image' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'imageSide',
      type: 'radio',
      defaultValue: 'right',
      options: [
        { label: 'Image left', value: 'left' },
        { label: 'Image right', value: 'right' },
      ],
    },
    {
      name: 'sticky',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Pin the text while the image scrolls past.' },
    },
  ],
}

export const BeforeAfterBlock: Block = {
  slug: 'beforeAfter',
  labels: { singular: 'Before / after', plural: 'Before / after' },
  admin: { group: 'Proof' },
  fields: [
    { name: 'before', type: 'upload', relationTo: 'media', required: true },
    { name: 'after', type: 'upload', relationTo: 'media', required: true },
    { name: 'beforeLabel', type: 'text', defaultValue: 'Before' },
    { name: 'afterLabel', type: 'text', defaultValue: 'After' },
    { name: 'caption', type: 'text' },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    { name: 'text', type: 'textarea', required: true },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'accent',
      options: [
        { label: 'Accent (oxblood)', value: 'accent' },
        { label: 'Muted', value: 'muted' },
        { label: 'Inverted', value: 'inverted' },
      ],
    },
  ],
}

/** Everything an editor can drop into a long-form body. */
export const contentBlocks: Block[] = [
  RichTextBlock,
  ImageBlock,
  GalleryBlock,
  SplitBlock,
  StatsBlock,
  PullQuoteBlock,
  BeforeAfterBlock,
  VideoBlock,
  CalloutBlock,
]
