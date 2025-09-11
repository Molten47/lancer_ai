import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Rocket, Layers} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'

const Hero = ({ onExplore }) => {
const navigate = useNavigate()

const heroCarousels = [
    {
      id: 1,
      icon: <Rocket className="w-8 h-8 text-[#2255D7]" />,
      actionWord: 'Launch Faster',
      description: 'Automate business setup and operations'
    },
    {
      id: 2,
      icon: <Layers className="w-8 h-8 text-[#9333EA]" />,
      actionWord: 'Build Teams',
      description: 'Connect with skilled freelancers'
    },
    {
      id: 3,
      icon: <Brain className="w-8 h-8 text-[#16A34A]" />,
      actionWord: 'AI-Powered',
      description: 'Frontier GenAI optimizes workflows'
    },
    {
      id: 4,
      cta: 'Get Started'
    }
  ];


const startProject = ( ) => {
  navigate('/signup')
}
  const handleExploreClick = (e) => {
    e.preventDefault();
    if (onExplore) {
      onExplore();
    }
  };

  return (
    <div 
      className='hero-container w-full min-h-[90vh] flex flex-col md:flex-row justify-center items-center z-1 p-4 sm:p-6 md:p-12 md:px-20 bg-gradient-to-br from-[#111827] from-0% via-[#0e4283] via-50% to-[#3f2286] to-100%  relative basic-font'>
      {/* Content Section */}
      <div className='w-full md:w-1/2 z-50 relative flex justify-center md:justify-start'>
        <div className='flex flex-col justify-center items-center md:items-start text-center md:text-left p-4 sm:p-6 md:p-10 max-w-2xl'>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-white text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold basic-font mb-4 sm:mb-6 leading-tight '
          >
            AI-powered <br />
            business life cycle platform
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='text-white font-light text-[16px] sm:text-lg max-w-5xl md:text-lg lg:text-xl basic-font leading-relaxed mb-8 text-justify md:text-justify mt-4'
          >
           Lancer takes the heavy lifting off founders and business owners by automating business formalization, hiring, workflow management, performance evaluation, and everyday operations—powered by frontier GenAI, bespoke machine learning, and general automation. Lancer also connects freelancers with the right skills to Startups and Business that are in need of their talents.
          </motion.p>
          
        <motion.div 
         initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
       className='w-full flex flex-row gap-3 justify-center md:justify-start'
>
  <button 
    onClick={startProject}
    className='py-4 px-10 sm:py-3 sm:px-8 bg-[#2255D7] text-white font-semibold basic-font rounded-lg shadow-xl hover:bg-[#1447e6] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-lg sm:text-base flex items-center gap-2'
  >
    Start a Project 
    <ArrowRight size={20} />
  </button>
  <button 
    onClick={handleExploreClick}
    className='py-4 px-10 sm:py-3 sm:px-8 bg-white text-[#2255d7] font-semibold basic-font rounded-lg shadow-xl hover:bg-[#f1f1f1] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-lg sm:text-base'
  >
    Learn More
  </button>
</motion.div>
        </div>
      </div>

      {/* Image Section - Hidden on Mobile, Visible on Desktop */}
    <div className='hidden md:flex w-full md:w-1/2 relative z-50 mt-8 md:mt-0 justify-center items-center'>
  {/* Top-left decorative circle */}
  <div className='absolute -top-13 -left-4 w-28 h-28 bg-[#DBEAFE] rounded-full z-30'></div>
  
  {/* Bottom-right decorative circle */}
  <div className='absolute -bottom-18 -right-10 w-34 h-34 bg-[#F3E8FF] rounded-full z-30'></div>
  
  <section className="bg-[#2255d7] w-full max-w-4xl h-[55vh] rounded-lg grid grid-cols-2 gap-6 p-8 relative z-20">
    {heroCarousels.map((carousel, index) => (
      <div 
        key={carousel.id || index} 
        className="bg-white rounded-lg p-6 flex flex-col justify-center"
      >
        {carousel.cta ? (
          // CTA Card (bottom right)
          <div className="flex items-center justify-center h-full">
            <button 
            onClick={startProject}
            className="bg-[#9333EA] hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg trasition-all duration-300 transition-colors ease-in-out trans hover:scale-105 focus:outline-none">
              {carousel.cta}
            </button>
          </div>
        ) : (
          // Regular feature cards
          <div className="flex flex-col">
            <div className="mb-4">
              {carousel.icon}
            </div>
            <h3 className="text-xl font-semibold text-[#151B25] mb-3">
              {carousel.actionWord}
            </h3>
            <p className="text-[#4B5563] font-normal text-[16px] leading-relaxed">
              {carousel.description}
            </p>
          </div>
        )}
      </div>
    ))}
  </section>
</div>

      {/* Mobile decorative elements - subtle accent shapes */}
      <div className='md:hidden absolute top-10 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#3A8DFF] to-[#A7A3FF] opacity-10'></div>
      <div className='md:hidden absolute bottom-20 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#A7A3FF] to-[#3A8DFF] opacity-10'></div>
      <div className='md:hidden absolute top-1/3 left-2 w-8 h-8 rounded-full bg-[#2563EB] opacity-5'></div>
    </div>
  );
};

export default Hero;