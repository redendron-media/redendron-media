"use client";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
const Quotes = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  function Arrow(props: {
    disabled: boolean;
    left?: boolean;
    onClick: (e: any) => void;
  }) {
    const disabled = props.disabled ? " arrow--disabled" : "";
    return (
      <svg
        onClick={props.onClick}
        className={`arrow ${
          props.left ? "arrow--left" : "arrow--right"
        } ${disabled}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        {props.left && (
          <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
        )}
        {!props.left && (
          <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
        )}
      </svg>
    );
  }

  return (
    <section className="bg-brand-grey px-5 pt-16 lg:px-16 lg:py-28 ">
      <div>
        <div ref={sliderRef} className="keen-slider relative">
          <div className="keen-slider__slide number-slide1 w-full bg-red flex flex-col gap-6 lg:gap-8 text-center">
            <h5 className="text-brand-red uppercase text-balance lg:px-16">
              “Of all the things that your company owns, brands are far and away
              the most important and the toughest. Founders die. Factories burn
              down. Machinery wears out. Inventories get depleted. Technology
              becomes obsolete. Brand loyalty is the only sound foundation on
              which business leaders can build enduring, profitable growth.”
            </h5>

            <p className="font-semibold">Jim Mullen</p>
          </div>

          {loaded && instanceRef.current && (
          <>
            < button
             onClick={(e: any) =>
                e.stopPropagation() || instanceRef.current?.prev()
              }
              disabled={currentSlide === 0}
            className="size-10 rounded-full border border-black flex items-center justify-center top-1/2 left-0 absolute">
                <Icon icon={'formkit:arrowleft'} className="text-base"/>
            </button>
        
            <button
              onClick={(e: any) =>
                e.stopPropagation() || instanceRef.current?.next()
              }
              disabled={
                currentSlide ===
                instanceRef.current.track.details.slides.length - 1
              }
              className="size-10 rounded-full border border-black flex items-center justify-center top-1/2 right-0 absolute">
                 <Icon icon={'formkit:arrowright'} className="text-base"/>
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
                className={cn("size-2 rounded-full" ,currentSlide === idx ? "bg-black active" : "bg-neutral-lighter")}
              ></button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Quotes;
