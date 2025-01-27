import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React from "react";;

const CaseCard = () => {
  return (
    <div className="text-white w-full text-start lg:w-[422px] h-fit ">
      <Image
        src={"/file.svg"}
        className="lg:w-[422px] object-cover"
        width={330}
        height={356}
        alt="Case"
      />
      <div className="p-6 bg-black">
        <p className="text-xs text-start">Industry</p>
        <h5 className="">PROJECT NAME HERE</h5>
        <p className="pt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          varius enim in eros.
        </p>
        <div className="flex gap-2 pt-4">
          <div className="px-2 py-1 bg-neutral-lightest text-black">
            Tag one
          </div>

          <div className="px-2 py-1 bg-neutral-lightest text-black">
            Tag one
          </div>
          <div className="px-2 py-1 bg-neutral-lightest text-black">
            Tag one
          </div>
        </div>
        <button className="flex gap-2 mt-6 items-center">
            <p>View Project</p>
            <Icon className="size-6" icon={'material-symbols:chevron-right'}/>
        </button>
      </div>
    
    </div>
  );
};

export default CaseCard;
