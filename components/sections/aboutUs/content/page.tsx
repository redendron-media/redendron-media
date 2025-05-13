"use client";

import Image from 'next/image';
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const Content = () => {
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // Animate <p> elements from right
    paraRefs.current.forEach((p) => {
      if (p) {
        gsap.fromTo(
          p,
          { x: 40, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: p,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    // Animate images fade in on scroll
    imageRefs.current.forEach((img) => {
      if (img) {
        gsap.fromTo(
          img,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });
  }, []);
  
  return (
    <main className="px-5 lg:px-16">
      <section className="py-16 lg:py-28 flex flex-col gap-12 lg:gap-20">
        <div className="flex flex-col lg:flex-row gap-14">
          <h2 className="uppercase text-balance">
            Born in Gangtok, Sikkim, our roots keep us grounded.
          </h2>
          <p
           ref={(el) => {
            paraRefs.current[0] = el;
          }}
          
          >
            We believe marketing isn&apos;t about shouting louder; it&apos;s about speaking truer. For the dreamers, the artisans, the brands who refuse to compromise their values for vanity metrics, we craft narratives that don&apos;t just sell—they resonate.
          </p>
        </div>
        <div
          ref={(el) => {imageRefs.current[0] = el}}
          className="relative w-full aspect-video lg:aspect-auto lg:h-[738px] opacity-0"
        >
          <Image
            src={"/placeholder.png"}
            alt="Redendron"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <section className="py-16 lg:py-28 flex flex-col gap-12 lg:gap-20">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-14">
          <h2 className="uppercase">Your brand is a legacy</h2>
          <p
            className="lg:w-1/2"
            ref={(el) => {paraRefs.current[1] = el}}
          >
            It&apos;s the late nights, the calloused hands, the “why” that keeps you
            awake yet alive. That&apos;s why we weave strategies steeped in honesty, not
            hype. From Himalayan villages to global stages, we help you turn sincerity
            into your sharpest edge - because profit without purpose is hollow, but
            purpose without profit is unsustainable.
            <br />
            <br />
            Let&apos;s build something that outlasts algorithms.
            <br />
            <br />
            Let&apos;s make your truth&apos;unignorable.
          </p>
        </div>
        <div
          ref={(el) => {imageRefs.current[1] = el}}
          className="relative w-full aspect-video lg:aspect-auto lg:h-[738px] opacity-0"
        >
          <Image
            src={"/placeholder.png"}
            alt="Redendron"
            fill
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
};

export default Content;