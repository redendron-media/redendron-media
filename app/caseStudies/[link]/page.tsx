import Hero from "@/components/sections/caseStudies/hero/page";

import { sanityClient } from "@/lib/sanity";
import React from "react";
import Testimonials from "@/components/sections/packages/testimonials/page";
import ContentSection from "@/components/sections/caseStudies/contentSection/page";
//export const revalidate = 600;

interface Props {
  params: {
    link: string;
  };
}

const fetchPackageData = async (link: string) => {
  const query = `
  *[_type == "caseStudies" && slug.current == $link][0]{
    title,
    "slug": slug.current,
    "coverImage": coverImage.asset->url,
    introduction,
    projectName,
    industry,
    tags,
    mission,
    impact,
    outcome,
    services,
    contentTitle1,
    contentTitle2,
    contentTitle3,
    contentTitle4,
    contentImages1[]{
      "imageUrl": images.asset->url
    },
    contentImages2[]{
      "imageUrl": images.asset->url
    },
    contentImages3[]{
      "imageUrl": images.asset->url
    },
    contentImages4[]{
      "imageUrl": images.asset->url
    },
    content1,
    content2,
    content3,
    content4
  }
`;

  const data = await sanityClient.fetch(query, { link });

  if (!data.packageData) {
    console.warn("No package found for:", link);
  }

  return data;
};

async function CaseStudy({ params }: Props) {
  const link = decodeURIComponent(params.link);
  const data = await fetchPackageData(link);
  return (
    <main className="pt-32">
      <Hero
        projectname={data.projectName}
        coverImage={data.coverImage}
        impact={data.impact}
        mission={data.mission}
        outcome={data.outcome}
        services={data.services}
      />
      <ContentSection
        heading={data.contentTitle1}
        content={data.content1}
        images={data.contentImages1}
      />

      <ContentSection
        heading={data.contentTitle2}
        content={data.content2}
        images={data.contentImages2}
      />

      <ContentSection
        heading={data.contentTitle3}
        content={data.content3}
        images={data.contentImages3}
      />

      <ContentSection
        heading={data.contentTitle4}
        content={data.content4}
        images={data.contentImages4}
      />
      <Testimonials />
    </main>
  );
}

export default CaseStudy;
