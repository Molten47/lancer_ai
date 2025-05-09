import React from 'react';
import { Search, Banknote, HandCoins, LightbulbIcon } from 'lucide-react';

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
            title: 'AI-Powered Matching',
            comment: 'AI identifies top talent, saving you time and ensuring a great fit.',
        },
        {
            id: 3,
            icon: <HandCoins className="w-10 h-10 text-dark" />,
            title: 'Cost-Effective Hiring',
            comment: 'Transparent pricing and competitive rates for any project size.',
        },
        {
            id: 4,
            icon: <LightbulbIcon className="w-10 h-10 text-dark" />,
            title: 'Focus on Innovation',
            comment: 'We handle the hiring, so you can focus on your core business.',
        },
    ];

    return (
        <div className="flex flex-col bg-[#Ffffff] min-h-[60vh] justify-center items-center w-full py-12">
        <div className="flex flex-col gap-3 justify-center items-center">
            <span className="bg-cta text-dark py-3 px-6 uppercase font-semibold text-[16px] basic-font rounded-full">
                benefits
            </span>
            <h2 className="font-medium text-[20px] text-dark basic-font">Why Lancer?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 p-8 w-full max-w-[90rem] mx-auto">
            {benefitData.map((benefit) => (
                <div
                    key={benefit.id}
                    className="w-full bg-white rounded-lg border-3 border-[#00d4d4] py-14 px-5 flex flex-col items-start justify-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                    <div className='bg-[#F9FAFB] w-16 h-16 rounded-full flex items-center justify-center mb-6'>
                        {benefit.icon}
                    </div>
                    <h3 className="text-[1.2rem] basic-font font-semibold text-[#1B1B1B] mb-2">{benefit.title}</h3>
                    <p className="text-[#6B7280] basic-font text-[1rem]">{benefit.comment}</p>
                </div>
            ))}
        </div>
    </div>
    );
};

export default Benefits;
