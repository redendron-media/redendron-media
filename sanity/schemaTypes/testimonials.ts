import { defineField } from "sanity";

export const testimonials = defineField({
    name:'testimonials',
    type: 'document',
    title: 'Testimonials',
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