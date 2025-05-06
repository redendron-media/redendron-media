import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type RelatedBlogProps = {
  data: {
    slug: string;
    name: string;
    coverImage: string;
    caption: string;
    category: string;
    author: string;
    time: string;
    _createdAt?: string;
  }[];
};

const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const RelatedBlog = ({ data }: RelatedBlogProps) => {
  if (!data || data.length === 0) return null;

  return (
    <section className="px-5 lg:px-16 py-16 lg:py-28 flex flex-col gap-12 lg:gap-20">
      <div className="flex flex-col gap-3 lg:gap-6 lg:items-center">
        <h2 className="uppercase">Related posts</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
      </div>
      <div className="flex flex-col gap-10 lg:gap-16  w-full items-center">
        <div className="flex flex-col gap-12 lg:gap-8 w-full lg:flex-row ">
          {data.map((blog) => (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="flex flex-col gap-6 lg:gap-8 w-full lg:w-[300px]"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={blog.coverImage}
                  fill
                  alt="Name"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 ">
                <p className="text-sm">{blog.category}</p>
                <h5>{blog.name}</h5>
                <p>{blog.caption}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">{blog.author}</p>
                <div className="flex flex-row gap-2">
                  <p className="text-sm">{formatDate(blog._createdAt || "")}</p>
                  <p>•</p>
                  <p className="text-sm">{blog.time} min read</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href={"/blog"}>
          <Button variant={"outline"}>
            <p>View all</p>
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default RelatedBlog;
