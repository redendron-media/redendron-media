import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface heroProps {
  title: string;
  name: string;
  coverImage: string;
  description: string;
  descpoints: string[];
}
const PackageHero = ({
  title,
  name,
  coverImage,
  description,
  descpoints,
}: heroProps) => {
  return (
    <section className="px-5 lg:px-16 flex pb-28 flex-col lg:flex-row gap-12 lg:gap-20">
      <div className="flex flex-col gap-5 lg:gap-8">
        <div className="flex flex-col gap-3 lg:gap-4 ">
          <p className="text-base">{title}</p>
          <h2 className="uppercase">{name} </h2>
          <p>{description}</p>
        </div>
        <div className="py-2 flex flex-col gap-4">
          {descpoints?.map((point, index) => (
            <div key={index} className="flex gap-4">
              <Icon
                icon="mage:box-3d-fill"
                className="text-primary text-base"
              />
              <p>{point}</p>
            </div>
          ))}
        </div>
        <Link href={"/getAQuote"} className="flex flex-col md:flex-row pt-4 gap-4 md:gap-6">
          <Button className="hover:bg-brand-red/10 transition-all duration-700" variant={"outline"}>Get a quote</Button>
        </Link>
      </div>
      <div className="w-full aspect-square lg:size-[440px] relative">
        <Image
           src={urlFor(coverImage).url()}
          fill
          alt={title}
          className="object-cover"
        />
      </div>
    </section>
  );
};

export default PackageHero;
