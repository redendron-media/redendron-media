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