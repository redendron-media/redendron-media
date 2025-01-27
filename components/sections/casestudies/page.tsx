import { Button } from "@/components/ui/button";
import CaseCard from "@/components/ui/projectCard/page";
import React from "react";

const CaseStudies = () => {
  return (
    <section className="py-10 max-w-5xl lg:py-16 px-6 lg:px-20 justify-center items-center flex flex-col gap-12 text-center mx-auto">
      <>
        <h2>Here</h2>
        <p>
          Write something about this package relevant case studies. Write
          something about this package relevant case studies. Write something
          about this package relevant case studies. Write something about this
          package relevant case studies. Write something about this package
          relevant case studies.
        </p>
      </>
      <div className="grid grid-cols-1 md:grid-cols-2  gap-10 ">
      <CaseCard/>
      <CaseCard/>
      <CaseCard/>
      <CaseCard/>
      </div>
      <Button className="w-fit">Check out more case studies</Button>
    </section>
  );
};

export default CaseStudies;
