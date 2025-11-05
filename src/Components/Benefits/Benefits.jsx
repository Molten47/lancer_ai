import React from 'react';
import { Globe, Smartphone, Database, Code } from 'lucide-react';
import BackgroundGif from '../../assets/Images/660b5a75d56565aaff4cb23cbf6417a81bf0fbe6.gif'

const LancerBanner = () => {
    const services = [
        {
            icon: Globe,
            title: "Digital Freelancer",
            description: "Custom websites designed to meet your unique business needs, from simple landing pages to complex web applications.",
            bgColor: "bg-linear-to-r from-[#60A5FA] to-[#2563EB]"
        },
        {
            icon: Smartphone,
            title: "Startup Founder",
            description: "Native and cross-platform mobile applications that provide seamless experience across all devices.",
            bgColor: "bg-linear-to-r from-[#818CF8] to-[#4F46E5]"
        },
        {
            icon: Database,
            title: "Corporate Organization",
            description: "Extract valuable data from websites to gain insights and make informed business decisions.",
            bgColor: "bg-linear-to-r from-[#C084FC] to-[#9333EA]"
        },
        {
            icon: Code,
            title: "Digital Agencies",
            description: "Seamlessly connect your systems with third party services to enhance functionality and streamline operations.",
            bgColor: "bg-linear-to-r from-[#22D3EE] to-[#0891B2]"
        }
    ];

    return (
        <div className="relative flex flex-col bg-white min-h- items-center w-full py-8 md:py-12 px-4 third-font overflow-hidden">
            {/* Background GIF */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={BackgroundGif} 
                    alt="" 
                    className="w-full h-full object-cover opacity-30"
                />
            </div>

            {/* Content wrapper with z-index */}
            <div className="relative z-10 w-full max-w-6xl">
                {/* Top section */}
                <div className='flex flex-col items-center justify-center gap-4 mb-12'>
                    <span className='bg-[#F3F4F6] py-2 px-5 text-[#151B25] rounded-lg border border-[#E5E7EB] text-base font-medium'>
                        Our Services
                    </span>
                    <h1 className='text-[#080026] font-medium text-2xl md:text-3xl'>Who can use Lancer?</h1>
                    <p className='max-w-2xl text-center text-[#4B5563] text-sm md:text-base leading-relaxed px-4'>
                        It is also for skilled talent or contract professionals who can use the platform to get hired.
                    </p>
                </div>

                {/* Middle Section - Services Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl mx-auto'>
                    {services.map((service, index) => (
                        <div 
                            key={index}
                            className='rounded-2xl p-6 md:p-8 shadow-sm border border-[#D1D5DB] hover:shadow-md transition-shadow duration-300'
                        >
                            <div className='flex items-start gap-4'>
                                <div className={`${service.bgColor} rounded-[10px] p-2 flex-shrink-0`}>
                                    <service.icon size={38} className="text-white" strokeWidth={2} />
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <h3 className='text-[#080026] font-medium text-lg md:text-xl'>
                                        {service.title}
                                    </h3>
                                    <p className='text-[#4B5563] text-sm md:text-base leading-relaxed'>
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LancerBanner;