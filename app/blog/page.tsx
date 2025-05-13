import Hero from '@/components/sections/blog/hero/page'
import Newsletter from '@/components/sections/newsletter/page'
import { sanityClient } from '@/lib/sanity'
import { BlogTypes } from '@/lib/types'
import React from 'react'

const query = `
 *[_type == "blog"]{
   name,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        time,
        caption,
        category,
      }
`


async function Blogs (){
  const data: BlogTypes[] = await sanityClient.fetch<BlogTypes[]>(query);
  return (
   <main className='px-5 lg:px-16'>
     <Hero data={data} />
    {/* <Newsletter/> */}

   </main>
  )
}

export default Blogs