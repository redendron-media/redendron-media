import Hero from '@/components/sections/caseStudyArchive/hero'
import { sanityClient } from '@/lib/sanity';
import { CaseStudyTypes } from '@/lib/types';
import React from 'react'


const query = `
*[_type == "caseStudies"]{
  "slug": slug.current,
  "coverImage": coverImage.asset->url,
  projectName,
  industry,
  introduction,
  tags,
  title,}
`;

async function CaseStudies () {
   const data: CaseStudyTypes[] = await sanityClient.fetch<CaseStudyTypes[]>(query);
  return (
   <main className='px-5 lg:px-16'>
    <Hero data={data}/>
   </main>
  )
}

export default CaseStudies