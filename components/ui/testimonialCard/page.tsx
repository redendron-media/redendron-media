import React, { FC } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js";
import { Testimonials } from '@/lib/types';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';

interface CardProps {
  items: Testimonials
}
const TestimonailCard: FC<CardProps> = ({items}) => {
  if(!items) return null;
  return (
    <div className="flex flex-col gap-6 border border-black w-full lg:w-[250px] py-10 px-6">
    <p>
      {items.testimonial}
    </p>
    <div className="flex flex-row gap-5 items-center">
    
     
      <div className="text-left"> 
        <p className="font-medium">{items.name}</p>
        {
          items.company || items.position && (
            <p>{items?.position}, {items?.company}</p>
          )
        }
       
      </div>
    </div>
     <button className="flex gap-2 mt-6 items-center">
               <p>Read Case Study</p>
               <Icon className="size-6" icon={'material-symbols:chevron-right'}/>
           </button>
  </div>
  )
}

export default TestimonailCard