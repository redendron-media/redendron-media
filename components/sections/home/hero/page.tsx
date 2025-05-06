import { Button } from "@/components/ui/button";
import React from "react";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";

const HeroHome = () => {
  return (
    <section className="bg-black relative h-screen flex flex-col items-center justify-center  py-28 px-5 lg:px-16 w-full text-center overflow-hidden text-balance">
   <div className="absolute inset-0 z-0 w-full h-full">
  <InteractiveGridPattern
    className={cn(
      "hidden lg:flex inset-y-[10%] skew-x-6 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
    )}
    width={70}
    height={70}
    squares={[80, 80]}
    squaresClassName="hover:fill-brand-red"
  />
  <InteractiveGridPattern
    className={cn(
      "hidden md:flex lg:hidden inset-y-[10%] skew-x-6 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
    )}
    width={40}
    height={40}
    squares={[70, 70]}
    squaresClassName="hover:fill-brand-red"
  />
  <InteractiveGridPattern
    className={cn(
      "md:hidden [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
    )}
    width={30}
    height={30}
    squares={[60, 60]}
    squaresClassName="hover:fill-brand-red"
  />
</div>
 
   <div className="max-w-5xl mx-auto relative z-10 pointer-events-none">
   <h1 className="text-white mb-5">
        Laying the Groundwork for Effective Marketing Results
      </h1>
      <p className="text-white mb-1 lg:mb-2">
        Without a clear strategy, it&apos;s hard for your brand to stand out and
        connect with your audience. We believe each brand&apos;s unique challenges
        shape our humanistic approach towards branding. By carefully crafting
        your brand&apos;s identity, voice, and positioning, we ensure your marketing
        not only reaches people but resonates deeply, creating a trusted
        presence that drives results.
      </p>

      <div className="flex flex-wrap flex-row pt-4 gap-4 items-center justify-center pointer-events-auto">
        <Button>Get a quote</Button>
        <Button className="bg-black">Learn more</Button>
      </div>
   </div>
    </section>
  );
};

export default HeroHome;
