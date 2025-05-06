"use client";

import Image from "next/image";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import { useState } from "react";
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
  const ITEMS = [
    {
      title: "Stage 01",
      subtitle: "We start by doing brand strategy",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
    },
    {
      title: "Stage 02",
      subtitle: "We start by doing brand strategy",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
    },
  ];
  return (
    <section className="flex flex-col gap-12 lg:gap-16 px-5 lg:px-16  py-16 items-center  lg:py-28">
      <div className="flex w-full overflow-x-auto">
        {stages.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={` px-8 py-6 text-sm `}
          >
            <h5
              className={`${
                activeIndex === index
                  ? "font-bold text-black"
                  : "font-medium text-[#AAAAAA]"
              }`}
            >
              {item.stage}
            </h5>
          </button>
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
