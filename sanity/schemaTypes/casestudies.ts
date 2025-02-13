import { defineField } from "sanity";

export const caseStudies = defineField({
    name:'case-studies',
    type: 'document',
    title: 'Case Studies',
    fields: [
        defineField({
            name:'title',
            type:'string',
            title: 'Title'
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
        })
    ]

})