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
    <div className='min-h-[60vh] flex flex-col bg-white items-center justify-center py-16 px-4 w-full third-font'>
      <div className='flex flex-col items-center max-w-4xl w-full'>
        {/* Header Section */}
        <h2 className='text-[#151B25] font-semibold text-3xl sm:text-4xl md:text-5xl text-center mb-6'>
          Throw in the lance and get started
        </h2>
        
        <div className='text-center mb-8'>
          <p className='text-[#151B25] text-base max-w-96 sm:text-lg mb-1'>
            Ready to simplify your business with Lancer? Join the waitlist
          </p>
        </div>

        {/* Buttons Section */}
        <div className='flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto'>
          <button 
            onClick={() => handleNavigateToSignup('client')}
            className='bg-[#2255D7] text-white font-medium px-8 py-4 rounded-lg text-base sm:text-lg hover:bg-[#1a45b8] transition-colors duration-200'
          >
            For Business - Join Here
          </button>
          
          <button 
            onClick={() => handleNavigateToSignup('freelancer')}
            className='bg-white text-[#151B25] font-medium px-8 py-4 rounded-lg text-base sm:text-lg border-2 border-[#151B25] hover:bg-gray-50 transition-colors duration-200'
          >
            For Freelancers - Join Here
          </button>
        </div>

        {/* Footer Text */}
        <p className='text-[#151B25] font-bold text-2xl max-w-3xl sm:text-lg text-center'>
          3000+ people already showed indication to start lancing it.
        </p>
      </div>
    </div>
  );
};

export default CallToAction;