import { defineField } from "sanity";

export const caseStudies = defineField({
    name:'caseStudies',
    type: 'document',
    title: 'Case Studies',
    fields: [
        defineField({
            name:'projectName',
            type:'string',
            title: 'Project Name'
        }),
        defineField({
            name:'slug',
            type:'slug',
            title: 'Slug',
            options: {
                source:'title'
            }
        }),
        defineField({
            name:'industry',
            type:'string',
            title: 'Industry'
        }),
        defineField({
            name:'introduction',
            type:'string',
            title: 'Introduction'
        }),
        defineField({
            name:'tags',
            title: 'Tags',
            type: "array",
            of:[
                {
                    type:'string',
                    title: 'Tags'
                }
            ]
        }),
        defineField({
            name:'coverImage',
            title:'CoverImage',
            type: 'image',
            options: {
                hotspot: true,
            }
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
            of: [
                {type: 'string',}
            ]
        }),
        defineField({
            name: 'contentTitle1',
            title: 'Content Title 1',
            type:'string'
        }),
        defineField({
            name:'contentImages1',
            title:'Content Images 1',
            type:'array',
            of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'images',
                      type: 'image',
                      title: 'Images',
                      options: {
                        hotspot: true,
                      },
                    },
                  ],
                },
              ],
        }),
        defineField({
            name:'content1',
            type:'array',
            title:'Content 1',
            of: [
                {
                    type:'block',
                },
            ],
        }),
        defineField({
            name: 'contentTitle2',
            title: 'Content Title 2',
            type:'string'
        }),
        defineField({
            name:'contentImages2',
            title:'Content Images 2',
            type:'array',
            of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'images',
                      type: 'image',
                      title: 'Images',
                      options: {
                        hotspot: true,
                      },
                    },
                  ],
                },
              ],
        }),
        defineField({
            name:'content2',
            type:'array',
            title:'Content 2',
            of: [
                {
                    type:'block',
                },
            ],
        }),

        defineField({
            name: 'contentTitle3',
            title: 'Content Title 3',
            type:'string'
        }),
        defineField({
            name:'contentImages3',
            title:'Content Images 3',
            type:'array',
            of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'images',
                      type: 'image',
                      title: 'Images',
                      options: {
                        hotspot: true,
                      },
                    },
                  ],
                },
              ],
        }),
        defineField({
            name:'content3',
            type:'array',
            title:'Content 3',
            of: [
                {
                    type:'block',
                },
            ],
        }),

        defineField({
            name: 'contentTitle4',
            title: 'Content Title 4',
            type:'string'
        }),
        defineField({
            name:'contentImages4',
            title:'Content Images 4',
            type:'array',
            of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'images',
                      type: 'image',
                      title: 'Images',
                      options: {
                        hotspot: true,
                      },
                    },
                  ],
                },
              ],
        }),
        defineField({
            name:'content4',
            type:'array',
            title:'Content 4',
            of: [
                {
                    type:'block',
                },
            ],
        }),
    ]

})