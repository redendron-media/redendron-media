// app/packages/page.tsx or any route file

import { sanityClient } from "@/lib/sanity";
import { Packages as PackagesType } from "@/lib/types";
import PackagesClient from "../hero/packagedClient/page";


export const revalidate = 600;

const query = `
  *[_type == "packages"]{
    title,
    "slug": slug.current,
    "coverImage": coverImage.asset->url,
    description
  }
`;

export default async function Packages() {
  const data: PackagesType[] = await sanityClient.fetch<PackagesType[]>(query);
  return <PackagesClient data={data} />;
}
