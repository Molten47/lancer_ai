import React from 'react';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  const handleNavigateToSignup = (role) => {
    navigate('/signup', {
      state: { preselectedRole: role }
    });
  };
  
  return (
    <div className='min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] flex flex-col bg-white items-center justify-center py-10 sm:py-12 md:py-14 lg:py-16 px-4 sm:px-6 md:px-8 w-full third-font'>
      <div className='flex flex-col items-center max-w-4xl w-full'>
        {/* Header Section */}
        <h2 className='text-[#151B25] font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-5 sm:mb-6 px-4'>
          Throw in the lance and get started
        </h2>
        
        <div className='text-center mb-6 sm:mb-8'>
          <p className='text-[#151B25] text-sm sm:text-base md:text-lg max-w-96 mx-auto px-4'>
            Ready to simplify your business with Lancer? Join the waitlist
          </p>
        </div>

        {/* Buttons Section */}
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto px-4 sm:px-0'>
          <button 
            onClick={() => handleNavigateToSignup('client')}
            className='bg-[#2255D7] text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base md:text-lg hover:bg-[#1a45b8] transition-colors duration-200 w-full sm:w-auto'
          >
            For Business - Join Here
          </button>
          
          <button 
            onClick={() => handleNavigateToSignup('freelancer')}
            className='bg-white text-[#151B25] font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base md:text-lg border-2 border-[#151B25] hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto'
          >
            For Freelancers - Join Here
          </button>
        </div>

        {/* Footer Text */}
        <p className='text-[#151B25] font-bold text-lg sm:text-xl md:text-2xl lg:text-2xl max-w-3xl text-center px-4'>
          3000+ people already showed indication to start lancing it.
        </p>
      </div>
    </div>
  );
};

export default CallToAction;