"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React, { useState } from "react";
import { SocialIcon } from "react-social-icons";
import { usePathname } from "next/navigation";
import Link from "next/link";

type HeroProps = {
  data: {
    name: string;
    category: string;
    author: string;
    designation?: string;
    time: string;
    coverImage: string;
    _createdAt: string;
  };
};

const Hero = ({ data }: HeroProps) => {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const fullUrl = `https://www.redendron.media${pathname}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Revert icon after 2s
  };
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(data.name);

  const socialLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const formattedDate = new Date(data._createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <section className=" px-5 py-16 lg:px-16 lg:py-28 bg-white text-black flex flex-col gap-12 lg:gap-20">
      <div className="px-0 lg:px-28 xl:px-64 flex flex-col items-center gap-8 lg:gap-12">
        <div className="flex flex-col gap-6 w-full">
          <p>
            <Link href={'/blog'} className="hover:underline transition-all duration-700">
            <span>Blog </span>
            </Link>
          
            {">"} <span>{data.category}</span>
          </p>
          <h2 className="uppercase">{data.name}</h2>
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 w-full">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">{data.author}</p>
            <div className="flex flex-row gap-2">
              <p className="text-sm">{formattedDate}</p>
              <p>•</p>
              <p className="text-sm">{data.time} min read</p>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <button
              onClick={copyToClipboard}
              className="rounded-full bg-neutral-lightest p-[10px]"
              aria-label="Copy link"
            >
               <Icon
    icon={copied ? "hugeicons:tick-04" : "gravity-ui:link"}
    className="size-6 transition-all duration-200"
  />
            </button>
            {Object.entries(socialLinks).map(([platform, url]) => (
              <div
                key={platform}
                onClick={() => window.open(url, "_blank")}
                className="rounded-full bg-neutral-lightest p-[10px] cursor-pointer"
                aria-label={`Share on ${platform}`}
              >
                <SocialIcon
                  url={url} // still needed for icon appearance
                  fgColor={platform === "x" ? "black" : "#EEE"}
                  bgColor={platform === "x" ? "#EEE" : "black"}
                  style={{ width: "32px", height: "32px" }}
                  target="_blank"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative aspect-video w-full">
        <Image
          src={data.coverImage}
          fill
          alt={data.name}
          className="object-cover"
        />
      </div>
    </section>
  );
};

export default Hero;
