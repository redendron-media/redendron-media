"use client";
import BlogCard from "@/components/ui/blogCard/page";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
const Blogs = () => {
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
  return (
    <section className="px-5 py-16 flex flex-col gap-12 lg:gap-16 lg:px-16 lg:py-28 bg-white">
      <div className="flex flex-col">
        <p className="mb-3 lg:mb-4">Blog</p>
        <h2 className="uppercase mb-5 lg:mb-6">pro tips</h2>
        <p>
          Our blog explores how successful brands harness the power of
          integrated branding to create lasting impact. From aligning visual
          identity and messaging to building a seamless customer experience, we
          delve into the strategies that help brands stand out and thrive.
          Discover insights, real-world examples, and practical tips to
          strengthen your brand through cohesive and consistent approaches.
        </p>
        <Button variant={"outline"} className="mt-6 lg:mt-10 w-fit">
          View All
        </Button>
      </div>
      <div className=" flex  flex-col gap-12">
        <div ref={sliderRef} className="keen-slider relative !important">
          <div className="keen-slider__slide">
            <BlogCard />
          </div>
          <div className="keen-slider__slide">
            <BlogCard />
          </div>
          <div className="keen-slider__slide">
            <BlogCard />
          </div>
          <div className="keen-slider__slide">
            <BlogCard />
          </div>
        </div>
        <div className="flex flex-row justify-between items-center">
       
   {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2.5 mt-5 lg:pt-12">
              {[
                ...Array(instanceRef.current.track.details.slides.length).keys(),
              ].map((idx) => {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                    }}
                    className={cn(
                      "size-2 rounded-full",
                      currentSlide === idx
                        ? "bg-black active"
                        : "bg-neutral-lighter"
                    )}
                  ></button>
                );
              })}
            </div>
          )}


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

export default Blogs;
