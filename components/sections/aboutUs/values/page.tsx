import { Icon } from '@iconify/react';
import React from 'react'

interface ValuesProps {
    values: {
      icon: string;
      title: string;
      desc: string;
    }[];
  }
  
const Values = ({values}:ValuesProps) => {
  return (
    <section className='px-5 lg:px-16 py-12 lg:py-28 flex flex-col gap-12 lg:gap-20'>
        <div className='flex flex-col gap-3 lg:gap-4 lg:w-2/3'>
            <h2 className="uppercase">
            Our Core Values
            </h2>
            <p>
            We&apos;re not just building brands — we&apos;re designing systems for long-term relevance, resonance, and results. Here&apos;s what guides us:
            </p>
        </div>

        <div className='grid grid-cols 1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-x-12 lg:gap-y-20'>
            {values?.map((value,index) => (
                <div key={index} className='flex flex-col gap-3 lg:gap-6'>
                <Icon width={48} height={48} className='text-xl' icon={value.icon}/>
                <h4 className="uppercase">
               {value.title}
                </h4>
                <p>
                {value.desc}
                </p>
            </div>
            ))}
            
            
        </div>
    </section>
  )
}

export default Values