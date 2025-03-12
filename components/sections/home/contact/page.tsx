import { Button } from "@/components/ui/button";
import React from "react";

const Contact = () => {
  return (
    <section className="px-5 py-16 lg:px-16 lg:py-28 bg-white items-center text-black flex flex-col gap-12 lg:gap-20">
      <div className="space-y-6">
        <h2 className="uppercase text-center">have a project in mind?</h2>
        <p>
          We understand that making a business commitment is a difficult
          decision. That is why we are here to help you choose a package that
          best suits your needs. Every solution we craft aligns with the
          specific needs of your business, depending on the stage of growth it
          is in.
        </p>
      </div>
      <div className="flex flex-row gap-4">
        <Button>Button</Button>
        <Button variant={"outline"}>Button</Button>
      </div>
    </section>
  );
};

export default Contact;
