import React from 'react';
import { Link } from 'react-router-dom';
import BackImage from '../../assets/Images/backgroundimage.jpg';

const Hero = () => {
  const imageDisplay = {
    backgroundImage: `url(${BackImage})`,
    backgroundPosition: 'cover',
    backgroundSize: 'center',
  };

  return (
    <div className='hero-container w-full flex flex-col justify-center items-center min-h-[90vh] z-1 p-12 relative' style={imageDisplay}>
      <div
        className='absolute top-0 left-0 w-full h-full z-2'
        style={{ backgroundColor: 'rgba(244, 246, 251, 0.7)' }} // Adjust opacity here
      ></div>
      <div className='flex flex-col justify-center items-center text-center p-10 z-50 relative'> {/* Added relative for stacking */}
        <h1 className='text-primary text-[80px] font-semibold basic-font mb-4'>Get it done!</h1>
        <p className='text-primary font-medium text-[16px] basic-font leading-relaxed w-[40rem]'>
          Next-Gen Freelancing, Powered by AI. Lancer instantly connects you with the right talent — fast, easy, and reliable. You imagine. Lancer delivers.
        </p>
      </div>
      <div className='mt-2 z-20 relative'> {/* Added relative for stacking */}
        <Link to="/explore"> {/* scrolls down page */}
          <button className='py-2.5 px-10 bg-cta rounded-lg text-light basic-font hover:bg-[#00b5b5]'>Explore</button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;