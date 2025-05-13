// app/caseStudies/page.tsx or any route

import { sanityClient } from "@/lib/sanity";
import { CaseStudyTypes } from "@/lib/types";
import CaseStudiesClient from "../caseStudyClient/page";

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

export default async function CaseStudies() {
  const data: CaseStudyTypes[] = await sanityClient.fetch(query);

  return <CaseStudiesClient data={data} />;
}
