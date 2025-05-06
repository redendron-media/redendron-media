import { Button } from "@/components/ui/button";
import CaseCard from "@/components/ui/projectCard/page";
import { sanityClient } from "@/lib/sanity";
import { CaseStudyTypes } from "@/lib/types";
import Link from "next/link";
import React from "react";

const query = `
*[_type == "caseStudies"]{
  "slug": slug.current,
  "coverImage": coverImage.asset->url,
  projectName,
  industry,
  introduction,
  tags,
 }
`;

async function CaseStudies() {
  const data: CaseStudyTypes[] =
    await sanityClient.fetch<CaseStudyTypes[]>(query);
  return (
    <section className="py-10 max-w-5xl lg:py-16 px-6 lg:px-20 justify-center items-center flex flex-col gap-12 text-center mx-auto">
      <>
        <h2>Our Works</h2>
        <p>
          Building impactful solutions begins with understanding what makes your
          brand exceptional. Explore our case studies to see how we’ve partnered
          with brands like yours, combining meticulous strategy and
          collaborative execution to achieve results that drive growth.
        </p>
      </>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {data.slice(0, 4).map((item) => (
          <CaseCard key={item.slug} data={item} />
        ))}
      </div>
      <Link href={"/caseStudies"}>
        <Button className="w-fit">Check out more case studies</Button>
      </Link>
    </section>
  );
}

export default CaseStudies;
