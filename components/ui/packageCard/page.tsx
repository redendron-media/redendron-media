import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React from "react";

const PackageCard = () => {
  return (
    <div className="text-white w-full text-start lg:w-[266px] h-fit ">
      <Image
        src={"/placeholder.png"}
        className="lg:w-[422px] object-cover"
        width={330}
        height={356}
        alt="Case"
      />
     
        <div className="flex flex-col gap-6 mt-6 lg:mt-8">
          <h4 className="uppercase">the Go to Market bundle</h4>
          <p className="pt-2">
            A comprehensive plan covering brand identity, messaging, market
            presence, and marketing execution, designed to launch your brand
            successfully and drive growth.
          </p>
        </div>

      </div>

  );
};

export default PackageCard;