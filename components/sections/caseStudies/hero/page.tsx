import Image from 'next/image'
import React from 'react'

interface Props {
 
        projectname:string;
        mission:string;
        impact:string;
        outcome:string;
        services:string[];
        coverImage:string;
}
const Hero = ({projectname,mission,impact,outcome,services,coverImage}:Props) => {
  return (
    <section className='lg:px-30 lg:pb-20 pb-20 flex flex-col gap-12 lg:gap-10'>
        <div className='flex flex-col lg:flex-row gap-12 lg:gap-20 px-5 lg:px-20'>
            <h3 className='w-full lg:w-1/2'>
            Stitching Sustainability: Crafted Fibers&apos; Blueprint for Ethical Luxury
            </h3>
            <div className='flex flex-col gap-12 lg:gap-10 w-full lg:w-1/2'>
                <div className='flex flex-col gap-12 lg:gap-16'>
                    <div className='flex flex-col gap-4'>
                       <h6 className='uppercase'>the mission</h6> 
                       <p>
                       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
                       </p>
                    </div>
                    <div className='flex flex-col gap-4'>
                       <h6 className='uppercase'>the impact</h6> 
                       <p>
                       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
                       </p>
                    </div>
                </div>

                <div className='flex flex-col gap-12 lg:gap-16'>
                    <div className='flex flex-col gap-4'>
                       <h6 className='uppercase'>the outcome</h6> 
                       <p>
                       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
                       </p>
                    </div>
                    <div className='flex flex-col gap-4'>
                       <h6 className='uppercase'>services</h6> 
                       <ul className='list-decimal list-outside pl-5'>
                        <li>Brand Master Guide: A comprehensive 60-page document outlining the brand&apos;s mission, vision, values, messaging framework, and unique narrative.</li>
                        <li>Social Media Marketing: A one-month social media strategy to increase brand awareness and engagement.</li>
                        <li>Promo Video Concept: A creative concept for a promotional video to showcase Crafted Fibers&apos; story, values, and products.</li>
                       </ul>
                    </div>
                </div>
            </div>
        </div>
        <div className='relative  w-full h-[738px]'>
        <Image 
            src={'/casehero.png'}
            fill
            alt='hero image'
            className='object-cover lg:object-contain'
        />
        </div>
       
    </section>
  )
}

export default Hero