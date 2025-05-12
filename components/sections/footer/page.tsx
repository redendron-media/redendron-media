import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { SocialIcon } from 'react-social-icons'
const Footer = () => {
  return (
   <footer className='flex flex-col gap-12 px-5 py-12 lg:px-16 lg:py-20 lg:gap-20 bg-white'>
    <div className='flex flex-col md:flex-row gap-12 items-center justify-between'>
    <Link href={"/"}>
          <Image
            src={"/logo/logolight.svg"}
            width={135}
            height={33}
            alt="logo"
        
          />
        </Link>

     

        <div>
    <SocialIcon style={{borderRadius:4, backgroundColor:'black', width:24 , height:24}} bgColor='black'  url='https://in.linkedin.com/company/redendron'/>
    <SocialIcon bgColor='white' fgColor='black' url='https://www.instagram.com/redendron/'/>
        </div>
    </div>
    <div className='pb-4 pt-6 flex flex-col md:flex-row-reverse gap-6 lg:pb-0 lg:pt-8 items-center justify-center border-t border-black'>
    <Link className='underline' href={"/"}>Privacy Policy</Link>
        <Link className='underline' href={"/"}>Terms of Service</Link>
        <p>© 2025 Redendron Media. All rights reserved.</p>
    </div>
   </footer>
  )
}

export default Footer