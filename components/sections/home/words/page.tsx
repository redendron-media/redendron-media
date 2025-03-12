"use client";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { sanityClient } from "@/lib/sanity";
import TestimonailCard from "@/components/ui/testimonialCard/page";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { Testimonials } from "@/lib/types";
import { Loader } from "lucide-react";
export const revalidate = 600;

const fetchTestimonials = async() => {
  const query = `
  *[_type == "testimonials"]{
   name,
   "coverImage": coverImage.asset->url,
   position,
   stars,
   company,
   testimonial
 }
 `;
 return await sanityClient.fetch(query);
}


const WordFromClients =() => {
  const { data, isLoading, error } = useQuery<Testimonials[]>(
    "testimonials",
    () => fetchTestimonials(),
    {
      retry: 2,
      staleTime: 1000 * 60 * 5
    }
  );

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    breakpoints: {
      "(min-width: 500px)": {
        slides: { perView: 2, spacing: 10, origin: "center" },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 16, origin: "center" },
      },
      "(min-width: 1440px)": {
        slides: { perView: 4, spacing: 16, origin: "center" },
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
    <section className="px-5 lg:px-0 py-16 bg-brand-grey flex flex-col gap-12 ">
      <div className="flex flex-col gap-5 lg:gap-6 lg:px-[127px]">
        <h2 className="text-center">WORDS FROM OUR CLIENTS</h2>
        <p className="lg:px-[116px] text-center">
          Here&apos;s what those who placed their trust in us have to say about
          their journey, and the results we&apos;ve achieved together.
        </p>
      </div>

      <div className="w-full px-5  pt-16">
        <div className="">
          <div ref={sliderRef} className="keen-slider relative !important">
            {data?.map((item, idx) => (
              <div className="keen-slider__slide" key={idx}>
                <TestimonailCard items={item} />
              </div>
            ))}

            {loaded && instanceRef.current && (
              <>
                <button
                  onClick={(e: any) =>
                    e.stopPropagation() || instanceRef.current?.prev()
                  }
                  disabled={currentSlide === 0}
                  className="size-10 rounded-full border bg-brand-grey border-black hidden lg:flex items-center justify-center top-1/2 left-0 absolute"
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
                  className="size-10 rounded-full border bg-brand-grey border-black hidden lg:flex items-center justify-center top-1/2 right-0 absolute"
                >
                  <Icon icon={"formkit:arrowright"} className="text-base" />
                </button>
              </>
            )}
          </div>
        </div>
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
      </div>
    </section>
  );
}

const queryClient = new QueryClient();

const WordsFromClientsWrapper: React.FC = () => {
return(
  <QueryClientProvider client={queryClient}>
    <WordFromClients/>
  </QueryClientProvider>
)
}

export default WordsFromClientsWrapper;
