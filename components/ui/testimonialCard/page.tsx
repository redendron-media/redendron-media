import React from 'react'
import { Icon } from "@iconify/react/dist/iconify.js";

const TestimonailCard = () => {
  return (
    <div className="flex flex-col gap-6 border border-black w-full lg:w-[250px] py-10 px-6">
    <p>
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Suspendisse varius enim in eros elementum tristique. Duis
      cursus, mi quis viverra ornare."
    </p>
    <div className="flex flex-row gap-5 items-center">
      <div className="size-14 rounded-full bg-gray-400" />
      <div className="text-left"> 
        <p className="font-medium">Jim Mullen</p>
        <p>CEO, Company</p>
      </div>
    </div>
     <button className="flex gap-2 mt-6 items-center">
               <p>View Project</p>
               <Icon className="size-6" icon={'material-symbols:chevron-right'}/>
           </button>
  </div>
  )
}

export default TestimonailCard