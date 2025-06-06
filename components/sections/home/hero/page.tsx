"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import Link from "next/link";

const HeroHome = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
  
    tl.fromTo(
      buttonsRef.current,
      { x: 20, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
      }
    )
      .fromTo(
        paraRef.current,
        { x: -20, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "<" // parallel with buttons
      )
      .fromTo(
        headingRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.5,
          ease: "power1.out",
        },
        "+=0.1" // slight delay
      );
  }, []);
  
  
  
  return (
    <section
      ref={containerRef}
      className="bg-black relative h-screen flex flex-col items-center justify-center  py-28 px-5 lg:px-16 w-full text-center overflow-hidden text-balance"
    >
      <div className="absolute inset-0 z-0 w-full h-full">
        <InteractiveGridPattern
          className={cn(
            "hidden lg:flex inset-y-[10%] skew-x-6 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          )}
          width={70}
          height={70}
          squares={[80, 80]}
          squaresClassName="hover:fill-brand-red"
        />
        <InteractiveGridPattern
          className={cn(
            "hidden md:flex lg:hidden inset-y-[10%] skew-x-6 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
          )}
          width={40}
          height={40}
          squares={[70, 70]}
          squaresClassName="hover:fill-brand-red"
        />
        <InteractiveGridPattern
          className={cn(
            "md:hidden [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
          )}
          width={30}
          height={30}
          squares={[60, 60]}
          squaresClassName="hover:fill-brand-red"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 pointer-events-none">
      <h1 ref={headingRef} className="text-white mb-5 opacity-0">
      Your Brand Feels Scattered. Your Audience Feels It Too.
</h1>

<p ref={paraRef} className="text-white mb-1 lg:mb-2 opacity-0">
When strategy, identity, website, and marketing don&apos;t talk to each other — your brand pays the price. Confused messaging, inconsistent design, wasted ad spend, and missed opportunities. Integrated Branding fixes that. We build your brand as a unified system — so every piece works together to attract, convert, and grow.
</p>

<div
  ref={buttonsRef}
  className="flex flex-wrap flex-row pt-4 gap-4 items-center justify-center pointer-events-auto opacity-0"
>
<Link href={'/getAQuote'}>
<Button>Get a quote</Button>
</Link>
<Link href={'/packages'}>
<Button className="border-brand-cream text-brand-cream" variant={'outline'}>Learn more</Button>
</Link>
</div>
      </div>
    </section>
  );
};

export default HeroHome;
