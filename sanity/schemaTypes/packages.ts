import { defineField, defineType } from "sanity";

export const packages = defineType({
    name:'packages',
    type: 'document',
    title: 'Packages',
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
            name:'coverImage',
            title:'CoverImage',
            type: 'image',
            options: {
                hotspot: true,
            }
        }),
        defineField({
            name:'description',
            type:'string',
            title: 'Description'
        }),
    ]
})