import React from 'react';
import { ArrowRight, Brain, Rocket, Layers} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = ({ onExplore }) => {

  const navigate = useNavigate()
  const heroCarousels = [
    {
      id: 1,
      icon: <Rocket className="w-6 h-6 lg:w-8 lg:h-8 text-[#2255D7]" />,
      actionWord: 'Launch Faster',
      description: 'Automate business setup and operations'
    },
    {
      id: 2,
      icon: <Layers className="w-6 h-6 lg:w-8 lg:h-8 text-[#9333EA]" />,
      actionWord: 'Build Teams',
      description: 'Connect with skilled freelancers'
    },
    {
      id: 3,
      icon: <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-[#16A34A]" />,
      actionWord: 'AI-Powered',
      description: 'Frontier GenAI optimizes workflows'
    },
    {
      id: 4,
      cta: 'Get Started'
    }
  ];

  // Navigate to signup with client role pre-selected
  const startProject = () => {
    navigate('/signup', { 
      state: { 
        preselectedRole: 'client' 
      } 
    });
  };

  // Navigate to signup with freelancer role pre-selected
  const getHired = () => {
    navigate('/signup', { 
      state: { 
        preselectedRole: 'freelancer' 
      } 
    });
  };



  return (
    <div 
      className='hero-container  basic-font w-full min-h-[90vh] flex flex-col lg:flex-row justify-center items-center z-1 p-4  sm:p-6 md:p-8 lg:p-16 md:px-8 lg:px-20 lg:pt-18 bg-gradient-to-br from-[#111827] from-0% via-[#0e4283] via-50% to-[#3f2286] to-100% relative'>
      
      {/* Content Section */}
      <div className='w-full lg:w-1/2 z-50 relative flex justify-center lg:justify-start'>
        <div className='flex flex-col justify-center items-center lg:items-start text-center lg:text-left px-4 sm:px-6 md:px-4 lg:px-10 max-w-2xl'>
          <h1 
            className='text-white text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold mb-4 sm:mb-6 leading-tight'
          >
            AI-powered <br />
            business life cycle platform
          </h1>
          
          <p 
            className='text-white font-light text-sm sm:text-base md:text-base lg:text-lg xl:text-xl leading-relaxed mb-6 sm:mb-8 text-center lg:text-justify'
          >
           Lancer takes the heavy lifting off founders and business owners by automating business formalization, hiring, workflow management, performance evaluation, and everyday operations—powered by frontier GenAI, bespoke machine learning, and general automation. Lancer also connects freelancers with the right skills to Startups and Business that are in need of their talents.
          </p>
          
          <div 
            className='w-full flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-stretch sm:items-center'
          >
            <button 
              onClick={startProject}
              className='py-3 px-6 md:py-2.5 md:px-6 lg:py-3 lg:px-8 bg-[#2255D7] text-white font-semibold rounded-lg shadow-xl hover:bg-[#1447e6] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-sm md:text-sm lg:text-base flex items-center justify-center gap-2 w-full sm:w-auto'
            >
              Start a Project 
              <ArrowRight size={18} className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button 
              onClick={getHired}
              className='py-3 px-6 md:py-2.5 md:px-6 lg:py-3 lg:px-8 bg-white text-[#2255d7] font-semibold rounded-lg shadow-xl hover:bg-[#f1f1f1] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-sm md:text-sm lg:text-base w-full sm:w-auto'
            >
              Get Hired
            </button>
          </div>
        </div>
      </div>

      {/* Image Section - Hidden on Mobile and Tablet, Visible on Desktop Only */}
      <div className='hidden lg:flex w-full lg:w-1/2 relative z-50 mt-8 lg:mt-0 justify-center items-center'>
        {/* Top-left decorative circle */}
        <div className='absolute -top-8 lg:-top-13 -left-3 w-20 h-20 lg:w-28 lg:h-28 bg-[#DBEAFE] rounded-full z-30'></div>
        
        {/* Bottom-right decorative circle */}
        <div className='absolute -bottom-12 lg:-bottom-18 -right-6 lg:-right-10 w-24 h-24 lg:w-34 lg:h-34 bg-[#F3E8FF] rounded-full z-30'></div>
        
        <section className="bg-[#2255d7] w-full max-w-4xl h-[45vh] lg:h-[55vh] rounded-lg grid grid-cols-2 gap-4 lg:gap-6 p-5 lg:p-8 relative z-20">
          {heroCarousels.map((carousel, index) => (
            <div 
              key={carousel.id || index} 
              className="bg-white rounded-lg p-4 lg:p-6 flex flex-col justify-center"
            >
              {carousel.cta ? (
                // CTA Card (bottom right)
                <div className="flex items-center justify-center h-full">
                  <button 
                    onClick={startProject}
                    className="bg-[#9333EA] hover:bg-purple-700 text-white font-semibold py-2.5 px-6 lg:py-3 lg:px-8 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none text-sm lg:text-base"
                  >
                    {carousel.cta}
                  </button>
                </div>
              ) : (
                // Regular feature cards
                <div className="flex flex-col">
                  <div className="mb-3 lg:mb-4">
                    {carousel.icon}
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-[#151B25] mb-2 lg:mb-3">
                    {carousel.actionWord}
                  </h3>
                  <p className="text-[#4B5563] font-normal text-sm lg:text-[16px] leading-relaxed">
                    {carousel.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>

      {/* Mobile decorative elements - subtle accent shapes */}
      <div className='lg:hidden absolute top-10 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#3A8DFF] to-[#A7A3FF] opacity-10'></div>
      <div className='lg:hidden absolute bottom-20 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#A7A3FF] to-[#3A8DFF] opacity-10'></div>
      <div className='lg:hidden absolute top-1/3 left-2 w-8 h-8 rounded-full bg-[#2563EB] opacity-5'></div>
    </div>
  );
};

export default Hero;