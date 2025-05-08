import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
import Philosophy from '../Philosophy/Philosophy'

const landhome = () => {

  return (
    <div className=' relative min-h-[80vh] z-0 w-full bg-light' >
      <div className='min-h-full'>
      <Navbar/>
      <Hero/>
      <Philosophy/>
      </div>
  
      
    </div>
  )
}

export default landhome
