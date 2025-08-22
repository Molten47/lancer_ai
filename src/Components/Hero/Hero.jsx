import React from 'react';
import { motion } from 'framer-motion';
import BackImage from '../../assets/Images/backgroundimage.jpg'; 
import Inter from '../../assets/Images/fatemeh (1).jpg';
import Inter1 from '../../assets/Images/fatemeh (2).jpg';
import Inter3 from '../../assets/Images/property-10.jpg';
import Inter4 from '../../assets/Images/property-6.jpg';

const Hero = ({ onExplore }) => {
  const imageDisplay = {
    backgroundImage: `url(${BackImage})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };

  const handleExploreClick = (e) => {
    e.preventDefault();
    if (onExplore) {
      onExplore();
    }
  };

  return (
    <div 
      className='hero-container w-full min-h-screen flex flex-col md:flex-row justify-center items-center z-1 p-4 sm:p-6 md:p-12 md:px-20 relative'
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F6FB 60%, #A7A3FF 100%)',
        // On larger screens, use white background for the original design
        '@media (min-width: 768px)': {
          backgroundColor: 'white'
        }
      }}
    >
      {/* Desktop overlay - only on larger screens */}
      <div 
        className='hidden md:block absolute top-0 left-0 w-full h-full z-2' 
        style={{ backgroundColor: 'rgba(244, 246, 251, 0.7)' }}
      ></div>
      
      {/* Content Section */}
      <div className='w-full md:w-1/2 z-50 relative flex justify-center md:justify-start'>
        <div className='flex flex-col justify-center items-center md:items-start text-center md:text-left p-4 sm:p-6 md:p-10 max-w-2xl'>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-[#0C0950] text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold basic-font mb-4 sm:mb-6 leading-tight'
          >
            AI-powered <br />
            business life cycle platform
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='text-primary font-normal text-base sm:text-lg max-w-3xl md:text-lg lg:text-xl new-font leading-relaxed mb-8 text-justify md:text-justify'
          >
           Lancer takes the heavy lifting off founders and business owners by automating business formalization, hiring, workflow management, performance evaluation, and everyday operations—powered by frontier GenAI, bespoke machine learning, and general automation. Lancer also connects freelancers with the right skills to Startups and Business that are in need of their talents.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='w-full flex justify-center md:justify-start'
          >
            <button 
              onClick={handleExploreClick}
              className='py-4 px-10 sm:py-3 sm:px-8 bg-[#2563EB] text-white font-semibold basic-font rounded-lg shadow-xl hover:bg-[#1447e6] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-lg sm:text-base'
            >
              Explore
            </button>
          </motion.div>
        </div>
      </div>

      {/* Image Section - Hidden on Mobile, Visible on Desktop */}
      <div className='hidden md:flex w-full md:w-1/2 relative z-50 mt-8 md:mt-0 justify-center items-center'>
        <div className='relative w-full max-w-lg h-96 sm:h-[500px] md:h-96 lg:h-[500px] flex justify-center items-center'>
          
          {/* Top Left Circle */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='absolute top-8 -left-8 w-42 h-42 md:w-78 md:h-78 rounded-full overflow-hidden shadow-xl border-4 border-white'
          >
            <img 
              src={Inter}
              alt="Startup team 1"
              loading='lazy'
              className='w-full h-full object-cover'
            />
          </motion.div>

          {/* Top Right Circle */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='absolute top-1 -right-32 w-42 h-42 md:w-86 md:h-86 rounded-full overflow-hidden shadow-xl border-4 border-white'
          >
            <img 
              src={Inter1}
              alt="Startup team 2"
              className='w-full h-full object-cover'
            />
          </motion.div>

          {/* Bottom Left Circle */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='absolute -bottom-38 -left-8 w-42 h-42 md:w-86 md:h-86 rounded-full overflow-hidden shadow-xl border-4 border-white'
          >
            <img 
              src={Inter3}
              loading='lazy'
              alt="Startup team 3"
              className='w-full h-full object-cover'
            />
          </motion.div>

          {/* Bottom Right Circle */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='absolute -bottom-38 -right-32 w-42 h-42 md:w-78 md:h-78 rounded-full overflow-hidden shadow-xl border-4 border-white'
          >
            <img 
              src={Inter4}
              alt="Startup team 4"
              className='w-full h-full object-cover'
            />
          </motion.div>

          {/* Center connecting element */}
          <div className='absolute inset-0 flex justify-center items-center'>
            <div className='w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-200 to-orange-100 opacity-20'></div>
          </div>
        </div>
      </div>

      {/* Mobile decorative elements - subtle accent shapes */}
      <div className='md:hidden absolute top-10 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#3A8DFF] to-[#A7A3FF] opacity-10'></div>
      <div className='md:hidden absolute bottom-20 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#A7A3FF] to-[#3A8DFF] opacity-10'></div>
      <div className='md:hidden absolute top-1/3 left-2 w-8 h-8 rounded-full bg-[#2563EB] opacity-5'></div>
    </div>
  );
};

export default Hero;