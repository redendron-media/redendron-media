import { branding } from '@/constants/branding'
import Image from 'next/image'
import React from 'react'

const HowItWorks = () => {
  return (
    <section className='bg-brand-grey py-16 lg:py-28 flex flex-col lg:flex-row  px-5 lg:px-16 gap-8 lg:gap-0'>
        <div className='w-full lg:w-1/2'>
        <h2>
        How Integrated Branding Works
        </h2>
        </div>
        <div className='w-full lg:w-1/2 flex flex-col'>
        {branding.map((item,index) =>(
            <div className='flex flex-row gap-10' key={index}>
            <div className='flex flex-col gap-4 items-center'>
                <div className=' size-12 relative'>
                <Image src={'/box.svg'} fill  alt='Integrated Branding'/>
                </div>
            <div className='w-[2px] bg-black h-full' />
            </div>
            <div className='flex flex-col gap-3 md:gap-4'>
                <h6>{item.title}</h6>
                <p>
                    {item.desc}
                </p>
            </div>
        </div>
        ))}
           
        </div>
    </section>
  )
}

export default HowItWorks