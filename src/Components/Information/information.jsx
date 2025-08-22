import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Users } from 'lucide-react';

const CallToAction = () => {
  const navigate = useNavigate();

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };
  return (
    <div className='flex flex-col min-h-[70vh] w-full bg-gradient-to-t from-[#E0F7FA] from-10% via-[#ffffff] via-50% via-transparent via-69% p-6 md:p-8 relative'>
      <div className='flex flex-col justify-center items-center z-1 relative p-4 md:p-5'>
        <h2 className='basic-font text-gray-900 font-bold text-[1.45rem] md:text-[2rem] text-center leading-tight'>
          Ready to simplify your business with Lancer?
        </h2>
        <p className='basic-font text-[#6B7280] font-normal text-[1rem] md:text-[1.15rem] mt-3 md:mt-4 text-center max-w-2xl'>
          Join thousands of businesses and professionals who trust Lancer to streamline their operations and connect with top talent.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 p-6 md:p-8 w-full max-w-6xl mx-auto mt-6'>
        {/* Start a Project Card */}
        <div className='w-full bg-white rounded-xl py-12 md:py-16 px-6 md:px-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-cta'>
          <div className='w-16 h-16 md:w-20 md:h-20 bg-cta/10 rounded-full flex items-center justify-center mb-6 md:mb-8'>
            <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-cta" />
          </div>
          <h3 className="text-xl md:text-2xl basic-font font-bold text-gray-900 mb-3 md:mb-4 text-center">
            Need Work Done?
          </h3>
          <p className="text-gray-700 basic-font text-base md:text-lg text-center mb-8 md:mb-10 leading-relaxed">
            Get your projects completed by verified professionals who deliver quality results on time.
          </p>
          <button 
            onClick={handleNavigateToSignup}
            className="bg-cta hover:bg-[#00b5b5] text-white font-semibold px-8 py-4 md:px-10 md:py-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2 basic-font text-base md:text-lg"
          >
            <span>Start A Project Here</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Get Hired Card */}
        <div className='w-full bg-white rounded-xl py-12 md:py-16 px-6 md:px-8 flex flex-col items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-cta'>
          <div className='w-16 h-16 md:w-20 md:h-20 bg-cta/10 rounded-full flex items-center justify-center mb-6 md:mb-8'>
            <Users className="w-8 h-8 md:w-10 md:h-10 text-cta" />
          </div>
          <h3 className="text-xl md:text-2xl basic-font font-bold text-gray-900 mb-3 md:mb-4 text-center">
            Ready to Work?
          </h3>
          <p className="text-gray-700 basic-font text-base md:text-lg text-center mb-8 md:mb-10 leading-relaxed">
            Showcase your skills and connect with clients who value quality work and professional excellence.
          </p>
          <button 
            onClick={handleNavigateToSignup}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 md:px-10 md:py-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2 basic-font text-base md:text-lg"
          >
            <span>Sign up and get hired</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className='flex flex-col mt-8 md:mt-12 justify-center items-center w-full'>
        <div className='text-center'>
          <p className="text-sm md:text-base text-gray-600 font-normal basic-font">
            Join over <span className="font-semibold text-cta">10,000+</span> satisfied users who have transformed their business with Lancer
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;