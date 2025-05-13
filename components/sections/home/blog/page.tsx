"use client";
import BlogCard from "@/components/ui/blogCard/page";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { BlogTypes } from "@/lib/types";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Loader } from "lucide-react";

const fetchBlogs = async () => {
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
 return await sanityClient.fetch(query);
}
const Blogs = () => {

  const { data, isLoading, error } = useQuery<BlogTypes[]>(
      "blog",
      () => fetchBlogs(),
      {
        retry: 2,
        staleTime: 1000 * 60 * 5,
      }
    );
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    breakpoints: {
      "(min-width: 500px)": {
        slides: { perView: 2, spacing: 10 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 2.5, spacing: 16 },
      },
      "(min-width: 1440px)": {
        slides: { perView: 3, spacing: 16 },
      },
    },
    slides: { perView: 1, spacing: 10 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        }}
      >
        <Loader color="black" />
      </div>
    );
  }

  if (error) {
    console.error("Failed to load package data:", error);
    return <div>Failed to load package data.</div>;
  }

  return (
    <section className="px-5 py-16 flex flex-col gap-12 lg:gap-16 lg:px-16 lg:py-28 bg-white">
      <div className="flex flex-col">
        <p className="mb-3 lg:mb-4">Blog</p>
        <h2 className="uppercase mb-5 lg:mb-6">pro tips</h2>
        <p>
        Our blog shares ideas and lessons from our journey, offering valuable insights for businesses of all kinds. Whether you’re refining your approach or starting fresh, find practical tips, real-world examples, and inspiration to help your business thrive.
        </p>
        <Link href={'/blog'} className="mt-6 lg:mt-10 w-fit">
        <Button variant={"outline"} >
          View All
        </Button>
        </Link>
        
      </div>
      <div className=" flex  flex-col gap-12">
      <div ref={sliderRef} className="keen-slider relative !important">
  {data?.map((blog) => (
    <div className="keen-slider__slide" key={blog.slug}>
      <BlogCard
        name={blog.name}
        slug={blog.slug}
        coverImage={blog.coverImage}
        caption={blog.caption}
        category={blog.category}
        time={blog.time}
      />
    </div>
  ))}
</div>

        <div className="flex flex-row justify-end items-center">
          {loaded && instanceRef.current && (
            <div className=" flex gap-4">
              <button
                onClick={(e: any) =>
                  e.stopPropagation() || instanceRef.current?.prev()
                }
                disabled={currentSlide === 0}
                className="size-10 rounded-full border bg-white border-black flex items-center justify-center "
              >
                <Icon icon={"formkit:arrowleft"} className="text-base" />
              </button>

              <button
                onClick={(e: any) =>
                  e.stopPropagation() || instanceRef.current?.next()
                }
                disabled={
                  currentSlide ===
                  instanceRef.current.track.details.slides.length - 1
                }
                className="size-10 rounded-full border bg-white border-black flex items-center justify-center "
              >
                <Icon icon={"formkit:arrowright"} className="text-base" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


const queryClient = new QueryClient();

const QuotesWrapper: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Blogs />
    </QueryClientProvider>
  );
};

export default QuotesWrapper;
