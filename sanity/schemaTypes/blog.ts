import { defineField } from "sanity";

export const blog = defineField({
    name:'blog',
    type: 'document',
    title: 'Blog',
    fields: [
        defineField({
            name:'Name',
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
            name:'time',
            title:'Time (mins)',
            type:'string',
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
            name:'caption',
            type:'string',
            title:'Caption',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of:[
                {
                    type:'block',
                    marks:{
                        annotations: [
                            {
                                type:'textColor',
                            },
                            {
                                type: 'highlightColor'
                            }
                        ]
                    }
                },
                {type: 'image'}
            ],
        })
    ]
})