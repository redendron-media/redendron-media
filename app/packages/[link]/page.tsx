import Credibility from '@/components/sections/packageItem/credibility/page'
import PackageHero from '@/components/sections/packageItem/hero/page'
import React from 'react'

const PackagePage = () => {
  return (
    <main className='py-16 lg:py-28'>
      <PackageHero />
      <Credibility/>
      
    </main>
  )
}

export default PackagePage