"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Hero = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      headingRef.current,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 1,
        ease: "power2.out",
      }
    ).fromTo(
      paraRef.current,
      { x: -30, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 1,
        ease: "power2.out",
      },
      "<>" 
    );
  }, []);

  return (
    <section className="px-5 lg:px-16 py-16 lg:py-28 flex justify-center">
      <div className="flex flex-col gap-2 lg:gap-6 w-full lg:w-[51%] text-center">
        <h1 ref={headingRef} className="uppercase opacity-0">
          At Redendron Media, we don&apos;t chase trends.
        </h1>
        <p ref={paraRef} className="opacity-0">
          We chase truth. In a world drowning in digital noise, we help brands
          find their unshakable core—the raw, human heartbeat that makes them
          anti-fragile. Not just resilient, but stronger when tested.
        </p>
      </div>
    </section>
  );
};

export default Hero;
