import React from 'react';
import BackImage from '../../assets/Images/backgroundimage.jpg'; 
import Inter from '../../assets/Images/property-2.jpg';
import Inter1 from '../../assets/Images/property-3.jpg';

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
      className='hero-container w-full min-h-[80vh] flex flex-col md:flex-row justify-center items-center z-1 p-4 sm:p-8 md:p-12 relative' 
      style={imageDisplay}
    >
      <div 
        className='absolute top-0 left-0 w-full h-full z-2' 
        style={{ backgroundColor: 'rgba(244, 246, 251, 0.7)' }}
      ></div>
      
      {/* Content Section - Original Styling */}
      <div className='w-full md:w-1/2 z-50 relative'>
        <div className='flex flex-col justify-center items-start text-left p-4 sm:p-6 md:p-10'>
          <h1 className='text-primary text-4xl sm:text-5xl md:text-6xl font-semibold basic-font mb-3 sm:mb-4 md:mb-6 leading-tight'>
            AI-powered business life cycle platform
          </h1>
          <p className='text-primary font-medium text-base sm:text-lg md:text-xl basic-font leading-relaxed max-w-xl text-justify'>
            Lancer provides startups, private businesses, and government organizations with state-of-the-art technological solutions through artificial intelligence. By bringing the best brains to make your best ideas a fulfilled dream. You imagine. Lancer delivers.
          </p>
          <div className='mt-6'>
            <button 
              onClick={handleExploreClick}
              className='py-3 px-10 bg-cta text-light basic-font rounded-lg shadow-md hover:bg-[#00b5b5] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cta focus:ring-opacity-50'
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Image Section - Larger Images */}
      <div className='w-full md:w-1/2 relative z-50 mt-8 md:mt-0 flex justify-center items-center'>
        <div className='relative w-full max-w-2xl h-96 md:h-[500px]'>
          <img 
            src={Inter}
            alt="Property 1"
            className='w-4/5 md:w-3/4 lg:w-4/5 h-auto max-h-80 md:max-h-96 rounded-lg shadow-lg absolute top-0 left-0 object-cover'
          />
          <img 
            src={Inter1}
            alt="Property 2"
            className='w-4/5 md:w-3/4 lg:w-4/5 h-auto max-h-80 md:max-h-96 rounded-lg shadow-lg absolute top-12 left-12 md:top-16 md:left-16 lg:top-20 lg:left-20 object-cover'
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;