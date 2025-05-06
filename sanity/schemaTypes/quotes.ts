import { defineField } from "sanity";

export const quotes = defineField({
    name:'quotes',
    type: 'document',
    title: 'Quotes',
    fields:[
        defineField({
            name:'quote',
            type:'string',
            title:'Quote',
        }),
        defineField({
            name:'author',
            type:'string',
            title:'Author',
        }),
    ]
})