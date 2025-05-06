"use client";
import { BlogTypes } from "@/lib/types";
import { Chip } from "@/components/ui/chip";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

type HeroProps = {
  data: BlogTypes[];
};

const Hero = ({ data }: HeroProps) => {
  const categories = ["All", ...new Set(data.map((item) => item.category))];

  const [activeCategory, setActiveCategory] = useState("All");

  const   filteredData =
    activeCategory === "All"
      ? data
      : data.filter((item) => item.category === activeCategory);

  return (
    <section className="py-16 lg:py-28 flex flex-col gap-12 lg:gap-20">
      {/* INTRO */}
      <div className="lg:w-[60%] flex flex-col gap-3 lg:gap-4">
        <p className="font-semibold">Blog</p>
        <div className="flex flex-col gap-5 lg:gap-6">
          <h1>Ideas, Insights & Industry Notes</h1>
          <p>
            Stay updated with fresh perspectives on branding, design, strategy,
            and everything in between. Our blog is where we share lessons from
            the field, breakdowns of what&apos;s working (and why), and
            actionable insights to help brands think sharper and grow smarter.
          </p>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* FILTERS */}
        <div className="w-[240px] hidden lg:flex flex-col sticky top-24 ">
          <p className="font-bold mb-4">Blog categories</p>
          <div className="flex flex-col">
            {categories.map((cat) => (
              <div
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 cursor-pointer hover:bg-brand-red hover:text-white transition-colors duration-300 ${
                  activeCategory === cat ? "bg-brand-red text-white" : "bg-neutral-lightest"
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* FILTERS MOBILE */}
        <div className="flex flex-wrap gap-2 lg:hidden">
          {categories.map((cat) => (
            <Chip
              key={cat}
              className="shadow-none"
              variant={activeCategory === cat ? "active" : "default"}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>

        {/* BLOG CARDS */}
        <div className="flex flex-col gap-16 w-full">
          {/* FEATURED BLOG - Show first one separately */}
          {filteredData[0] && (
            <div className="hidden lg:flex flex-col gap-6 w-full">
              <Link href={`/blog/${filteredData[0].slug}`}>
                <div className="relative w-full h-[220px] lg:h-[450px] rounded-lg overflow-hidden">
                  <Image
                    src={filteredData[0].coverImage}
                    alt={filteredData[0].name}
                    className="object-cover"
                    fill
                  />
                </div>
              </Link>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4 items-center">
                  <p className="text-sm font-semibold px-2 py-1 bg-neutral-lightest">
                    {filteredData[0].category}
                  </p>
                  <p className="text-sm">{filteredData[0].time} min read</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h5 className="text-2xl font-bold">{filteredData[0].name}</h5>
                  <p>{filteredData[0].caption}</p>
                </div>
              </div>
              <Link
                href={`/blog/${filteredData[0].slug}`}
                className="flex flex-row gap-2 cursor-pointer hover:underline text-brand-red"
              >
                <p>Read more</p>
                <p>{">"}</p>
              </Link>
            </div>
          )}

          {/* OTHER BLOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {filteredData.slice(1).map((item) => (
              <div key={item.slug} className="flex flex-col gap-6 col-span-1">
                <Link href={`/blog/${item.slug}`}>
                  <div className="relative w-full h-[220px] lg:h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={item.coverImage}
                      alt={item.name}
                      className="object-cover"
                      fill
                    />
                  </div>
                </Link>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-4 items-center">
                    <p className="text-sm font-semibold px-2 py-1 bg-neutral-lightest">
                      {item.category}
                    </p>
                    <p className="text-sm">{item.time} min read</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xl font-bold">{item.name}</h4>
                    <p>{item.caption}</p>
                  </div>
                </div>
                <Link
                  href={`/blog/${item.slug}`}
                  className="flex flex-row gap-2 cursor-pointer hover:underline text-brand-red"
                >
                  <p>Read more</p>
                  <p>{">"}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
