import { Button } from "@/components/ui/button";
import React from "react";

const HeroHome = () => {
  return (
    <section className="bg-black py-28 px-5 lg:px-16 w-full text-center  text-balance">
   <div className="max-w-5xl mx-auto">
   <h1 className="text-white mb-5">
        Laying the Groundwork for Effective Marketing Results
      </h1>
      <p className="text-white mb-1 lg:mb-2">
        Without a clear strategy, it’s hard for your brand to stand out and
        connect with your audience. We believe each brand’s unique challenges
        shape our humanistic approach towards branding. By carefully crafting
        your brand’s identity, voice, and positioning, we ensure your marketing
        not only reaches people but resonates deeply, creating a trusted
        presence that drives results.
      </p>
      <div className=" flex flex-row pt-2 gap-2 items-center justify-center">
        <Button>Get a quote</Button>
        <Button className="bg-black">Learn more</Button>
      </div>
   </div>
    </section>
  );
};

export default HeroHome;
