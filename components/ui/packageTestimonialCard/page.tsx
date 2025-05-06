import React, { FC } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Testimonials } from "@/lib/types";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
interface CardProps {
  items: Testimonials;
}
const PackageTestimonailCard: FC<CardProps> = ({ items }) => {
  if (!items) return null;
  return (
    <div className="flex flex-col-reverse gap-12 lg:flex-row justify-center lg:gap-20 w-full">
      <div className="flex flex-col w-full lg:w-[850px] gap-6 lg:gap-8 justify-center">
        <h5>{items.testimonial}</h5>
        <div>
          <p className="font-medium">{items.name}</p>
          {items.position ||
            (items.company && (
              <p>
                {items?.position} {items?.company}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PackageTestimonailCard;
