"use client";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { cn } from "@/lib/utils";
import { sanityClient } from "@/lib/sanity";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Quotes as QuotesType } from "@/lib/types";
import { Loader } from "lucide-react";

const fetchQuotes = async () => {
  const query = `*[_type == "quotes"]{
     quote,
     author
   }
   `;
  return await sanityClient.fetch(query);
};

const Quotes = () => {
  const { data, isLoading, error } = useQuery<QuotesType[]>(
    "quotes",
    () => fetchQuotes(),
    {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    }
  );

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 4000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

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
    <section className="bg-brand-grey px-5 py-16 lg:px-16 lg:py-28 ">
      <div>
        <div ref={sliderRef} className="keen-slider relative">
          {data?.map((quote, index) => (
            <div
              key={index}
              className="keen-slider__slide number-slide1 w-full bg-red flex flex-col gap-6 lg:gap-8 text-center"
            >
              <h5 className="text-brand-red uppercase text-balance lg:px-16">
                &quot;{quote.quote}&apos;
              </h5>
              {quote.author && <p className="font-semibold">{quote.author}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const queryClient = new QueryClient();

const QuotesWrapper: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Quotes />
    </QueryClientProvider>
  );
};

export default QuotesWrapper;
