"use client";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import React, { useState } from "react";
import CustomComponents from "@/lib/portableTextComponent";

type ContentSectionProps = {
  heading: string;
  content: any[];
  images: { imageUrl: string }[];
};

const ContentSection = ({ heading, content, images }: ContentSectionProps) => {
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: { perView: 1.25, spacing: 10, origin:'center' },
    created() {
      setLoaded(true);
    },
  });

  return (
    <section className="py-12 lg:py-20 lg:pl-20 pl-5 pr-5 lg:pr-0 w-full flex flex-col gap-6 lg:gap-10">
      {/* HEADING + RICHTEXT */}
      <div className="flex flex-col gap-8 lg:gap-12 lg:pr-52">
        <h4 className="text-3xl font-bold">{heading}</h4>

        {/* Rich Text */}
        <div className="prose max-w-none">
          <PortableText value={content} components={CustomComponents}/>
        </div>
      </div>

      {/* DESKTOP CAROUSEL */}
      {images.length > 0 && (
        <div className="hidden lg:flex">
          <div ref={sliderRef} className="keen-slider hidden lg:relative lg:block">
            {images.map((img, index) => (
              <div key={index} className="keen-slider__slide relative w-full h-[600px]">
                <Image
                  src={img.imageUrl}
                  fill
                  alt={`${heading} Image ${index + 1}`}
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE STACKED IMAGES */}
      {images?.length > 0 && (
        <div className="flex flex-col gap-5 lg:hidden">
          {images.map((img, index) => (
            <div key={index} className="relative w-full h-[324px]">
              <Image
                src={img.imageUrl}
                fill
                alt={`${heading} Image ${index + 1}`}
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ContentSection;
