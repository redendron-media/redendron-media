import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "@/constants/faq";
import { sanityClient } from "@/lib/sanity";
import { FaqType } from "@/lib/types";

  const query = `
  *[_type == "faqs"]{
    "faqs" : faqs[]{
    question, answer}
  }
  `;
async function Faqs() {
  const data: FaqType[] = await sanityClient.fetch(query);
  console.log(data);
  return (
    <section className="px-5 lg:px-16 py-16 lg:py-28 ">
      <div className="flex flex-col gap-12 lg:gap-20 w-full mx-auto md:w-[600px] lg:w-[768px]">
        <div className="flex flex-col text-center gap-5 lg:gap-6">
          <h2>FAQS</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique.
          </p>
        </div>
        <div className="space-y-4">
        {data.length > 0 && data[0].faqs.map((item, index) => (
  <Accordion
    className="border border-black px-5 lg:px-6"
    type="single"
    collapsible
    key={index}
  >
    <AccordionItem value={`item-${index}`}>
      <AccordionTrigger className="font-bold">
        {item.question}
      </AccordionTrigger>
      <AccordionContent>{item.answer}</AccordionContent>
    </AccordionItem>
  </Accordion>
))}
        </div>
      </div>
    </section>
  );
}

export default Faqs;
