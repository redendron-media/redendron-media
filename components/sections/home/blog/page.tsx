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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

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
`;
  return await sanityClient.fetch(query);
};
const Blogs = () => {
  const { data, isLoading, error } = useQuery<BlogTypes[]>(
    "blog",
    () => fetchBlogs(),
    {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    }
  );

  const sectionRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const paraRef = React.useRef<HTMLParagraphElement>(null);
  const buttonRef = React.useRef<HTMLAnchorElement>(null); // Because <Link> wraps it
  useGSAP(() => {
    if (
      !sectionRef.current ||
      !titleRef.current ||
      !paraRef.current ||
      !buttonRef.current
    )
      return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });

    tl.fromTo(
      titleRef.current,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.6,
        ease: "power1.out",
      }
    )
      .fromTo(
        paraRef.current,
        { x: 30, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "<"
      )
      .fromTo(
        buttonRef.current,
        { y: 30, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.3"
      );
  }, []);

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
    <section
      ref={sectionRef}
      className="px-5 py-16 flex flex-col gap-12 lg:gap-16 lg:px-16 lg:py-28 bg-white"
    >
      <div className="flex flex-col">
        <p className="mb-3 lg:mb-4">Blog</p>
        <h2 ref={titleRef} className="uppercase mb-5 lg:mb-6">
          pro tips
        </h2>
        <p ref={paraRef}>
          Our blog explores how successful brands harness the power of
          integrated branding to create lasting impact. From aligning visual
          identity and messaging to building a seamless customer experience, we
          delve into the strategies that help brands stand out and thrive.
          Discover insights, real-world examples, and practical tips to
          strengthen your brand through cohesive and consistent approaches.
        </p>
        <Link ref={buttonRef} href={"/blog"} className="mt-6 lg:mt-10 w-fit">
          <Button variant={"outline"}>View All</Button>
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
