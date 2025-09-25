// schemas/caseStudies.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'caseStudies',
  title: 'Case Studies',
  type: 'document',
  fields: [
    defineField({
      name: 'projectName',
      type: 'string',
      title: 'Project Name',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'projectName',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'industry',
      type: 'string',
      title: 'Industry',
    }),
    defineField({
      name: 'introduction',
      type: 'string',
      title: 'Meta Description',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'string',
          title: 'Tag',
        },
      ],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'mission',
      title: 'Mission',
      type: 'string',
    }),
    defineField({
      name: 'impact',
      title: 'Impact',
      type: 'string',
    }),
    defineField({
      name: 'outcome',
      title: 'Outcome',
      type: 'string',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    // Content block 1
    defineField({
      name: 'contentTitle1',
      title: 'Content Title 1',
      type: 'string',
    }),
    defineField({
      name: 'contentImages1',
      title: 'Content Images 1',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content1',
      title: 'Content 1',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 2
    defineField({
      name: 'contentTitle2',
      title: 'Content Title 2',
      type: 'string',
    }),
    defineField({
      name: 'contentImages2',
      title: 'Content Images 2',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content2',
      title: 'Content 2',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 3
    defineField({
      name: 'contentTitle3',
      title: 'Content Title 3',
      type: 'string',
    }),
    defineField({
      name: 'contentImages3',
      title: 'Content Images 3',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content3',
      title: 'Content 3',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 4
    defineField({
      name: 'contentTitle4',
      title: 'Content Title 4',
      type: 'string',
    }),
    defineField({
      name: 'contentImages4',
      title: 'Content Images 4',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content4',
      title: 'Content 4',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 5
    defineField({
      name: 'contentTitle5',
      title: 'Content Title 5',
      type: 'string',
    }),
    defineField({
      name: 'contentImages5',
      title: 'Content Images 5',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content5',
      title: 'Content 5',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 6
    defineField({
      name: 'contentTitle6',
      title: 'Content Title 6',
      type: 'string',
    }),
    defineField({
      name: 'contentImages6',
      title: 'Content Images 6',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content6',
      title: 'Content 6',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 7
    defineField({
      name: 'contentTitle7',
      title: 'Content Title 7',
      type: 'string',
    }),
    defineField({
      name: 'contentImages7',
      title: 'Content Images 7',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content7',
      title: 'Content 7',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Content block 8
    defineField({
      name: 'contentTitle8',
      title: 'Content Title 8',
      type: 'string',
    }),
    defineField({
      name: 'contentImages8',
      title: 'Content Images 8',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'images',
              type: 'image',
              title: 'Images',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'content8',
      title: 'Content 8',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
