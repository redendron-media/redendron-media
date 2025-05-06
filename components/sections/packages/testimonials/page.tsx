"use client";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import PackageTestimonailCard from "@/components/ui/packageTestimonialCard/page";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { Testimonials as TestimonialsType } from "@/lib/types";
import { Loader } from "lucide-react";
import { sanityClient } from "@/lib/sanity";
export const revalidate = 600;

const fetchTestimonials = async () => {
  const query = `
  *[_type == "testimonials"]{
   name,
   position,
   company,
   testimonial
 }
 `;
  return await sanityClient.fetch(query);
};

const Testimonials = () => {
  const { data, isLoading, error } = useQuery<TestimonialsType[]>(
    "testimonials",
    () => fetchTestimonials(),
    {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    }
  );

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
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
    <section className="px-5 lg:px-16 py-16 lg:py-28 ">
      <div className=" flex flex-col-reverse lg:flex-col gap-12">
        <div ref={sliderRef} className="keen-slider relative !important">
          {data?.map((item, index) => (
            <div className="keen-slider__slide" key={index}>
              <PackageTestimonailCard items={item} />
            </div>
          ))}
        </div>
        <div className="flex flex-row justify-between items-center">
          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2.5 mt-5 lg:pt-12">
              {[
                ...Array(
                  instanceRef.current.track.details.slides.length
                ).keys(),
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


const queryClient = new QueryClient();

const TestimonialsWrapper: React.FC = () => {
return(
  <QueryClientProvider client={queryClient}>
    <Testimonials/>
  </QueryClientProvider>
)
}
export default TestimonialsWrapper;
