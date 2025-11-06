import React from 'react';
import { Briefcase, Users , Building , TvMinimalPlay} from 'lucide-react';
import BackgroundGif from '../../assets/Images/660b5a75d56565aaff4cb23cbf6417a81bf0fbe6.gif'

const LancerBanner = () => {
    const services = [
        {
            icon: Briefcase,
            title: "Digital Freelancer",
            description: "Custom websites designed to meet your unique business needs, from simple landing pages to complex web applications.",
            bgColor: "bg-linear-to-r from-[#60A5FA] to-[#2563EB]"
        },
        {
            icon: Users,
            title: "Startup Founder",
            description: "Native and cross-platform mobile applications that provide seamless experience across all devices.",
            bgColor: "bg-linear-to-r from-[#818CF8] to-[#4F46E5]"
        },
        {
            icon: Building,
            title: "Corporate Organization",
            description: "Extract valuable data from websites to gain insights and make informed business decisions.",
            bgColor: "bg-linear-to-r from-[#C084FC] to-[#9333EA]"
        },
        {
            icon: TvMinimalPlay,
            title: "Digital Agencies",
            description: "Seamlessly connect your systems with third party services to enhance functionality and streamline operations.",
            bgColor: "bg-linear-to-r from-[#22D3EE] to-[#0891B2]"
        }
    ];

    return (
        <div className="relative flex flex-col bg-white min-h-screen items-center w-full py-8 sm:py-10 md:py-12 lg:py-12 px-4 sm:px-6 md:px-8 third-font overflow-hidden">
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
                <div className='flex flex-col items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12'>
                    <span className='bg-[#F3F4F6] py-2 px-4 sm:px-5 text-[#151B25] rounded-lg border border-[#E5E7EB] text-sm sm:text-base font-medium'>
                        Our Services
                    </span>
                    <h1 className='text-[#080026] font-medium text-xl sm:text-2xl md:text-3xl lg:text-3xl text-center px-4'>
                        Who can use Lancer?
                    </h1>
                    <p className='max-w-2xl text-center text-[#4B5563] text-sm sm:text-base md:text-base leading-relaxed px-4'>
                        It is also for skilled talent or contract professionals who can use the platform to get hired.
                    </p>
                </div>

                {/* Middle Section - Services Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full max-w-5xl mx-auto'>
                    {services.map((service, index) => (
                        <div 
                            key={index}
                            className='rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm border border-[#D1D5DB] hover:shadow-md transition-shadow duration-300 bg-white'
                        >
                            <div className='flex items-start gap-3 sm:gap-4'>
                                <div className={`${service.bgColor} rounded-[10px] p-2 flex-shrink-0`}>
                                    <service.icon size={30} className="text-white sm:w-[38px] sm:h-[38px]" strokeWidth={1} />
                                </div>
                                <div className='flex flex-col gap-2 sm:gap-3'>
                                    <h3 className='text-[#080026] font-medium text-base sm:text-lg md:text-xl'>
                                        {service.title}
                                    </h3>
                                    <p className='text-[#4B5563] text-sm sm:text-sm md:text-base leading-relaxed'>
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