import React from 'react';
import { Search, Banknote, HandCoins, Lightbulb } from 'lucide-react';

const Benefits = () => {
    const benefitData = [
        {
            id: 1,
            icon: <Search className="w-8 h-8 text-dark" />,
            title: 'Find Talent Faster',
            comment: 'Clients who want results fast without sorting through endless proposals',
        },
        {
            id: 2,
            icon: <Banknote className="w-10 h-10 text-dark " />,
            title: 'Save on Hiring Cost',
            comment: ' Freelancers who wants excellence in the highest ethical standards and transparency',
        },
        {
            id: 3,
            icon: <HandCoins className="w-10 h-10 text-dark" />,
            title: 'Get Quality Work Delivered',
            comment: ' Teams who wants to scale projects effortlessly with reliable verified talents',
        },
        {
            id: 4,
            icon: <Lightbulb className="w-10 h-10 text-dark" />,
            title: 'Focus on Your Ideas', 
          
            comment: '  We handle the details so we can build what matters initiatives',
        },
    ];

    return (
        <div className="flex flex-col bg-[#Ffffff] min-h-[60vh] justify-center items-center w-full py-8 md:py-12">
        <div className="flex flex-col gap-3 justify-center items-center px-4 md:px-0">
            <span className="bg-cta text-dark py-2 md:py-3 px-4 md:px-6 uppercase font-semibold text-[14px] md:text-[16px] basic-font rounded-full">
                benefits
            </span>
            <h2 className="font-medium text-[18px] md:text-[20px] text-dark basic-font">Why Lancer?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mt-6 p-4 md:p-8 w-full max-w-[90rem] mx-auto">
            {benefitData.map((benefit) => (
                <div
                    key={benefit.id}
                    className="w-full bg-white rounded-lg border-3 border-[#00d4d4] py-8 md:py-12 px-4 md:px-5 flex flex-col items-start justify-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                    <div className='bg-[#F9FAFB] w-14 md:w-16 h-14 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6'>
                        {benefit.icon}
                    </div>
                    <h3 className="text-[1.1rem] md:text-[1.2rem] basic-font font-semibold text-[#1B1B1B] mb-2">{benefit.title}</h3>
                    <p className="text-[#6B7280] basic-font text-[0.9rem] md:text-[1rem]">{benefit.comment}</p>
                </div>
            ))}
        </div>
    </div>
    );
};

export default Benefits;