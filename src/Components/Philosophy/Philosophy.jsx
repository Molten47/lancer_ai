import React from 'react'
import Image1 from '../../assets/Images/Bello.jpg'
import Image2 from '../../assets/Images/sodeeq.jpeg'
import Image3 from '../../assets/Images/Uche.jpeg'
import Image4 from '../../assets/Images/Damilare.jpg'
import Image7 from '../../assets/Images/Ellipse 1.png'
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

        <div className={`${isMobile ? 'min-h-0' : 'min-h-[35vh]'} flex flex-col justify-center items-center mt-6`}>
          {/* Top row with two profile images and centered text */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-center items-center mb-10 gap-6 ${isMobile ? 'w-full' : 'w-[90%]'}`}>
            <div className='relative flex justify-center'>
              <img src={Image1} alt="" className="relative z-10 w-20 h-20 rounded-full object-cover border-2 border-white" />
              <img
                src={Image7}
                alt="Online"
                className="absolute top-0 right-0 w-6 h-6 rounded-full border-2 border-white z-20"
              />
            </div>
            
            <div className='flex justify-center flex-1'>
              <p className={`${isMobile ? 'w-full text-lg' : 'max-w-[36rem] text-[20px]'} font-medium basic-font text-center`}>
                Enjoy skill matching, timezone synchronization, AI screening, and automated fair pricing <br /><span className='text-cta'>— all in one smart freelancing platform.</span>
              </p>
            </div>
            
            <div className='relative flex justify-center'>
              <img src={Image2} alt="" className="relative z-10 w-20 h-20 rounded-full object-cover border-2 border-white" />
              <img
                src={Image7}
                alt="Online"
                className="absolute top-0 right-0 w-6 h-6 rounded-full border-2 border-white z-20"
              />
            </div>
          </div>
          
          {/* Bottom row with three profile images and speech bubbles - visible only on larger screens */}
          {!isMobile && (
            <div className='flex flex-row justify-center items-end gap-10 w-[80%]'>
              <div className='relative flex flex-col items-center'>
                <div
                  className='px-4 py-3 basic-font rounded-xl bg-[#DBEAFE] mb-4 relative shadow-sm'
                  style={{ minWidth: '160px' }}
                >
                  <span className="text-sm text-center block text-gray-700">I want to hire a designer</span>
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#DBEAFE]"></div>
                </div>
                <img src={Image3} alt="Person" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
              </div>

              <div className='relative flex flex-col items-center'>
                <div
                  className='px-4 py-3 basic-font rounded-xl bg-[#DBEAFE] mb-4 relative shadow-sm'
                  style={{ minWidth: '130px' }}
                >
                  <span className="text-sm text-center block text-gray-700">I need a Product Designer</span>
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#DBEAFE]"></div>
                </div>
                <img src={Image4} alt="Person" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Philosophy