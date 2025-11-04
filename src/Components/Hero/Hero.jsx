import React from 'react';
import { ArrowRight, Brain, Rocket, Layers, MousePointer2} from 'lucide-react';
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
      cta: 'Join waitlist'
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
      className='hero-container third-font w-full min-h-[70vh] flex flex-col lg:flex-row justify-center items-center z-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 p-4 sm:p-6 md:p-8 lg:p-16 md:px-8 lg:px-20 bg-white relative overflow-hidden'
    >
      
      {/* Decorative Floating Name Tags */}
      {/* Peter - Top Left */}
      <div className='hidden lg:block absolute top-78 left-145 animate-float'>
        <div className='relative'>
          <div className='bg-[#A8B8D8] text-white px-5 py-2.5 rounded-br-xl rounded-bl-xl rounded-tr-xl rounded-tl-0 shadow-lg font-medium  text-base'>
            Peter
          </div>
          <svg className='absolute -top-4 -right-6 w-6 h-6 transform rotate-90' viewBox="0 0 24 24" fill="#A4B4CB">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          </svg>
        </div>
      </div>

      {/* Kelvin - Top Right */}
      <div className='hidden lg:block absolute top-56 right-154 animate-float-delayed'>
        <div className='relative'>
          <div className='bg-[#1E293B] text-white px-5 py-2.5 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-lg font-medium text-base'>
            Kelvin
          </div>

        </div>
      </div>

      {/* Shirley - Bottom Right */}
      <div className='hidden lg:block absolute bottom-40 right-135 animate-float'>
        <div className='relative'>
          <div className='bg-[#2563EB] text-white px-5 py-2.5 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-lg font-medium text-base'>
            Shirley
          </div>
           <svg className='absolute -top-4 -left-6 w-6 h-6 text-[#64748B]  transform rotate-0' viewBox="0 0 24 24" fill="#2563EB">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          </svg>
        </div>
      </div>
      
      {/* Content Section */}
      <div className='w-full lg:w-1/2 z-50 relative flex justify-center lg:justify-center'>
        <div className='flex flex-col justify-center items-center lg:items-center text-center lg:text-center px-4 sm:px-6 md:px-4 lg:px-10 max-w-2xl'>
          <h1 
            className='text-white text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold mb-4 sm:mb-6 leading-tight'
          >
           <span className='text-[#131635]'>Build Your Team</span> <br />
            <span className='text-[#2563EB]'>Get Things Done</span>
          </h1>
          
          <p 
            className='text-[#000000] text-center font-light text-sm sm:text-base md:text-base lg:text-lg xl:text-xl leading-relaxed mb-6 sm:mb-8 lg:text-center'
          >
           Lancer helps with the operational heavy lifting through project initiation, Hiring, and overall workflow management.
          </p>
          
          <div 
            className='w-full flex flex-col sm:flex-row gap-3 justify-center lg:justify-center items-stretch sm:items-center'
          >
            <button 
              onClick={startProject}
              className='py-3 px-6 md:py-2.5 md:px-6 lg:py-4 lg:px-8 bg-[#2255D7] text-white font-semibold rounded-lg shadow-xl hover:bg-[#1447e6] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-sm md:text-sm lg:text-base flex items-center justify-center gap-2 w-full sm:w-auto'
            >
              Join Waitlist 
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Hero;