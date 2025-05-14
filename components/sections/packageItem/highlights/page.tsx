"use client";
import React, { useState } from "react";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/motion-primitives/accordion';
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { cn } from "@/lib/utils";
interface highlightsProps{
  whatsIncluded:string;
  highlights:{
    title:string;
    name:string;
    desc:string;
    coverImage:string;
  }[]
}

const HighLights = ({highlights,whatsIncluded}:highlightsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <section className="flex flex-col gap-12 lg:gap-20 px-5 lg:px-16  py-16 items-center lg:py-28">
      <div className="space-y-5 lg:space-y-6 lg:w-[768px] text-center">
        <h2 className="uppercase">What is Included Inside this package?</h2>
        <p>
          {whatsIncluded}
        </p>
      </div>

      <div className="lg:flex hidden flex-col border border-black w-full">
        <div className="flex bg-brand-grey w-full overflow-x-auto">
          {highlights.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "flex-1 text-sm font-medium py-6 text-center border-black",
                activeIndex === index ? "" : "border-b border-x",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="overflow-hidden bg-brand-grey">
          <TransitionPanel
            activeIndex={activeIndex}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            variants={{
              enter: { opacity: 0, y: -50, filter: "blur(4px)" },
              center: { opacity: 1, y: 0, filter: "blur(0px)" },
              exit: { opacity: 0, y: 50, filter: "blur(4px)" },
            }}
          >
            {highlights.map((item, index) => (
              <div key={index} className="p-12 flex flex-row gap-20">
                <div className="w-full">
                  {item.coverImage && (
                    <div className="w-full lg:size-[340px] xl:size-[440px] relative">
                    <Image
                      src={urlFor(item.coverImage).url()}
                      fill
                      alt={item.name}
                      className="object-cover"
                    />
                  </div>
                  )}
                  
                </div>
                <div className="flex flex-col w-full flex-grow justify-center text-start gap-4 ">
                  <p className="text-base">{item.name}</p>
                  <h2 className="uppercase">
                    {item.title}
                  </h2>
                  <p>
                  {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </TransitionPanel>
        </div>
      </div>

      <Accordion className='flex lg:hidden border border-black w-full flex-col divide-y bg-brand-grey divide-black'>
        {highlights.map((item, index) => (
           <AccordionItem className="p-6" key={index} value={item.title}>
           <AccordionTrigger className='w-full py-0.5 text-left text-zinc-950 dark:text-zinc-50'>
              <h6 className="">
              {item.title}
              </h6>         
           </AccordionTrigger>
           <AccordionContent >
           <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
            <p className='text-base'>{item.title}</p>
            <h2 className='uppercase'>{item.name} </h2>
            <p>{item.desc}</p>
            </div>

            <div className="w-full">
            {item.coverImage && (
                  <div className="w-full aspect-square lg:size-[287px] relative">
                    <Image
                      src={urlFor(item.coverImage).url()}
                      fill
                      alt={item.name}
                      className="object-cover"
                    />
                  </div>)}
                </div>
           </div>
           </AccordionContent>
         </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default HighLights;
