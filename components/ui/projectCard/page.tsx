import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React from "react";;
import { CaseStudyTypes } from "@/lib/types";
import Link from "next/link";

type CaseCardProps = {
  data: CaseStudyTypes;
};

const CaseCard = ({ data }: CaseCardProps) => {
  return (
    <div className="text-white w-full text-start lg:w-[422px] h-fit ">
      <Image
          src={data.coverImage}
        className="lg:w-[422px] w-full object-cover"
        width={330}
        height={356}
        alt={data.projectName}
      />
      <div className="p-6 bg-black">
        <p className="text-xs text-start">{data.industry}</p>
        <h5 className="">{data.projectName}</h5>
        <p className="pt-2">
        {data.introduction}
        </p>
        <div className="flex flex-wrap gap-2 pt-4">
          {data.tags?.map((tag, index) => (
            <div key={index} className="px-2 py-1 bg-neutral-lightest text-black text-xs rounded">
              {tag}
            </div>
          ))}
        </div>
        <Link href={`/caseStudies/${data.slug}`}>
        <button className="flex gap-2 mt-6 items-center">
            <p>View Project</p>
            <Icon className="size-6" icon={'material-symbols:chevron-right'}/>
        </button>
        </Link>
       
      </div>
    
    </div>
  );
};

export default CaseCard;
