"use client";

import Image from "next/image";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import React, { useState } from "react";
import { urlFor } from "@/lib/sanity";

interface stageProps {
  stages: {
    stage: string;
    coverImage: string;
    title: string;
    desc: string;
  }[];
}
const Stage = ({ stages }: stageProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <section className="flex flex-col gap-12 lg:gap-16 px-5 lg:px-16  py-16 items-center  lg:py-28">
  <div className="flex w-full items-center overflow-x-auto px-4 py-6">
  {stages.map((item, index) => (
    <React.Fragment key={index}>
      {/* Stage label as button */}
      <button
        onClick={() => setActiveIndex(index)}
        className={`relative z-10 px-6 py-2 text-sm whitespace-nowrap transition-colors duration-300 ${
          activeIndex >= index
            ? "font-bold text-black"
            : "font-medium text-[#AAAAAA]"
        }`}
      >
        <h5>
          {item.stage}
        </h5>
      </button>

      {/* Connecting line (not after last item) */}
      {index < stages.length - 1 && (
       <div className="relative w-24 min-w-[48px] h-[2px] flex items-center">
 {/* longer line for desktop */}
          {/* Grey base line */}
          <div className="absolute w-full h-full bg-[#AAAAAA]" />
          {/* Black animated fill */}
          <div
            className={`absolute h-full bg-black transition-all duration-500 ease-in-out z-30 ${
              activeIndex > index ? "w-full" : "w-0"
            }`}
          />
        </div>
      )}
    </React.Fragment>
  ))}
</div>



      <div className="overflow-hidden">
        <TransitionPanel
          activeIndex={activeIndex}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          variants={{
            enter: { opacity: 0, y: -50, filter: "blur(4px)" },
            center: { opacity: 1, y: 0, filter: "blur(0px)" },
            exit: { opacity: 0, y: 50, filter: "blur(4px)" },
          }}
        >
          {stages.map((item, index) => (
            <div
              key={index}
              className=" flex flex-col lg:flex-row gap-12 lg:gap-20"
            >
              <div className="flex flex-col flex-grow justify-center text-start  gap-5 lg:gap-6 ">
                <h3>{item.stage}</h3>
                <h4 className="uppercase">{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <div className="w-full">
                {item.coverImage && (
                  <div className="w-full aspect-square  lg:size-[500px] relative">
                    <Image
                      src={urlFor(item.coverImage).url()}
                      fill
                      alt={item.title}
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </TransitionPanel>
      </div>
    </section>
  );
};

export default Stage;
