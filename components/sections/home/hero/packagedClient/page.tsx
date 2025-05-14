"use client";

import { Button } from "@/components/ui/button";
import PackageCard from "@/components/ui/packageCard/page";
import { Packages as PackagesType } from "@/lib/types";
import Link from "next/link";
import { Icon } from "@iconify/react";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function PackagesClient({ data }: { data: PackagesType[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        headingRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: "power1.out",
        }
      )
        .fromTo(
          paraRef.current,
          { x: 30, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          "<"
        )
        .fromTo(
          cardsRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.4,
          },
          "-=0.2"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-5 py-16 lg:px-16 lg:py-28 bg-black text-white flex flex-col gap-12 lg:gap-20"
    >
      <div className="flex ">
        <div className="flex flex-col gap-3 lg:gap-4 ">
          <h6>Integrated Branding Packages</h6>
         
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-20">
          <h2 ref={headingRef} className="uppercase opacity-0">
          Branding That Works as a System
          </h2>
          <p ref={paraRef} className="lg:w-full opacity-0">
          We don&apos;t do fragmented design or one-off fixes. Our branding bundles are built to align every part of your brand — from strategy to identity to execution — so you launch with clarity, scale with consistency, and grow with purpose.
        </p>
          </div>
        </div>
      
      </div>

      <div className="flex flex-col md:flex-row lg:flex-row gap-12 lg:gap-12 xl:gap-16 2xl:gap-20 lg:justify-start xl:px-6">
        {data.map((item, index) => (
          <div
            key={item.title}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            className="opacity-0"
          >
            <PackageCard items={item} />
          </div>
        ))}
      </div>

      <div className="flex gap-3 lg:gap-4">
        <Link href={"/packages"}>
          <Button className="bg-black text-white rounded">View Packages</Button>
        </Link>
        <Link
          href={"/caseStudies"}
          className="flex gap-1 py-2 items-center group"
        >
          <p className="group-hover:text-brand-red transition-all duration-700">
            Read case studies
          </p>
          <Icon
            className="size-6 group-hover:text-brand-red transition-all duration-700"
            icon={"material-symbols:chevron-right"}
          />
        </Link>
      </div>
    </section>
  );
}
