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
            title: 'Meta Description'
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
        // Replace fixed content blocks with a dynamic sections array
        defineField({
            name: 'sections',
            title: 'Sections',
            type: 'array',
            of: [
                {
                    type: 'object',
                    title: 'Section',
                    fields: [
                        {
                            name: 'sectionTitle',
                            title: 'Section Title',
                            type: 'string',
                        },
                        {
                            name: 'images',
                            title: 'Images',
                            type: 'array',
                            of: [
                                {
                                    type: 'image',
                                    options: { hotspot: true },
                                },
                            ],
                        },
                        {
                            name: 'content',
                            title: 'Content',
                            type: 'array',
                            of: [{ type: 'block' }],
                        },
                    ],
                },
            ],
        }),
    ]

})