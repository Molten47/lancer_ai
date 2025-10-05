import React from 'react';
import { Rocket, Building, PaletteIcon, ArrowUpRight } from 'lucide-react';
import Frame1 from '../../assets/Images/fatemeh.jpg';
import Frame2 from '../../assets/Images/property-3.jpg';
import Frame3 from '../../assets/Images/may-gauthier.jpg';

const Unique = () => {
  const features = [
    {
      id: 1,
      bgImage: Frame1,
      icon: <Rocket className="w-6 h-6 text-[#2255D7]" />,
      title: "Startups & Founders",
      description: "Launch your idea with minimal overhead. Automate business formalization, hiring, and operations from day one. Focus on growth while Lancer handles the rest."
    },
    {
      id: 2,
      bgImage: Frame2,
      icon: <Building className="w-6 h-6 text-[#2255D7]" />,
      title: "Small Businesses",
      description: "Scale your existing business with intelligent automation. Optimize processes, enhance team productivity, and make data-driven decisions to fuel growth."
    },
    {
      id: 3,
      bgImage: Frame3,
      icon: <PaletteIcon className="w-6 h-6 text-[#16A34A]" />,
      title: "Creative Entrepreneurs",
      description: "Turn your creative passion into a sustainable business. Manage projects, collaborate with clients, and handle the business side so you can focus on your craft."
    }
  ];

  return (
    <div className="bg-[#F9FAFB] basic-font py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-4 py-2 mb-6">
            <span className="text-[#374151] text-sm font-medium">
              Our Target
            </span>
          </div>
          {/* main text action */}
          <div className="flex justify-center">
            <h2 className="text-2xl md:text-2xl font-medium text-primary max-w-2xl text-center leading-tight">
              The Business Lifecycle Automation <br />solutions for every industry
            </h2>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group relative h-180"
              style={{ backgroundImage: `url(${feature.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black opacity-35"></div>
              
              {/* Arrow Icon - positioned in top right */}
              <div className="absolute top-6 right-6 bg-black opacity-35 backdrop-blur-sm border-2 border-amber-50 rounded-lg p-2">
              <ArrowUpRight className='text-white '/>
              </div>

              {/* Content Section - positioned at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-white rounded-xl p-4">
                  {/* Icon and Title Section */}
                <span className="flex flex-row bg-[#DBEAFE] items-center w-full sm:w-auto justify-between rounded-lg mb-3 py-2 px-3 gap-2">
                 <h3 className="text-sm sm:text-[1rem] font-medium text-primary leading-tight">
                  {feature.title}
                </h3>
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
               {feature.icon}
               </div>
               </span>

                  {/* Description */}
                  <p className="text-[#4B5563] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Get Started Button */}
        <div className="text-center">
          <button className="bg-[#2255D7] hover:bg-[#1E4AC7] text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unique;