import { defineField, defineType } from "sanity";

export const aboutUs = defineType({
    name:'about',
    type: 'document',
    title: 'About Us',
    fields: [
        defineField({
            name : 'values',
            type: 'array',
            title: 'Values;',
            of: [
                {
                    type:'object',
                    fields: [
                        defineField({
                            name:'icon',
                            type: 'string',
                            title: 'Icon name (search icon from https://icon-sets.iconify.design/'
                        }),
                        defineField({
                            name: 'title',
                            type: 'string',
                            title: 'Title'
                        }),
                        defineField({
                            name: 'desc',
                            type: 'string',
                            title: 'Description'
                        })
                    ]
                }
            ]
        }),
        defineField({
            name: 'team',
            type: 'array',
            title: 'Team',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'name',
                            type: 'string',
                            title: 'Name'
                        }),
                        defineField({
                            name:'job',
                            type: 'string',
                            title: 'Job'
                        }),
                        defineField({
                            name: 'desc',
                            type: 'string',
                            title: 'Description'
                        }),
                        defineField({
                            name: 'image',
                            type: 'image',
                            title: 'Image',
                            options: {
                                hotspot: true,
                            }
                        }),
                        defineField({
                            name:'linkedin',
                            type: 'string',
                            title: 'LinkedIn'
                        })
                    ]
                }
            ]
        })
    ]
})