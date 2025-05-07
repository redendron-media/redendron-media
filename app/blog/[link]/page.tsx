import Content from "@/components/sections/blogpage/content";
import Hero from "@/components/sections/blogpage/page";
import RelatedBlog from "@/components/sections/blogpage/related";
import Newsletter from "@/components/sections/newsletter/page";
import { sanityClient } from "@/lib/sanity";
import React from "react";

// Fetch function
const fetchPackageData = async (link: string) => {
  const query = `
    {
      "blogs": *[_type == "blog" && slug.current == $link][0]{
        name,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        time,
        caption,
        category,
        author,
        designation,
        company,
        _createdAt,
        content[]{
          ...,
          _type == "image" => {
            ...,
            "url": asset->url,
            "alt": alt
          }
        }
      },
      "relatedBlogs": *[_type == "blog" && slug.current != $link] | order(_createdAt desc) [0...3] {
        name,
        "slug": slug.current,
        "coverImage": coverImage.asset->url,
        caption,
        category,
        author,
        time,
        _createdAt
      }
    }
  `;

  const data = await sanityClient.fetch(query, { link });

  if (!data.blogs) {
    console.warn("No blog found for:", link);
    // Optionally throw an error or return a default value
    throw new Error(`Blog not found for link: ${link}`);
  }

  return data;
};

export default async function Blog({params}: {params: Promise<{ link: string }>}) {
  const { link }= await (params);

  // Fetch blog data
  const { blogs, relatedBlogs } = await fetchPackageData(link);

  return (
    <main>
      <Hero data={blogs} />
      <Content
        content={blogs.content}
        author={blogs.author}
        designation={blogs.designation}
        company={blogs.company}
        category={blogs.category}
      />

      <section className="px-5 lg:px-16">
        <Newsletter />
        <RelatedBlog data={relatedBlogs} />
      </section>
    </main>
  );
}
