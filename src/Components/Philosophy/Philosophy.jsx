import React from 'react'

import DottedImage from '../../assets/Images/Group 2.png'
import AiImage from '../../assets/Images/Brainwire.png'
import { useEffect, useState } from 'react'

const Philosophy = () => {
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive state based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={`w-full ${isMobile ? 'h-auto min-h-screen py-10' : 'h-[80vh]'} flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'pt-10' : 'pt-20'} px-5`}>
      <div className={`${isMobile ? 'w-full' : 'w-[40%]'} flex justify-center items-center ${isMobile ? 'mb-8' : ''} relative`}>
        {!isMobile && <img src={DottedImage} alt="" className='absolute w-[40%] h-[30vh] z-0 -top-12 left-20' />}
        <img src={AiImage} alt="" className={`relative z-5 ${isMobile ? 'w-[80%]' : 'w-[70%]'} h-auto`} />
      </div>
      
      <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-[60%]'}`}>
        <div className='flex flex-col gap-6 mb-4'>
          <h2 className={`text-primary basic-font font-semibold ${isMobile ? 'text-3xl' : 'text-[42px]'} uppercase mb-6`}>Who we are</h2>
          <p className={`text-primary basic-font font-normal ${isMobile ? 'text-lg w-full' : 'text-[20px] w-[75%]'}`}>
            Lancer is a next-generation freelancing platform powered by AI built to revolutionize how businesses connect with
            top-tier freelance talent.
            <br /> <br />
            Whether you're a startup founder, agency, or enterprise team, Lancer eliminates the friction in hiring by using
            intelligent automation to match you with the right professionals — in seconds.
          </p>
        </div>

      
      </div>
    </div>
  )
}

export default Philosophy