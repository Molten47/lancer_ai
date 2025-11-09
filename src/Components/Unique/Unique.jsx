import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Building, PaletteIcon, ArrowUpRight } from 'lucide-react';
import Frame1 from '../../assets/Images/6@3x 1.png';
import Frame2 from '../../assets/Images/5@3x 1.png';
import Frame3 from '../../assets/Images/4@3x 1.png';

const Unique = () => {


  return (
    <main className="bg-white h-auto lg:h-auto third-font items-center justify-center flex flex-col pt-9 px-4">
      {/* Top section */}
      <div className='flex flex-col items-center justify-center gap-4 md:gap-2 '>
        <span className='bg-[#F3F4F6] p-2.5 text-[#080026] rounded-[5px] border border-[#E5E7EB] text-sm md:text-base font-normal'>
          How it works!
        </span>
        <p className='max-w-3xl text-center text-[#080026] font-medium text-2xl md:text-2xl leading-relaxed px-4'>
        Let's get Started
        </p>
      </div>
{/*Project Setup ......*/}
<section className='relative flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-8 py-12 lg:py-10 pb-32 md:pb-40 lg:pb-48 w-full px-4 md:px-8 lg:px-16 overflow-hidden'>
  {/*Left side - Text and buttons */}
  <div className='flex flex-col gap-6 lg:gap-8 text-center lg:text-left z-10 lg:max-w-xl'>
    {/*The header texts */}
    <div className='flex flex-col gap-4 md:gap-6'>
      <h2 className='font-semibold text-3xl md:text-4xl lg:text-[40px] text-[#162357]'>Setup your project</h2>
      <p className='font-normal text-base md:text-lg lg:text-xl text-[#162357]'>Create a Project workspace with an assistant that ideate, researches and plans with the client</p>
    </div> 
    
    {/*Call to action buttons */}
    <div className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start'>
      <button className='bg-[#2255D2] text-white py-3 px-8 transition font-medium text-base md:text-lg delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 rounded-full shadow-lg hover:shadow-xl'>Get Started</button>
      <button className='border-3 border-[#2255D2] text-[#2255D2] font-medium text-base md:text-lg py-3 px-8 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 rounded-full'>Learn More</button>
    </div>
  </div>

  {/*Right side - Demo image */}
  <div className='flex items-center justify-center w-full lg:w-1/2 z-10 mb-8 lg:mb-0'>
    <img 
      loading='lazy'
      src={Frame1} 
      alt="Project workspace dashboard" 
      className='w-full max-w-3xl h-auto object-contain drop-shadow-2xl' 
    />
  </div>

  {/*Diagonal dark triangle at bottom-right */}
  <div className='absolute bottom-0 right-0 w-2/5 h-64 md:h-80 lg:h-70 pointer-events-none'>
    <svg className='absolute bottom-0 right-0 w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
      <polygon points='40,100 100,100 100,0' fill='#151B25' />
    </svg>
  </div>
</section>
        {/*Onboarding ...... */}

<section className='relative flex flex-col lg:flex-row-reverse justify-between items-center gap-8 lg:gap-12 py-12 lg:py-20 pb-32 md:pb-40 lg:pb-48 w-full px-4 md:px-8 lg:px-16 overflow-hidden bg-[#f5f7fa]'>
  {/*Right side - Text and buttons */}
  <div className='flex flex-col gap-6 lg:gap-8 text-center lg:text-right z-10 lg:max-w-xl'>
    {/*The header texts */}
    <div className='flex flex-col gap-4 md:gap-6'>
      <h2 className='font-semibold text-3xl md:text-4xl lg:text-[40px] text-[#162357]'>Build a new team or Onboard an existing one</h2>
      <p className='font-normal text-base md:text-lg lg:text-xl text-[#162357]'>For every Project, a dedicated Project manager agent can onboard an existing team or set up an interview process to hire from our in-house talent pool</p>
    </div> 
    
    {/*Call to action buttons */}
    <motion.div 
      className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-end'
      initial={{ y: -100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <button className='bg-[#2255D2] text-white py-3 px-8 transition font-medium text-base md:text-lg delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 rounded-full shadow-lg hover:shadow-xl'>Get Started</button>
      <button className='border-3 border-[#2255D2] text-[#2255D2] font-medium text-base md:text-lg py-3 px-8 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 rounded-full'>Learn More</button>
    </motion.div>
  </div>

  {/*Left side - Demo image */}
  <motion.div 
    className='flex items-center justify-center w-full lg:w-1/2 z-10 mb-8 lg:mb-0'
    initial={{ y: -100, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    viewport={{ once: true, amount: 0.3 }}
  >
    <img 
      loading='lazy'
      src={Frame2} 
      alt="Team onboarding dashboard" 
      className='w-full max-w-3xl h-auto object-contain drop-shadow-2xl' 
    />
  </motion.div>

  {/*Diagonal dark triangle at bottom-left corner */}
  <div className='absolute bottom-0 left-0 w-2/5 h-64 md:h-80 lg:h-70 pointer-events-none'>
    <svg className='absolute bottom-0 left-0 w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
      <polygon points='0,0 0,100 60,100' fill='#151B25' />
    </svg>
  </div>
</section>    
  
     {/*Manage Project...... */}
<section className='relative flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-6 py-12 lg:py-20 pb-32 md:pb-40 lg:pb-48 w-full px-4 md:px-8 lg:px-16 overflow-hidden'>
  {/*Left side - Text and buttons */}
  <div className='flex flex-col gap-6 lg:gap-8 text-center lg:text-left z-10 lg:max-w-xl'>
    {/*The header texts */}
    <div className='flex flex-col gap-4 md:gap-6'>
      <h2 className='font-semibold text-3xl md:text-4xl lg:text-[40px] text-[#162357]'>Manage Project</h2>
      <p className='font-normal text-base text-justify md:text-lg lg:text-xl text-[#162357]'>Facilitates seamless coordination between employers, teams, and employees while tracking project progress and performance metrics, and enhancing productivity through AI job assistant agents.</p>
    </div> 
    
    {/*Call to action buttons */}
    <div className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start'>
      <button className='bg-[#2255D2] text-white py-3 px-8 transition font-medium text-base md:text-lg delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 rounded-full shadow-lg hover:shadow-xl'>Get Started</button>
      <button className='border-3 border-[#2255D2] text-[#2255D2] font-medium text-base md:text-lg py-3 px-8 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 rounded-full'>Learn More</button>
    </div>
  </div>

  {/*Right side - Demo image */}
  <div className='flex items-center justify-center w-full lg:w-1/2 z-10 mb-8 lg:mb-0'>
    <img 
      loading='lazy'
      src={Frame3} 
      alt="Project workspace dashboard" 
      className='w-full max-w-3xl h-auto object-contain drop-shadow-2xl' 
    />
  </div>

  {/*Diagonal dark triangle at bottom-right */}
  <div className='absolute bottom-0 right-0 w-2/5 h-64 md:h-80 lg:h-70 pointer-events-none'>
    <svg className='absolute bottom-0 right-0 w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
      <polygon points='40,100 100,100 100,0' fill='#151B25' />
    </svg>
  </div>
</section>
    
    </main>
  );
};

export default Unique;