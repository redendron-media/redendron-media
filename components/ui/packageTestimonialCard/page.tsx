import React, { FC } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js";
import { Testimonials } from '@/lib/types';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
interface CardProps {
  items: Testimonials
}
const PackageTestimonailCard: FC<CardProps> = ({items}) => {
  if(!items) return null;
  const starCount = parseInt(items.stars);
  return (
    <div className="flex flex-col-reverse gap-12 lg:flex-row lg:gap-20 w-full">
      <div className='w-full aspect-square lg:size-[650px] relative'>
      <Image 
        src={urlFor(items.coverImage).url()}
       fill
        alt={items.name}
        className='object-cover'
      />
        </div>    
      <div className="flex flex-col w-full lg:size-[650px] gap-6 lg:gap-8 justify-center"> 
        <div className='flex gap-1'>
        {Array.from({ length: starCount }).map((_, index) => (
        <Icon key={index} icon="material-symbols:star" className="text-black text-xl" />
      ))} 
        </div>
     
        <h5>{items.testimonial}</h5>
        <div>
        <p className="font-medium">{items.name}</p>
        <p>{items.position}, {items.company}</p>
        </div>
       
      </div>
  </div>
  )
}


export default PackageTestimonailCard;