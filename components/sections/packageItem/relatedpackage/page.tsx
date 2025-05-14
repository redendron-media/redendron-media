"use client";

import { Button } from "@/components/ui/button";
import PackageCard from "@/components/ui/packageCard/page";
import { Packages as PackagesType } from "@/lib/types";
import Link from "next/link";
import { Icon } from "@iconify/react";
import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RelatedPackages({ data }: { data: PackagesType[] }) {
    console.log("Related Packages", data);
  return (
    <section className="px-5 py-16 lg:px-16 lg:py-28 bg-white text-black flex flex-col gap-12 lg:gap-20">
      <div className="flex flex-col gap-3 lg:gap-4">
        <h6>Recommended For You</h6>

        <h2 className="uppercase">Other Packages</h2>
      </div>

      <div className="flex flex-col md:flex-row lg:flex-row gap-12 lg:gap-12 xl:gap-16 2xl:gap-20 lg:justify-start xl:px-6">
        {data.map((item) => (
          <div key={item.title}>
            <PackageCard items={item} textColor="black"/>
          </div>
        ))}
      </div>

      <div className="flex gap-3 lg:gap-4">
        <Link href={"/packages"}>
          <Button className="rounded">View All Packages</Button>
        </Link>
        <Link
          href={"/caseStudies"}
          className="flex gap-1 py-2 items-center group"
        >
          <p className="group-hover:text-brand-red transition-all duration-700">
            Read case studies
          </p>
          <Icon
            className="size-6 group-hover:text-brand-red transition-all duration-700"
            icon={"material-symbols:chevron-right"}
          />
        </Link>
      </div>
    </section>
  );
}
