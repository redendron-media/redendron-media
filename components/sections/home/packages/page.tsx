import { Button } from "@/components/ui/button";
import PackageCard from "@/components/ui/packageCard/page";
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { sanityClient } from "@/lib/sanity";
import { Packages  as PackagesType} from "@/lib/types";
import Link from "next/link";

export const revalidate = 600;

const query = `
 *[_type == "packages"]{
  title,
  "slug": slug.current,
  "coverImage": coverImage.asset->url,
  description
}
`

async function Packages  (){
 const data: PackagesType[] = await sanityClient.fetch<PackagesType[]>(query);
  return (
    <section className="px-5 py-16 lg:px-16 lg:py-28 bg-black text-white flex flex-col gap-12 lg:gap-20">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-20">
        <div className="flex flex-col gap-3 lg:gap-4 lg:w-1/2">
          <h6>Integrated Branding Packages</h6>
          <h2 className="uppercase">Solutions for every stage of growth</h2>
        </div>
        <p className="lg:w-1/2">
          These branding packages offer flexibility and depth, supporting your
          brand at every growth stage. From crafting identity and marketing
          plans to building a strong presence and maintaining consistency across
          channels, your specific needs are what informs our strategic approach.
        </p>
      </div>

      <div className="flex flex-col md:flex-row lg:flex-row gap-12 lg:gap-12 xl:gap-16 2xl:gap-20 lg:justify-start xl:px-6">
        {data.map((item) => (
        <PackageCard items={item} key={item.title}/>
        ))}
      
      </div>

      <div className="flex gap-3 lg:gap-4 ">
        <Link href={'/packages'}>
        <Button className="bg-black text-white rounded">Learn More</Button>

        </Link>
        <Link href={'/caseStudies'} className="flex gap-1 py-2 items-center group ">
          <p className=" group-hover:text-brand-red transition-all duration-700">Read case studies</p>
          <Icon className="size-6  group-hover:text-brand-red transition-all duration-700" icon={"material-symbols:chevron-right"} />
        </Link>
      </div>
    </section>
  );
};

export default Packages;
