  "use client";

  import { BlogTypes } from "@/lib/types";
  import { Chip } from "@/components/ui/chip";
  import Image from "next/image";
  import Link from "next/link";
  import React, { useRef, useState } from "react";
  import gsap from "gsap";
  import { useGSAP } from "@gsap/react";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  
  type HeroProps = {
    data: BlogTypes[];
  };

  gsap.registerPlugin(ScrollTrigger);


  const Hero = ({ data }: HeroProps) => {
    const categories = ["All", ...new Set(data.map((item) => item.category))];
    const [activeCategory, setActiveCategory] = useState("All");

    const headingRef = useRef<HTMLHeadingElement>(null);
const paraRef = useRef<HTMLParagraphElement>(null);
const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
const featuredRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  gsap.set([headingRef.current, paraRef.current], {
    autoAlpha: 0,
  });

  const tl = gsap.timeline();

  // Paragraph: from right
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
    // Heading: just fade in
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
      "<" // parallel
    );

  // Cards: scroll trigger fade in
  cardsRef.current.forEach((card) => {
    if (card) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
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

useGSAP(() => {
  if (featuredRef.current) {
    gsap.fromTo(
      featuredRef.current,
      {
        autoAlpha: 0,
        y: 40,
        scale: 0.98,
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuredRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }
}, []);

    const filteredData =
      activeCategory === "All"
        ? data
        : data.filter((item) => item.category === activeCategory);

    return (
      <section className="py-16 lg:py-28 flex flex-col gap-12 lg:gap-20">
        {/* INTRO */}
        <div className="lg:w-[60%] flex flex-col gap-3 lg:gap-4">
          <p  className="font-semibold">Blog</p>
          <div className="flex flex-col gap-5 lg:gap-6">
            <h1 ref={headingRef}>Ideas, Insights & Industry Notes</h1>
            <p ref={paraRef}>
              Stay updated with fresh perspectives on branding, design,
              strategy, and everything in between. Our blog is where we share 
              lessons from the field, breakdowns of what&apos;s working (and why), and
              actionable insights to help brands think sharper and grow smarter.
            </p>
          </div>
        </div>

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
                  activeCategory === cat
                    ? "bg-brand-red text-white"
                    : "bg-neutral-lightest"
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE FILTERS */}
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
          {/* DESKTOP ONLY: Featured + Grid */}
          <div className="hidden lg:block">
            {filteredData[0] && (
              <div ref={featuredRef}   className="flex flex-col gap-6 w-full mb-16">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {filteredData.slice(1).map((item,index) => (
                <BlogCard item={item} key={item.slug}  
                refEl={(el) => {
                  cardsRef.current[index] = el;
                }} />
              ))}
            </div>
          </div>

          {/* MOBILE ONLY: Show all vertically */}
          <div className="lg:hidden flex flex-col gap-12">
            {filteredData.map((item,index) => (
              <BlogCard item={item} key={item.slug}  refEl={(el) => {
                cardsRef.current[index] = el;
              }}/>
            ))}
          </div>
        </div>
        </div>

      
      </section>
    );
  };

  const BlogCard = ({
    item,
    refEl,
  }: {
    item: BlogTypes;
    refEl?: (el: HTMLDivElement | null) => void;
  }) => (
    <div ref={refEl} className="flex flex-col gap-6">
      <Link href={`/blog/${item.slug}`}>
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
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
  );

  export default Hero;
