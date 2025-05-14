import Credibility from '@/components/sections/packageItem/credibility/page'
import PackageHero from '@/components/sections/packageItem/hero/page'
import HighLights from '@/components/sections/packageItem/highlights/page'
import CaseStudies from "@/components/sections/home/casestudies/page";
import React from 'react'
import Stage from '@/components/sections/packageItem/stage/page';
import Testimonials from '@/components/sections/packages/testimonials/page';
import Faqs from '@/components/sections/packages/faqs/page';
import Contact from '@/components/sections/home/contact/page';
import { sanityClient } from "@/lib/sanity";
import RelatedPackages from '@/components/sections/packageItem/relatedpackage/page';


 

const fetchPackageData = async (link: string) => {
  
  const query = `
    {
      "packageData": *[_type == "packageItem" && slug.current == $link][0]{
        name,
        title,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        description,
        descpoints,
        whatsIncluded,
        credibility,
        highlights,
        stages
      },
      "relatedPackage": *[_type == "packages" && slug.current != $link]{
        title,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        description
      }
    }
  `;
  
  const data = await sanityClient.fetch(query, { link });

  if (!data.packageData) {
    console.warn("No package found for:", link);
  }

  return data;
};

export default async function PackagePage ({params}: {params: Promise<{ link: string }>}) {
  const {link} = await (params)
  const { packageData, relatedPackage} = await fetchPackageData(link);
  return (
    <main className='py-16 lg:py-28'>
      <PackageHero coverImage={packageData.coverImage} title={packageData.title} name={packageData.name} descpoints={packageData.descpoint} description={packageData.description} />
      <Credibility credibility={packageData.credibility}/>
      <HighLights highlights={packageData.highlights} whatsIncluded={packageData.whatsIncluded}/>
      <CaseStudies/>
      <Stage stages={packageData.stages}/>
      <Testimonials/>
      <Faqs/>
      <Contact/>
      <RelatedPackages data={relatedPackage}/>
    </main>
  )
}

