import Image from "next/image";
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "../button";
import Link from "next/link";


type BlogCardProps = {
  name: string;
  slug: string;
  coverImage: string;
  caption: string;
  category: string;
  time: string;
};


const BlogCard = ({
  name,
  slug,
  coverImage,
  caption,
  category,
  time,
}: BlogCardProps) => {
  return (
    <div className="text-white w-full text-start lg:w-[390px] h-fit ">
      <Image
        src={coverImage}
        className="w-full lg:w-[390px] object-cover"
        width={330}
        height={356}
        alt="Case"
      />
      <div className="p-6 bg-black">
        <div className="flex gap-4 pt-4 items-center mb-4">
          <div className="px-2 py-1 bg-neutral-lightest text-black">
            {category}
          </div>
          <p>{time} min read</p>
        </div>

        <h5 className="">{name}</h5>
        <p className="pt-2">
          {caption}
        </p>
        <Link href={`/blog/${slug}`}>
        <Button className="flex gap-2 mt-6 items-center bg-black border-white text-white">
          <p>Read more</p>
          <Icon className="size-6" icon={"material-symbols:chevron-right"} />
        </Button>
        </Link>
        
      </div>
    </div>
  );
};

export default BlogCard;
