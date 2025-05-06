import { defineField, defineType } from "sanity";

export const packageItem = defineType({
    name:'packageItem',
    type: 'document',
    title: 'Package Item',
    fields: [
        defineField({
            name:'name',
            type:'string',
            title: 'Name'
        }),
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
        defineField({
            name:'descpoints',
            title:'Description Points',
            type:'array',
            of:[
                {
                    type:'string'
                }
            ]
        }),
        defineField({
            name:'credibility',
            title:'Credibility',
            type:'array',
            of: [
                {
                    type:'object',
                    fields: [
                        defineField({
                            name:'title',
                            title:'Title',
                            type:'string'
                        }),
                        defineField({
                            name:'value',
                            title:'Value',
                            type:'string'
                        }),
                        defineField({
                            name:'desc',
                            title:'Description',
                            type:'string'
                        })
                    ]
                }
            ]
        }),
        defineField({
            name: 'highlights',
            title: 'Highlights',
            type: 'array',
            of: [
                {
                    type:'object',
                    fields: [
                        defineField({
                            name:'name',
                            title:'Name',
                            type:'string'
                        }),
                        defineField({
                            name:'title',
                            title:'Title',
                            type:'string'
                        }),
                        defineField({
                            name:'desc',
                            title:'Description',
                            type:'string'
                        }),
                        defineField({
                            name:'coverImage',
                            title:'CoverImage',
                            type: 'image',
                            options: {
                                hotspot: true,
                            }
                        }),
                    ]
                }
            ]
        }),
        defineField({
            name:'stages',
            title:'Stages',
            type:'array',
            of: [
                {
                    type:'object',
                    fields:[
                        defineField({
                            name:'stage',
                            title:'Stage',
                            type:'string',
                        }),
                        defineField({
                            name:'title',
                            title:'Title',
                            type:'string',
                        }),
                        defineField({
                            title:'Description',
                            name:'desc',
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
                    ]
                }
            ]
        })
    ]
})