"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";

const HeroHome = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    gsap.set([headingRef.current, paraRef.current, buttonsRef.current], {
      autoAlpha: 0,
    });
  
    const tl = gsap.timeline();
    tl.to(buttonsRef.current, {
      x: 20,
      autoAlpha: 1,
      duration: 0.8,
      ease: "power2.out",
    })
  
    // Paragraph: from right
    .to(
      paraRef.current,
      {
        x: -20,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
      },
      "<" // run in parallel with buttons
    )
  
    // Heading: just fade in
    .to(
      headingRef.current,
      {
        autoAlpha: 1,
        duration: 0.5,
        ease: "power1.out",
      },
      "+=0.1" // small delay after both above
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
  Laying the Groundwork for Effective Marketing Results
</h1>

<p ref={paraRef} className="text-white mb-1 lg:mb-2 opacity-0">
Without a clear strategy, it's hard for your brand to stand out and connect with your audience. We believe each brand's unique challenges shape our humanistic approach towards branding. By carefully crafting your brand's identity, voice, and positioning, we ensure your marketing not only reaches people but resonates deeply, creating a trusted presence that drives results.
</p>

<div
  ref={buttonsRef}
  className="flex flex-wrap flex-row pt-4 gap-4 items-center justify-center pointer-events-auto opacity-0"
>
  <Button>Get a quote</Button>
  <Button className="bg-black">Learn more</Button>
</div>
      </div>
    </section>
  );
};

export default HeroHome;
