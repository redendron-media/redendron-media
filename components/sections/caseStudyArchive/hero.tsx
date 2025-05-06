"use client";
import { CaseStudyTypes } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

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
        <section className="p-6 w-[25%] border border-black h-fit">
          <div className="flex flex-col gap-2">
            <h5>FILTERS</h5>
            <hr className="bg-black h-0.5"/>
            <div className=" flex flex-col gap-5">
              <div>
                <div className="flex justify-between py-5 items-center mb-2">
                  <p className="font-semibold">Industry</p>
                  <button
                    onClick={() => setSelectedIndustries([])}
                   
                  >
                    <p> Clear</p>
                   
                  </button>
                </div>
                {industries.map((industry) => (
                  <label
                    key={industry}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(industry)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIndustries([
                            ...selectedIndustries,
                            industry,
                          ]);
                        } else {
                          setSelectedIndustries(
                            selectedIndustries.filter((i) => i !== industry)
                          );
                        }
                      }}
                    />
                    <span>{industry}</span>
                  </label>
                ))}
              </div>
              <hr  className="bg-black h-0.5"/>
              <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Project Type</p>
                <button
                  onClick={() => setSelectedCategory("All")}
               
                >
                  <p>Clear</p>
             
                </button>
              </div>
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 mb-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
            </div>
           
          </div>

          <div className="flex justify-start mt-4">
            <button
              onClick={() => {
                setSelectedIndustries([]);
                setSelectedCategory("All");
              }}
              className="text-brand-red"
            >
              <p>Clear all</p>
              
            </button>
          </div>
        </section>

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
