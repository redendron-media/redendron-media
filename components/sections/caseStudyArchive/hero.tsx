"use client";
import { CaseStudyTypes } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FiltersContent from "./filterContent/page";

gsap.registerPlugin(ScrollTrigger);


type HeroProps = {
  data: CaseStudyTypes[];
};


const Hero = ({ data }: HeroProps) => {
  const categories = ["All", ...new Set(data.flatMap((item) => item.tags))];
  const industries = [...new Set(data.map((item) => item.industry))];

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");


  const headingRef = useRef<HTMLHeadingElement>(null);
const paraRef = useRef<HTMLParagraphElement>(null);
const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

useGSAP(() => {
  const tl = gsap.timeline();

  // Animate paragraph: from right and fade in
  tl.fromTo(
    paraRef.current,
    {
      x: 20,
      autoAlpha: 0,
    },
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.8,
      ease: "power2.out",
    }
  )
    // Animate heading: just fade in
    .fromTo(
      headingRef.current,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 0.5,
        ease: "power1.out",
      },
      "<" // parallel with para
    );

  // Animate each blog card with scroll trigger
  cardsRef.current.forEach((card) => {
    if (card) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  });
}, []);


  const filteredData = data.filter((item) => {
    const industryMatch =
      selectedIndustries.length === 0 ||
      selectedIndustries.includes(item.industry);

    const categoryMatch =
      selectedCategory === "All" || item.tags.includes(selectedCategory);

    return industryMatch && categoryMatch;
  });
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <section className="w-full">
      <div className="flex flex-col lg:gap-20 gap-12 py-16 lg:py-28">
        <div className="flex flex-col gap-5 lg:gap-6">
          <h2  ref={headingRef} >Our Work in Action</h2>
          <p ref={paraRef}>
            Explore real-world examples of how we&apos;ve helped brands grow,
            transform, and stand out. From strategy and identity to launch and
            beyond — each case study is a behind-the-scenes look at our process,
            the challenges we tackled, and the outcomes we delivered. Dive in to
            see what partnering with us looks like.
          </p>
        </div>
      </div>

      <div className="flex flex-col w-full lg:flex-row gap-8 lg:gap-12">
        {/* FILTERS */}

        {/* ⬇️ Accordion for small screens */}
        <div className="w-full lg:w-[25%]">
          {isMobile ? (
            <div className="border border-black p-4 mb-6">
              <Accordion type="single" collapsible>
                <AccordionItem value="filters" className="shadow-none border-0">
                  <AccordionTrigger className="py-0">
                    <h5>FILTERS</h5>
                  </AccordionTrigger>
                  <AccordionContent className="border-b-0">
                    <FiltersContent
                      key="mobile"
                      industries={industries}
                      selectedIndustries={selectedIndustries}
                      setSelectedIndustries={setSelectedIndustries}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <section className="p-6 border border-black h-fit" key="desktop">
              <FiltersContent
                industries={industries}
                selectedIndustries={selectedIndustries}
                setSelectedIndustries={setSelectedIndustries}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </section>
          )}
        </div>

        {/* CASE STUDIES */}
        <div className="grid grid-cols-1 gap-16">
          {filteredData.map((item,index) => (
            <div
              key={item.slug}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              
              className="w-full lg:w-[600px] xl:w-[700px] flex flex-col gap-6"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={item.coverImage}
                  alt={item.projectName}
                  className="object-cover"
                  fill
                />
              </div>

              <div className="flex flex-col gap-4">
                {/* TAGS */}
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <p
                      key={tag}
                      className="text-sm font-semibold px-2 py-1 bg-neutral-lightest"
                    >
                      {tag}
                    </p>
                  ))}
                  <p className="text-sm font-semibold px-2 py-1 bg-neutral-lightest">
                    {item.industry}
                  </p>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-sm">{item.introduction}</p>{" "}
                
                </div>
              </div>

              {/* LINK */}
              <Link
                href={`/caseStudies/${item.slug}`}
                className="hover:underline text-brand-red transition-all duration-700"
              >
                <div className="flex flex-row gap-2 cursor-pointer">
                  <p className="text-brand-red">Read more</p>
                  <p className="text-brand-red">{">"}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
