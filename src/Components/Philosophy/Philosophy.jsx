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
      subtitle: "Short-term Contract Management",
      description: "Projects are a way for founders, small business owners and creative entrepreneurs to work on contracts with a short to medium term lifespan. Setup a Project, efficiently hire freelancers, assign tasks, manage workflows, track overall project progress and monitor freelancer working performance all with the power of Agentic AI.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Efficient hiring, Task assignment, Workflow management, Performance tracking',
      color: 'bg-[#2255D7]'
    },
    {
      id: 2,
      title: "Talent Management", 
      subtitle: "Long-term Relationship Building",
      description: "Build lasting relationships with top freelancers and contractors. Our talent management system helps you maintain a curated network of skilled professionals, track their availability, manage contracts, and foster long-term partnerships that drive your business forward.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Talent sourcing, Relationship building, Contract management, Network development',
      color: 'bg-purple-600'
    },
    {
      id: 3,
      title: "Resource Planning",
      subtitle: "Strategic Workforce Optimization", 
      description: "Optimize your workforce allocation with intelligent resource planning. Predict project needs, balance workloads, allocate budgets effectively, and ensure optimal utilization of both internal team members and external contractors.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Resource allocation, Budget planning, Workload balancing, Strategic planning',
      color: 'bg-[#22C55E]'
    }
  ];


  return (
   <div className={`w-full ${isMobile ? 'min-h-[70vh] ' : 'min-h-[160vh]'} bg-white basic-font py-14 flex flex-col items-center`}>
      {/* Header Section */}
      <div className="text-center mb-12 bg-white sticky top-0 z-30">
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
          return (
            <div
              key={service.id}
              className={`
                sticky top-0 
                flex flex-col w-3/4 max-w-6xl mt-4
                ${index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10'}
            `}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex h-120">
                {/* Color Block Left Side */}
                <div className={`w-1/2 ${service.color} flex items-center justify-center`}>
                </div>
                
                {/* Content Right Side */}
                <div className="w-1/2 p-8 flex flex-col justify-start">
                  <div>
                    <h3 className="text-2xl font-bold text-[#151B25] mb-2">
                      {service.title}
                    </h3>
                    <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>
                      {/* Keywords with checkmarks */}
                  <div className="grid grid-cols-2 gap-2">
                    {service.keywords.split(', ').map((keyword, idx) => (
                      <div key={idx} className="flex items-center">
                        <CheckCircle className="text-[#22C55E] w-4 h-4 mr-3" />
                        <span className="text-sm text-[#4B5563]">{keyword}</span>
                      </div>
                    ))}
                  </div>
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