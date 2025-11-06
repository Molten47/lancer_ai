import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, VideoIcon } from 'lucide-react';
import Hubspot from '../../assets/Images/Frame 2095585678.png'
import Figma from '../../assets/Images/Frame 2095585679.png'
import Microsoft from '../../assets/Images/Frame 2095585680.png'
import Google from '../../assets/Images/GoogleWorkspace_Logo_White 2.png'
import Mailchimp from '../../assets/Images/Mailchimp_Logo-Horizontal_White 3.png'
import Slack from '../../assets/Images/images__7_-removebg-preview 3.png'
import Canva from '../../assets/Images/1656735105canva-logo-white 1.png'
import Jira from '../../assets/Images/623031 1.png'

const Philosophy = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive state based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Array of logos
  const logos = [
    { src: Hubspot, alt: 'Hubspot' },
    { src: Figma, alt: 'Figma' },
    { src: Microsoft, alt: 'Microsoft' },
    { src: Google, alt: 'Google Workspace' },
    { src: Mailchimp, alt: 'Mailchimp' },
    { src: Slack, alt: 'Slack' },
    { src: Canva, alt: 'Canva' },
    { src: Jira, alt: 'Jira' }
  ];

  return (
    <div className={`w-full ${isMobile ? 'min-h-[70vh]' : 'min-h-[85vh]'} bg-[#151B25] third-font py-6 sm:py-2 md:py-10 lg:py-10 flex flex-col justify-center items-center px-4 sm:px-6 md:px-8`}>      
      
      {/* Logo Scroll Container */}
      <div className='w-full overflow-hidden relative py-6 sm:py-2 mb-6 sm:mb-8'>
        {/* Gradient borders to mask edges */}
        <div className='absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-[#151B25] to-transparent z-10'></div>
        <div className='absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 bg-gradient-to-l from-[#151B25] to-transparent z-10'></div>
        
        {/* Scrolling Container */}
        <motion.div
          className='flex gap-6 sm:gap-8 md:gap-10 lg:gap-12'
          animate={{
            x: [0, -100 * logos.length * 1.5],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <div key={`logo-1-${index}`} className='flex-shrink-0 h-8 sm:h-10 md:h-12 lg:h-12 flex items-center'>
              <img 
                src={logo.src} 
                alt={logo.alt} 
                loading='lazy'
                className='h-full w-auto object-contain'
              />
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <div key={`logo-2-${index}`} className='flex-shrink-0 h-8 sm:h-10 md:h-12 lg:h-12 flex items-center'>
              <img 
                src={logo.src} 
                alt={logo.alt} 
                loading='lazy'
                className='h-full w-auto object-contain'
              />
            </div>
          ))}
          
          {/* Third set for extra smoothness */}
          {logos.map((logo, index) => (
            <div key={`logo-3-${index}`} className='flex-shrink-0 h-8 sm:h-10 md:h-12 lg:h-12 flex items-center'>
              <img 
                src={logo.src} 
                alt={logo.alt} 
                loading='lazy'
                className='h-full w-auto object-contain'
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Demo Video Section - Centered */}
      <div className='flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-5xl mx-auto'>
        {/* Video Player Container */}
        <div className='relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center'>
          
          {/* Centered Video Icon */}
          <div className='flex items-center justify-center'>
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 80 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-40 sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px]"
            >
              <rect 
                x="17.5" 
                y="20" 
                width="45" 
                height="40" 
                rx="6" 
                fill="#D9D9D9"
              />
              <path 
                d="M62.5 35L77.5 25V55L62.5 45V35Z" 
                fill="#D9D9D9"
              />
            </svg>
          </div>
          
          {/* Video Element - Uncomment when ready */}
          {/* 
          <video 
            className='w-full h-full object-cover'
            controls
            poster="/path-to-thumbnail.jpg"
          >
            <source src="/" type="video/mp4" />
          </video>
          */}
        </div>

        {/* CTA Button */}
        <button className='px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-white border-2 border-white rounded-full font-normal transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-white/20 w-full sm:w-auto max-w-xs sm:max-w-none'>
          Interested in Investing!
        </button>
      </div>
    </div>
  );
};

export default Philosophy;