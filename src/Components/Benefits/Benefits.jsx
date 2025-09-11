import React from 'react';
import { ArrowUpRight, Workflow, Users, Zap, TrendingUp, BarChart3, Settings } from 'lucide-react';

const LancerBanner = () => {
    return (
        <div className="flex flex-col bg-white min-h-screen items-center w-full py-8 md:py-12 px-4 basic-font">
           {/* Top section */}
            <div className='flex flex-col items-center justify-center gap-6 mb-12'>
                <span className='bg-[#F3F4F6] py-2 px-5 text-[#151B25] rounded-lg border border-[#E5E7EB] text-base font-medium'>
                    Why Lancer?
                </span>
                <p className='max-w-3xl text-center text-[#4B5563] text-sm leading-relaxed'>
                    Lancer centralizes business setup, hiring, and workflow automation into one AI-powered platform—cutting hiring costs, reducing admin work, and eliminating tool-switching overhead so founders and businesses can scale faster.
                </p>
            </div>

            {/* Middle Section */}
            <div className='w-full max-w-6xl flex flex-col lg:flex-row gap-8 mb-10'>
                {/* Left side - What is BLM */}
               <div className='relative flex-1 bg-[#DBEAFE] border-blue-300 rounded-xl p-8'>
                <h2 className='text-xl font-medium text-primary mb-6'>What is BLM?</h2>
                <p className='text-[#4B5563] mb-8 mt-4 text-justify leading-8 max-w-3xl'>
                  Business Lifecycle Management is a strategic approach to overseeing a Business Journey from inception to eventual Maturity. It involves understanding and proactively managing the distinct phases a business goes through.
                 </p>
                {/* Progress bar with stages */}
             <div className='space-y-4'>
              <div className='flex justify-between text-sm text-[#374151] mb-2'>
               <span className='font-medium'>Startup/Inception</span>
              <span className='font-medium'>Growth</span>
              <span className='font-medium'>Maturity</span>
              <span className='font-medium'>Renewal</span>
            </div>
           <div className='w-full bg-white rounded-full h-2'>
              <div className='bg-primary h-2 rounded-full w-3/4'></div>
           </div>
        </div>
    
         {/* Bottom-right decorative circle */}
        <div className='absolute -bottom-4 -right-5 w-16 h-16 bg-[#BFDBFE] rounded-full '></div>
    </div>

                {/* Right side - How BLM Helps */}
                <div className='flex-1 bg-[#F9FAFB] border-none rounded-xl p-8 shadow-sm'>
                    <h2 className='text-xl font-medium text-primary mb-8'>How BLM Helps Your Business</h2>
                    <div className='flex flex-col gap-3'>
                    <div className='flex items-start gap-4 mb-6 my-6'>
                        <div className='bg-blue-100 p-3 rounded-full'>
                            <TrendingUp className='w-5 h-5 text-light' />
                        </div>
                        <div>
                            <h3 className='font-medium text-primary mb-2'>Strategic Planning</h3>
                            <p className='text-[#4B5563] text-sm font-normal'>Proactive business management based on your current lifecycle stage</p>
                        </div>
                    </div>

                    <div className='flex items-start gap-4 mb-6'>
                        <div className='bg-blue-100 p-3 rounded-full'>
                            <BarChart3 className='w-5 h-5 text-light' />
                        </div>
                        <div>
                            <h3 className='font-medium text-primary mb-2'>Optimizing Resources</h3>
                            <p className='text-[#4B5563] text-sm font-normal'>Allocate resources efficiently based on your business needs</p>
                        </div>
                    </div>

                    <div className='flex items-start gap-4 mb-6'>
                        <div className='bg-blue-100 p-3 rounded-full'>
                            <Users className='w-5 h-5 text-light' />
                        </div>
                        <div>
                            <h3 className='font-medium text-primary mb-2'>Team Management</h3>
                            <p className='text-[#4B5563] text-sm font-normal'>Build and manage the right team for your current business stage</p>
                        </div>
                    </div>

                    <div className='flex items-start gap-4'>
                        <div className='bg-blue-100 p-3 rounded-full'>
                            <Settings className='w-5 h-5 text-light' />
                        </div>
                        <div>
                            <h3 className='font-medium text-primary mb-2'>Project Optimization</h3>
                            <p className='text-[#4B5563] text-sm font-normal'>Streamline workflows and automate processes for maximum efficiency</p>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Call to Action */}
            <div className='w-full max-w-6xl h-4/5 bg-gradient-to-r from-[#2255D7] to-[#2255d7] rounded-2xl p-8 text-white relative overflow-hidden'>
             
                
                <div className='flex flex-col lg:flex-row items-start justify-between gap-8'>
                    <div className='flex-1'>
                        <h2 className='text-xl leading-8 font-semibold mb-6'>Unlock Your Business Potential</h2>
                        <p className='text-white text-sm tracking-wide mb-6 mt-6 max-w-md'>
                            Applying Business lifecycle management provides your business with a significant advantage, allowing you to be proactive rather than reactive.
                        </p>
                        <button className='bg-white text-light px-6 py-3 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors'>
                            Learn More About BLM
                        </button>
                    </div>
                    
                    <div className='flex-1 px-4 py-4 lg:px bg-white/10 bg-opacity-35 rounded-lg '>
                    <div className='absolute top-4 right-140'>
                    <div className='w-12 h-12 bg-[#93C5FD] bg-opacity-20 rounded-full'></div>
                        </div>
                        <div className='flex items-center gap-2 z-30 mb-4'>
                            <TrendingUp className='w-5 h-5' />
                            <span className='font-semibold'>Business Growth Metrics</span>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <div className='flex justify-between mb-2'>
                                    <span>Efficiency</span>
                                    <span>85%</span>
                                </div>
                                <div className='w-full bg-blue-500 bg-opacity-30 rounded-full h-2'>
                                    <div className='bg-white h-2 rounded-full w-[85%]'></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className='flex justify-between mb-2'>
                                    <span>Team Productivity</span>
                                    <span>78%</span>
                                </div>
                                <div className='w-full bg-blue-500 bg-opacity-30 rounded-full h-2'>
                                    <div className='bg-white h-2 rounded-full w-[78%]'></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className='flex justify-between mb-2'>
                                    <span>Resource Utilization</span>
                                    <span>92%</span>
                                </div>
                                <div className='w-full bg-blue-500 bg-opacity-30 rounded-full h-2'>
                                    <div className='bg-white h-2 rounded-full w-[92%]'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Link */}
            <div className='mt-8'>
                <a href="#" className='text-blue-600 font-medium flex items-center gap-2 hover:gap-3 transition-all'>
                    Learn more about Business Lifecycle Management
                    <ArrowUpRight className='w-4 h-4' />
                </a>
            </div>
        </div>
    );
};

export default LancerBanner;