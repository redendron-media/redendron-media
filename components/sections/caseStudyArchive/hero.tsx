"use client";
import { CaseStudyTypes } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import FiltersContent from "./filterContent/page";
type HeroProps = {
  data: CaseStudyTypes[];
};

const Hero = ({ data }: HeroProps) => {
  const categories = ["All", ...new Set(data.flatMap((item) => item.tags))];
  const industries = [...new Set(data.map((item) => item.industry))];

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredData = data.filter((item) => {
    const industryMatch =
      selectedIndustries.length === 0 ||
      selectedIndustries.includes(item.industry);

    const categoryMatch =
      selectedCategory === "All" || item.tags.includes(selectedCategory);

    return industryMatch && categoryMatch;
  });

  return (
    <section className="w-full">
      <div className="flex flex-col lg:gap-20 gap-12 py-16 lg:py-28">
        <div className="flex flex-col gap-5 lg:gap-6">
          <h2>Our Work in Action</h2>
          <p>
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
        <div className="w-full lg:w-[25%]">
          {/* ⬇️ Accordion for small screens */}
          <div className="lg:hidden w-full border border-black p-4 mb-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="filters" className="shadow-none border-0">
                <AccordionTrigger className="py-0">
                <h5>FILTERS</h5>
                </AccordionTrigger>
                <AccordionContent className="border-b-0">
                  <FiltersContent
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

          {/* ⬇️ Sidebar for lg+ screens */}
          <section className="hidden lg:block p-6 border border-black h-fit">
            <FiltersContent
              industries={industries}
              selectedIndustries={selectedIndustries}
              setSelectedIndustries={setSelectedIndustries}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </section>
        </div>

        {/* CASE STUDIES */}
        <div className="grid grid-cols-1 gap-16">
          {filteredData.map((item) => (
            <div
              key={item.slug}
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
                  {/* Use introduction instead of caption */}
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
