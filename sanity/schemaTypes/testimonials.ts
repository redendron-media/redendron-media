import { defineField } from "sanity";

export const testimonials = defineField({
    name:'testimonials',
    type: 'document',
    title: 'Testimonials',
    fields: [
        defineField({
            name:'name',
            type:'string',
            title: 'Name'
        }),
        defineField({
            name:'slug',
            type:'slug',
            title: 'Slug',
            options: {
                source:'name'
            }
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
            name:'position',
            type:'string',
            title: 'Position'
        }),
        defineField({
            name:'stars',
            type:'string',
            title: 'Rating (1-5)'
        }),
        defineField({
            name:'company',
            type:'string',
            title: 'Company'
        }),
        defineField({
            name:'testimonial',
            type:'string',
            title: 'Testimonial'
        }),
    ]
})