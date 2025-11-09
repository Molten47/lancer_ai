import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const CallToAction = () => {

   const navigate = useNavigate();

   const handleNavigateToSignup = (role) => {
    navigate('/signup', {
      state: { preselectedRole: role }
    });
  };
  
  return (
    <div className='min-h-[60vh] flex flex-col bg-[#F3F4F6] items-center justify-center py-16 px-4 sm:px-6 md:px-8 w-full'>
      <div className='flex  bg-[#151B25] p-9 flex-col items-center max-w-6xl w-full rounded-lg'>
        {/* Header Section */}
       
        
        <div className='text-center mb-12 gap-3 flex flex-col'>
           <h2 className='text-white font-semibold text-2xl sm:text-4xl md:text-[24px] text-center mb-4 px-4'>
          Ready to simplify your business with Lancer?
        </h2>
          <p className='text-[#DBEAFE] text-sm sm:text-lg max-w-3xl mx-auto px-4'>
            Join thousands of founders, businesses, and freelancers who are transforming how they work with our AI-powered platform.
          </p>
        </div>

        {/* Cards Section */}
        <div className='flex flex-col lg:flex-row gap-6 w-full max-w-2xl px-4'>
          {/* For Businesses Card */}
          <div className='bg-[#2a3441] rounded-2xl p-8 flex-1 flex flex-col items-center text-center'>
            <h3 className='text-white font-semibold text-xl mb-4'>
              For Businesses
            </h3>
            <p className='text-gray-300 text-sm font-normal mb-8 max-w-[256px]'>
              Start a project and connect with talented freelancers or build your full business infrastructure
            </p>
            <button 
              onClick={() => handleNavigateToSignup('client')}
              className='bg-white text-[#2255D7] font-medium px-5 py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors duration-200 w-full max-w-xs flex items-center justify-center gap-2'
            >
              Start A Project
            <ArrowRight/>
            </button>
          </div>

          {/* For Freelancers Card */}
          <div className='bg-[#2a3441] rounded-2xl  min-w-[36px] p-8 flex-1 flex flex-col items-center text-center'>
            <h3 className='text-white font-semibold text-xl mb-4'>
              For Freelancers
            </h3>
            <p className='text-gray-300 text-sm mb-8 max-w-[256px] font-normal'>
              Showcase your skills and get connected with businesses that value your expertise
            </p>
            <button 
              onClick={() => handleNavigateToSignup('freelancer')}
              className='bg-white text-[#2255D7] font-medium px-5 py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors duration-200 w-full max-w-xs flex items-center justify-center gap-2'
            >
              Sign Up and Get Hired
             <ArrowRight/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;