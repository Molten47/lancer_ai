import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import image1 from '../../assets/Images/sigmund.jpg'
import image2 from '../../assets/Images/freelancer.jpg'
import image3 from '../../assets/Images/property-10.jpg'

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
      title: "Project Space",
      description: "Projects are a way for founders, small business owners and creative entrepreneurs to work on contracts with a short to medium term lifespan. Setup a Project, efficiently hire freelancers, assign tasks, manage workflows, track overall project progress and monitor freelancer working performance all with the power of Agentic AI.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Efficient hiring, Task assignment, Workflow management, Performance tracking',
      image: image1
    },
    {
      id: 2,
      title: "For Freelancers", 
      description: "Lancer connects you and professionals like yourself with founders, early stage startups and businesses that are in need of your skills and expertise for either short or medium terms contracts (Projects) or a full employment package (Business Spaces). Lancer enforces a fair pay baseline and also uses an automated pay standardization system which tracks your work history and associated metrics to determine a favorable compensation range to be shown to your current or potential employers.",
      icon: <CheckCircle className='text-[#22C55E]'/>,
      keywords: 'Short-term contracts, Fairpay standards, Full employment options, Performance tracking',
      image: image2
    },
 {
  id: 3,
  title: "Business Spaces",
  description: [
    "Business spaces aren't duration bound and offer a broader, more holistic business process automation and management experience. For aspiring founders, through automated business formalization, AI-powered hiring and general onboarding framework, a Business Space helps you with everything you need to bring your startup idea into the real world.",
    "For early stage startups and businesses, Business Spaces offer a way to automate your business process, hire new talent, efficiently manage internal workflows, track individual employee productivity and develop a robust Business Analytics framework as you grow."
  ],
  icon: null,
  keywords: '',
  image: image3
}
  ];

  return (
   <div className={`w-full ${isMobile ? 'min-h-[70vh]' : 'min-h-[160vh]'} bg-white basic-font py-10 sm:py-14 flex flex-col items-center px-4`}>
   
    </div>
  );
};

export default Philosophy;