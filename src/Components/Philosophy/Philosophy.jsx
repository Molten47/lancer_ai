import React, { useState, useEffect } from 'react';
import Image1 from '../../assets/Images/Frame 10.png';
import Image2 from '../../assets/Images/Frame 11.png';
import Image3 from '../../assets/Images/Frame 12.png';
import Image4 from '../../assets/Images/Frame 14.png';
import Image7 from '../../assets/Images/Ellipse 1.png';
import DottedImage from '../../assets/Images/Group 2.png';
import AiImage from '../../assets/Images/Brainwire.png';

const Philosophy = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to update state based on window width
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial value
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className='w-full bg-white px-4 lg:px-5 py-12 lg:py-0 lg:h-[85vh] lg:pt-20 lg:pb-26'>
      {/* Main container - changes to column on mobile */}
      <div className='flex flex-col lg:flex-row w-full'>
        {/* AI Image container */}
        <div className='relative w-full lg:w-[40%] flex justify-center items-center mb-8 lg:mb-0'>
          <img src={DottedImage} alt="" className='absolute w-[40%] h-[30vh] z-0 -top-12 left-1/4 lg:left-20 hidden lg:block' />
          <img src={AiImage} alt="" className='relative z-5 w-[70%] h-auto' />
        </div>

        {/* Content container */}
        <div className='flex flex-col w-full lg:w-[60%]'>
          {/* Text section */}
          <div className='flex flex-col gap-4 lg:gap-6 mb-8 lg:mb-4'>
            <h2 className='text-primary basic-font font-semibold text-3xl lg:text-[42px] uppercase mb-4 lg:mb-6'>Who we are</h2>
            <p className='text-primary basic-font font-normal text-base lg:text-[20px] w-full lg:w-[75%]'>
              Lancer is a next-generation freelancing platform powered by AI built to revolutionize how businesses connect with
              top-tier freelance talent.
              <br /> <br />
              Whether you're a startup founder, agency, or enterprise team, Lancer eliminates the friction in hiring by using
              intelligent automation to match you with the right professionals — in seconds.
            </p>
          </div>

          {/* Profile images and chat bubbles section */}
          <div className='min-h-[35vh] flex flex-col justify-center items-center lg:items-start mt-6'>
            {/* Top profiles row */}
            <div className='flex flex-col lg:flex-row justify-between items-center mb-6 lg:mb-10 gap-6 w-full lg:w-[75%]'>
              {/* First profile */}
              <div className='relative order-1'>
                <img src={Image1} alt="" className="relative z-10 w-16 h-16 lg:w-auto lg:h-auto rounded-full" />
                <img
                  src={Image7}
                  alt="Online"
                  className="absolute top-1 right-2 w-3 lg:w-5 h-3 lg:h-5 rounded-full border-2 border-white z-20"
                />
              </div>

              {/* Center text */}
              <div className='flex justify-center order-3 lg:order-2 mt-4 lg:mt-0'>
                <p className='w-full lg:w-[36rem] text-base lg:text-[20px] font-medium basic-font text-center'>
                  Enjoy skill matching, timezone synchronization, AI screening, and automated fair pricing 
                  <br />
                  <span className='text-cta'>— all in one smart freelancing platform.</span>
                </p>
              </div>

              {/* Empty div for desktop layout */}
              <div className='hidden lg:block lg:order-3'></div>

              {/* Second profile */}
              <div className='relative order-2 lg:order-4'>
                <img src={Image2} alt="" className="relative z-10 w-16 h-16 lg:w-auto lg:h-auto rounded-full" />
                <img
                  src={Image7}
                  alt="Online"
                  className="absolute top-1 right-2 w-3 lg:w-5 h-3 lg:h-5 rounded-full border-2 border-white z-20"
                />
              </div>
            </div>

            {/* Bottom profiles row with chat bubbles */}
            <div className='flex flex-row justify-between items-center w-full lg:w-[60%] px-2 lg:pl-12 lg:p-8 mt-4 lg:mt-0'>
              {/* Third profile with bubble */}
              <div className='relative'>
                <img src={Image3} alt="Person" className="relative z-10 w-16 h-16 lg:w-24 lg:h-24 rounded-full" />
                <div
                  className='absolute bottom-10 left-10 lg:left-14 px-4 lg:px-9 py-1 lg:py-2 basic-font rounded-tr-lg bg-[#DBEAFE] z-0'
                  style={{ minWidth: '120px', maxWidth: '120px', fontSize: isMobile ? '12px' : '14px' }}
                >
                  <span className="text-nowrap">I want to hire a designer</span>
                </div>
              </div>

              {/* Fourth profile with bubble */}
              <div className='relative ml-auto'>
                <img src={Image4} alt="Person" className="relative z-10 w-16 h-16 lg:w-24 lg:h-24 rounded-full" />
                <div
                  className='absolute bottom-10 basic-font left-10 lg:left-14 px-4 lg:px-9 py-1 lg:py-2 text-nowrap rounded-tr-lg bg-[#DBEAFE] z-0'
                  style={{ minWidth: '90px', maxWidth: '120px', fontSize: isMobile ? '12px' : '14px' }}
                >
                  <span className="text-nowrap">I need a writer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Philosophy;