import Hero from "@/components/sections/packages/hero/page";
import HowItWorks from "@/components/sections/packages/how-it-works/page";
import Packages from "@/components/sections/home/packages/page";
import React from "react";
import Blogs from "@/components/sections/home/blog/page";
import Faqs from "@/components/sections/packages/faqs/page";
import Testimonials from "@/components/sections/packages/testimonials/page";
import Contact from "@/components/sections/home/contact/page";
import WhyBranding from "@/components/sections/packages/whybranding/page";

const PackagePage = () => {
  return (
    <main className="bg-white">
      <Hero />
      <WhyBranding />
      <Packages />
      <HowItWorks />
      <Blogs />
      <Faqs />
      <Testimonials />
      <Contact />
    </main>
  );
};

export default PackagePage;
