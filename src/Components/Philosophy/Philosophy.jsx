import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const Philosophy = () => {

  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive state based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

const services = [
    {
      id: 1,
      title: "Project Management",
      description: "Projects are a way for founders, small business owners and creative entrepreneurs to work on contracts with a short to medium term lifespan. Setup a Project, efficiently hire freelancers, assign tasks, manage workflows, track overall project progress and monitor freelancer working performance all with the power of Agentic AI.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Efficient hiring, Task assignment, Workflow management, Performance tracking',
      color: 'bg-[#2255D7]'
    },
    {
      id: 2,
      title: "For Freelancers", 
      description: "Lancer connects you and professionals like yourself with founders, early stage startups and bsusinesses that are in need of your skills and expertise for either short or medium terms contracts (Projects) or a full employment package (Business Spaces). Lancer enforces a fair pay baseline and also uses an automated pay standardization system which tracks your work history and associated metrics to determine a favorable compensation range to be shown to your current or potential employers.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Short-term contracts, Fairpay standards, Full employment options, Performance tracking',
      color: 'bg-purple-600'
    },
    {
      id: 3,
      title: "Business Spaces",
      description: "Business spaces aren't duration bound and offer a broader, more holistic business process automation and management experience. For aspiring founders, through automated business formalization, AI-powered hiring and general onboarding framework, a Business Space helps you with everything you need to to bring your statup idea into the real world.  For early stage startups and businessess, Business Spaces offer a way to automate your business process, hire new talent, efficiently manage internal workflows, track individual employee productivity and develop a robust Business Analytics framework as you grow.",
      icon: null,
      keywords: '',
      color: 'bg-[#22C55E]'
    }
  ];


  return (
   <div className={`w-full ${isMobile ? 'min-h-[70vh] ' : 'min-h-[160vh]'} bg-white basic-font py-14 flex flex-col items-center`}>
      {/* Header Section */}
      <div className="text-center mb-12 bg-white z-30">
        <span 
          className={`text-[#151B25] p-4 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-lg font-normal ${isMobile ? 'text-[16px]' : 'text-[16px]'} mb-`}
        >
          Our Services
        </span>
        <p 
          className="text-[#151B25] text-lg max-w-2xl mx-auto mt-6 px-4"
        >
          Comprehensive solutions for founders, businesses <br />and freelancers
        </p>
      </div>

      {/* Stacked Cards Container */}
      <div className="relative w-full h-auto mb-8 flex flex-col items-center justify-center">
        {services.map((service, index) => {
          // Reverse the z-index: first card gets lowest z-index, last card gets highest
          const zIndex = index === 0 ? 'z-10' : index === 1 ? 'z-20' : 'z-30';
          
          return (
            <div
              key={service.id}
              className={`
                sticky top-0 
                flex flex-col w-3/4 max-w-6xl mt-4
                ${zIndex}
            `}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex h-120">
                {/* Color Block Left Side */}
                <div className={`w-1/2 ${service.color} flex items-center justify-center`}>
                </div>
                
                {/* Content Right Side */}
                <div className="w-1/2 p-8 flex flex-col justify-start">
                  <div>
                    <h3 className="text-2xl font-bold text-[#151B25] mb-6">
                      {service.title}
                    </h3>
                    <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>
                      {/* Keywords with checkmarks */}
                  {service.keywords && (
                    <div className="grid grid-cols-2 gap-2">
                      {service.keywords.split(', ').map((keyword, idx) => (
                        <div key={idx} className="flex items-center">
                          <CheckCircle className="text-[#22C55E] w-4 h-4 mr-3" />
                          <span className="text-sm text-[#4B5563]">{keyword}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div> 
    </div>
  );
};

export default Philosophy;