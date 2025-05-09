import React from 'react';
import { Globe, Users, Monitor, DollarSign } from 'lucide-react';

const Unique = () => {
  const features = [
    {
      id: 1,
      icon: <Globe className="w-6 h-6 text-dark" />,
      title: "Timezone Synchronization",
      description: "Transparent, AI-generated rates based on project scope and market trends."
    },
    {
      id: 2,
      icon: <Users className="w-6 h-6 text-dark" />,
      title: "Skill Matching",
      description: "Instantly pairs projects with the best-fit freelancers based on skills, experience, and performance"
    },
    {
      id: 3,
      icon: <Monitor className="w-6 h-6 text-dark" />,
      title: "AI Screening",
      description: "Priorities availability & skillset for smooth communication and collaboration"
    },
    {
      id: 4,
      icon: <DollarSign className="w-6 h-6 text-dark" />,
      title: "Automated Fair Pricing",
      description: "All freelancers are screened for quality, so clients don't waste time filtering through noise."
    }
  ];

  return (
    <div className="bg-[#F9FAFB] py-10 px-4 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-[32px] font-semibold basic-font text-gray-900 mb-2 sm:mb-4">What makes Lancer different?</h2>
          <p className="text-base sm:text-[1.2rem] text-dark basic-font max-w-3xl mx-auto mt-2 sm:mt-4">
            Unlike traditional freelancing platforms, Lancer doesn't leave hiring to chance.
            <br className="hidden sm:block" />
            It combines powerful features like:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-[#DBEAFE] rounded-lg p-6 sm:p-8 shadow-sm flex flex-col basic-font gap-2"
            >
              <div className="bg-white text-primary w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl text-primary font-semibold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-base text-dark font-medium sm:text-[1.2rem]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Unique;