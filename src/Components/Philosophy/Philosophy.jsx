import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Philosophy = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Handle responsive state based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Services content
  const services = [
    {
      title: "Projects",
      subtitle: "Short-term Contract Management",
      description: "Projects are a way for founders, small business owners and creative entrepreneurs to work on contracts with a short to medium term lifespan. Setup a Project, efficiently hire freelancers, assign tasks, manage workflows, track overall project progress and monitor freelancer working performance all with the power of Agentic AI.",
      icon: "🎯",
      gradient: "from-blue-500 to-cyan-400",
      color: "bg-blue-500"
    },
    {
      title: "Business Spaces",
      subtitle: "Comprehensive Business Automation",
      description: "Business Spaces aren't duration bound and offer a broader & more holistic business process automation and management experience. For aspiring founders, through automated Business formalization, AI-powered hiring and general onboarding framework, a Business Space helps you with everything you need to bring your startup idea into the real world.",
      icon: "🏢",
      gradient: "from-purple-500 to-pink-400",
      color: "bg-purple-500"
    },
    {
      title: "Freelancer Connect",
      subtitle: "Fair Employment Marketplace",
      description: "For freelancers, Lancer connects you with founders, early stage startups and businesses that need your skills for either short to medium term contracts (Projects) or full employment packages (Business Spaces). Lancer enforces fair pay baseline and uses automated pay standardization to determine favorable compensation ranges.",
      icon: "🤝",
      gradient: "from-emerald-500 to-teal-400",
      color: "bg-emerald-500"
    }
  ];

  // Handle card navigation
  const nextCard = () => {
    if (currentCard < services.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  // Auto-advance cards every 3 seconds
  useEffect(() => {
    const autoAdvance = setInterval(() => {
      setCurrentCard(prevCard => {
        if (prevCard >= services.length - 1) {
          return 0; // Reset to first card when reaching the end
        }
        return prevCard + 1;
      });
    }, 3000);

    return () => clearInterval(autoAdvance);
  }, [services.length]);

  // Handle scroll/swipe gestures
  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = (e) => {
      if (isScrolling) return;
      
      setIsScrolling(true);
      
      if (e.deltaY > 0 && currentCard < services.length - 1) {
        nextCard();
      } else if (e.deltaY < 0 && currentCard > 0) {
        prevCard();
      }
      
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    const container = document.getElementById('services-container');
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [currentCard, isScrolling]);

  return (
    <div className={`w-full ${isMobile ? 'min-h-screen py-16' : 'h-screen'} bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden basic-font mt-6`}>
      {/* Header Section */}
      <div className="text-center mb-12 pt-10">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-primary font-bold ${isMobile ? 'text-3xl' : 'text-5xl'} mb-4`}
        >
          Our Services
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-primary text-lg max-w-2xl mx-auto px-4"
        >
          Revolutionizing how businesses and freelancers connect through AI-powered solutions
        </motion.p>
      </div>

      {/* Stacked Cards Container */}
      <div 
        id="services-container"
        className={`relative ${isMobile ? 'h-auto' : 'h-96'} flex justify-center items-center px-4`}
      >
        <AnimatePresence mode="wait">
          {services.map((service, index) => {
            const isActive = index === currentCard;
            const isPrev = index < currentCard;
            const isNext = index > currentCard;
            
            return (
              <motion.div
                key={service.title}
                initial={{ 
                  scale: 0.8, 
                  opacity: 0,
                  rotateY: -15,
                  z: -100
                }}
                animate={{
                  scale: isActive ? 1 : isPrev ? 0.9 : 0.85,
                  opacity: isActive ? 1 : isPrev ? 0.3 : 0.6,
                  rotateY: isActive ? 0 : isPrev ? -10 : 10,
                  x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                  y: isActive ? 0 : isPrev ? 20 : isNext ? -20 : 0,
                  z: isActive ? 0 : isPrev ? -50 : -25,
                }}
                exit={{ 
                  scale: 0.7, 
                  opacity: 0,
                  rotateY: 15
                }}
                transition={{ 
                  duration: 0.6, 
                  ease: [0.23, 1, 0.32, 1] 
                }}
                className={`absolute ${isMobile ? 'w-11/12' : 'w-238'} h-120 mt-18 rounded-3xl shadow-2xl cursor-pointer transform-gpu`}
                style={{
                  background: `linear-gradient(135deg, ${service.gradient.includes('blue') ? '#3b82f6, #06b6d4' : service.gradient.includes('purple') ? '#8b5cf6, #ec4899' : '#10b981, #14b8a6'})`,
                  transformStyle: 'preserve-3d',
                  zIndex: isActive ? 10 : isPrev ? 5 : 1
                }}
                onClick={() => setCurrentCard(index)}
                whileHover={isActive ? { scale: 1.02 } : {}}
              >
                {/* Glass overlay effect */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20" />
                
                {/* Content */}
                <div className="relative p-8 h-full flex flex-col justify-between text-white z-10">
                  <div>
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}>
                      {service.title}
                    </h3>
                    <p className="text-white/90 font-medium mb-4 text-sm">
                      {service.subtitle}
                    </p>
                  </div>
                  
                  <p className={`text-white/80 ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed line-clamp-6`}>
                    {service.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/40" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {services.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentCard ? 'bg-blue-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Controls hint */}
      <div className="text-center mt-8 text-slate-500 text-sm">
        {!isMobile && ""}
        {isMobile && ""}
      </div>

      {/* Navigation buttons for mobile */}
      {isMobile && (
        <div className="flex justify-center space-x-4 mt-6">
          <motion.button
            onClick={prevCard}
            disabled={currentCard === 0}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </motion.button>
          <motion.button
            onClick={nextCard}
            disabled={currentCard === services.length - 1}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Philosophy;