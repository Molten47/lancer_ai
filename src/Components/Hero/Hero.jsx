import React from 'react';
import BackImage from '../../assets/Images/backgroundimage.jpg'; 


const Hero = () => {
  const imageDisplay = {
    backgroundImage: `url(${BackImage})`,
    backgroundPosition: 'cover',
    backgroundSize: 'center',
  };

  return (
    <div className='hero-container w-full flex flex-col justify-center items-center min-h-[80vh] z-1 p-4 sm:p-8 md:p-12 relative' style={imageDisplay}>
      <div
        className='absolute top-0 left-0 w-full h-full z-2'
        style={{ backgroundColor: 'rgba(244, 246, 251, 0.7)' }} // Adjust opacity here
      ></div>
      <div className='flex flex-col justify-center items-center text-center p-4 sm:p-6 md:p-10 z-50 relative'> {/* Added relative for stacking */}
        <h1 className='text-primary text-[36px] sm:text-[50px] md:text-[80px] font-semibold basic-font mb-2 sm:mb-3 md:mb-4'>Get it done!</h1>
        <p className='text-primary font-medium text-[14px] sm:text-[15px] md:text-[16px] basic-font leading-relaxed w-full sm:w-[30rem] md:w-[40rem]'>
          Next-Gen Freelancing, Powered by AI. Lancer instantly connects you with the right talent — fast, easy, and reliable. You imagine. Lancer delivers.
        </p>
      </div>
      <div className='mt-4 z-20 relative'> {/* Added relative for stacking */}
        <a href=""> 
          <button className='py-2 sm:py-2.5 px-8 sm:px-10 bg-cta rounded-lg text-light basic-font hover:bg-[#00b5b5]'>Explore</button>
        </a>
      </div>
    </div>
  );
};

export default Hero;