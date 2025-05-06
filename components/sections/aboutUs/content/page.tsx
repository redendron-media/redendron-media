import Image from 'next/image'
import React from 'react'

const Content = () => {
  return (
   <main className='px-5 lg:px-16'>
    <section className='py-16 lg:py-28 flex flex-col gap-12 lg:gap-20'>
        <div className='flex flex-col lg:flex-row gap-14'>
          <h2 className="uppercase text-balance">
          Born in Gangtok, Sikkim, our roots keep us grounded.
          </h2>
          <p>
          We believe marketing isn&apos;t about shouting louder; it&apos;s about speaking truer. For the dreamers, the artisans, the brands who refuse to compromise their values for vanity metrics, we craft narratives that don&apos;t just sell—they resonate.
          </p>
        </div>
        <div className='relative w-full aspect-video lg:aspect-auto lg:h-[738px]'>
            <Image 
            src={'/placeholder.png'}
            alt='Redendron'
            fill
            className='object-cover'
            />
        </div>
    </section>
    <section className='py-16 lg:py-28 flex flex-col gap-12 lg:gap-20'>
        <div className='flex flex-col lg:flex-row gap-5 lg:gap-14 '>
          <h2 className="uppercase ">
          Your brand is a legacy
          </h2>
          <p className='lg:w-1/2'>
          It&apos;s the late nights, the calloused hands, the “why” that keeps you awake yet alive. That&apos;s why we weave strategies steeped in honesty, not hype. From Himalayan villages to global stages, we help you turn sincerity into your sharpest edge - because profit without purpose is hollow, but purpose without profit is unsustainable.
    <br/><br/>Let&apos;s build something that outlasts algorithms.<br/><br/>
Let&apos;s make your truth&apos;unignorable.
          
          </p>
        </div>
        <div className='relative w-full aspect-video lg:aspect-auto lg:h-[738px]'>
            <Image 
            src={'/placeholder.png'}
            alt='Redendron'
            fill
            className='object-cover'
            />
        </div>
    </section>
   </main>
  )
}

export default Content