import { defineField, defineType } from "sanity";

export const clientLogo = defineType({
    name: 'clientLogo',
  title: 'Client Logo',
    type:"document",
    fields: [
        defineField( {
            name: 'name',
            title: 'Client Name',
            type: 'string',
          },),
          defineField({
            name: 'logo',
            title: 'Logo Image',
            type: 'image',
            options: {
              accept: 'image/svg+xml',
            },
          })
    ]

})