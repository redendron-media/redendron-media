import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Contact = () => {
  return (
    <section className="px-5 py-16 lg:px-16 lg:py-28 bg-white items-center text-black flex flex-col gap-12 lg:gap-16">
      <div className="space-y-6">
        <h2 className="uppercase text-center">have a project in mind?</h2>
      </div>
      <div className="flex flex-row gap-4">
        <Link href={"/getAQuote"}>
          <Button>Get In Touch</Button>
        </Link>
      </div>
    </section>
  );
};

export default Contact;
