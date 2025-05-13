// components/CaseStudiesClient.tsx
"use client";

import { Button } from "@/components/ui/button";
import CaseCard from "@/components/ui/projectCard/page";
import { CaseStudyTypes } from "@/lib/types";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import React, { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CaseStudiesClient({ data }: { data: CaseStudyTypes[] }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
  
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse", // you can tweak this
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
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
          },
          "-=0.2"
        );
    }, sectionRef);
  
    return () => ctx.revert(); // clean up
  }, []);
  

  return (
    <section
    ref={sectionRef}
    className="py-10 max-w-5xl lg:py-16 px-6 lg:px-20 justify-center items-center flex flex-col gap-12 text-center mx-auto"
  >
    <h2 ref={headingRef}>Our Works</h2>
    <p ref={paraRef}>
      Building impactful solutions begins with understanding what makes your
      brand exceptional...
    </p>
    <div
      ref={cardsRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-10"
    >
      {data.slice(0, 4).map((item) => (
        <CaseCard key={item.slug} data={item} />
      ))}
    </div>
    <Link href="/caseStudies">
      <Button className="w-fit">Check out more case studies</Button>
    </Link>
  </section>
  
  );
}
