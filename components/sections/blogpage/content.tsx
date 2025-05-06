'use client';

import CustomComponents from "@/lib/portableTextComponent";
import { PortableText } from "next-sanity";
import React from "react";
import { SocialIcon } from "react-social-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Chip } from "@/components/ui/chip";
import { usePathname } from "next/navigation";
import { useState } from "react";

type ContentProps = {
  content: any[];
  author: string;
  designation?: string;
  company?: string;
  category: string;
};



const Content = ({ content, author, designation, company, category }: ContentProps) => {
  const pathname = usePathname();
const [copied, setCopied] = useState(false);
const fullUrl = `https://www.redendron.media${pathname}`;


const copyToClipboard = () => {
  navigator.clipboard.writeText(fullUrl);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};


const encodedUrl = encodeURIComponent(fullUrl);
const encodedTitle = encodeURIComponent("Check out this post!"); // optional, can use real blog name

const socialLinks = {
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
};

  return (
    <section className="px-5 lg:px-52 xl:px-80 lg:pb-28 pb-16">
      <PortableText value={content} components={CustomComponents} />

      <div className="flex flex-col mt-8 lg:mt-16 gap-8 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-col gap-4">
          <p className="font-semibold">Share this post</p>
          <div className="flex flex-row gap-2">
          <button
    onClick={copyToClipboard}
    className="rounded-full bg-neutral-lightest p-[10px]"
    aria-label="Copy blog link"
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
        url={url}
        fgColor={platform === "x" ? "black" : "#EEE"}
        bgColor={platform === "x" ? "#EEE" : "black"}
        style={{ width: "32px", height: "32px" }}
      />
    </div>
  ))}
          </div>
        </div>
        <div className="flex flex-row h-fit gap-2">
          <Chip className="shadow-none bg-brand-grey">{category}</Chip>
        </div>
      </div>

      <div className="pt-8 flex flex-col gap-8 lg:gap-12 lg:pt-12">
        <hr className="bg-black h-0.5" />
        <div className="flex flex-col">
          <p className="font-semibold">{author}</p>
          <p>  {[designation, company].filter(Boolean).join(", ")}</p>
        </div>
      </div>
    </section>
  );
};

export default Content;
