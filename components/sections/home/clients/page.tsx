import LogoSlider from "@/components/ui/logocarousel/page";
import React from "react";

const Clients = () => {
  return (
    <section className="w-full py-16 lg:py-[58px]   flex flex-col gap-8 items-center">
      <h6 className="text-center">Clients we&apos;ve worked with</h6>
      <LogoSlider />
    </section>
  );
};

export default Clients;
