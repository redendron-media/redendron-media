import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react/dist/iconify.js'
import Image from 'next/image'
import React from 'react'

const PackageHero = () => {
  return (
    <section className='px-5 lg:px-16 flex pb-28 flex-row gap-20'>
        <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-4 '>
            <p className='text-base'>GO TO MARKET BUNDLE</p>
            <h2 className='uppercase'>launch your brand Strategically </h2>
            <p>The Go to Market Bundle is designed for businesses looking for an end-to-end solution to build, establish, and market their brand. This package takes you from the foundational aspects of your brand's identity to full-scale marketing campaigns that establish your presence in the market.</p>
            </div>
            <div className='py-2 flex flex-col gap-4'>
                <div className='flex gap-4'>
                <Icon icon='mage:box-3d-fill' className='text-primary text-base'/>
                <p>Defining your brand&apos;s core values, voice, and positioning.</p>
                </div>
                <div className='flex gap-4'>
                <Icon icon='mage:box-3d-fill' className='text-primary text-base'/>
                <p>Creating a visual identity that resonates with your audience.</p>
                </div>
                <div className='flex gap-4'>
                <Icon icon='mage:box-3d-fill' className='text-primary text-base'/>
                <p>Building a strong presence across all platforms and channels, combined with tailored marketing strategies.</p>
                </div>
           
            </div>
            <div className='flex flex-row gap-6'>
              <Button variant={"outline"}>Get a quote</Button>
              <button className='text-brand-red'>Talk to an expert <span>{">"}</span></button>
            </div>
        </div>
        <div className='w-full aspect-square lg:size-[540px] relative'>
             <Image 
               src={'/placeholder.png'}
              fill
               alt={'Placeholder'}
               className='object-cover'
             />
               </div>    
    </section>
  )
}

export default PackageHero