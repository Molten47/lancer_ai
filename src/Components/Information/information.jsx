import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Users } from 'lucide-react';

const CallToAction = () => {
  const navigate = useNavigate();

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };
  
  return (
    <div className='h-[70vh] flex flex-col bg-[#F3F4F6] items-center justify-center py-6 w-full'>
  <div className='flex flex-col min-h-4/5 w-3/5 bg-gradient-to-r from-[#2255D7] to-[#151B25] p-6 md:p-14 relative rounded-2xl mx-4 md:mx-8'>
      {/* Header Section */}
      <div className='flex flex-col justify-center items-center z-1 relative p-4 md:p-6 mb-8'>
        <h2 className='basic-font text-white font-bold text-2xl md:text-2xl text-center leading-tight mb-4'>
          Ready to simplify your business with Lancer?
        </h2>
        <p className='basic-font text-[#DBEAFE] font-normal text-[1rem] md:text-[1rem] text-center max-w-3xl leading-relaxed'>
          Join thousands of founders, businesses, and freelancers who are transforming how they work with our AI-powered platform.
        </p>
      </div>

      {/* Cards Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full max-w-3xl mx-auto'>
        {/* For Businesses Card */}
        <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-8 flex flex-col items-center text-center transition-all duration-300 hover:bg-white/15 hover:scale-95 hover:shadow-2xl'>
          <h3 className="text-lg md:text-xl basic-font font-semibold text-white mb-3">
            For Businesses
          </h3>
          <p className="text-[#DBEAFE] basic-font font-normal text-sm md:text-sm mb-6 leading-relaxed max-w-xs">
            Start a project and connect with talented freelancers or build your full business infrastructure
          </p>
          <button 
            onClick={handleNavigateToSignup}
            className="bg-white text-light font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-lg hover:scale-105 flex items-center space-x-2 basic-font text-sm w-full justify-center"
          >
            <span>Start A Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* For Freelancers Card */}
        <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:shadow-2xl'>
          <h3 className="text-lg md:text-xl basic-font font-semibold text-white mb-3">
            For Freelancers
          </h3>
          <p className="text-[#DBEAFE] basic-font font-normal text-sm md:text-sm mb-6 leading-relaxed max-w-xs">
            Showcase your skills and get connected with businesses that value your expertise
          </p>
          <button 
            onClick={handleNavigateToSignup}
            className="bg-white text-light font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-lg hover:scale-105 flex items-center space-x-2 basic-font text-sm w-full justify-center"
          >
            <span>Sign Up and Get Hired</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </div>
  
  );
};

export default CallToAction;