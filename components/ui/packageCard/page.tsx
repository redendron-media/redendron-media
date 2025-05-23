import { urlFor } from "@/lib/sanity";
import { Packages } from "@/lib/types";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";

interface CardProps {
  items: Packages
  textColor?: "black" | "white";
}
const PackageCard: FC<CardProps> = ({ items, textColor = "white" }) => {
  if(!items) return null;
  return (
    <div
      className={`
        w-full text-start lg:w-[266px] xl:w-[350px] h-fit
        ${textColor === "black" ? "text-black" : "text-white"}
      `}
    >
      <Link href={`/packages/${items.slug}`}>
        <Image
          src={urlFor(items.coverImage).url()}
          className="lg:w-[422px] object-cover"
          width={330}
          height={356}
          alt={items.title}
        />

        <div className="flex flex-col gap-6 mt-6 lg:mt-8">
          <h4 className="uppercase">{items.title}</h4>
          <p className="pt-2">{items.description}</p>
        </div>
      </Link>
    </div>
  );
};

export default PackageCard;