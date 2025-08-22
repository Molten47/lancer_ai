import React from 'react';
import { ArrowRight, Workflow, Users, Zap, TrendingUp } from 'lucide-react';

const LancerBanner = () => {
    return (
        <div className="flex flex-col basic-font bg-[#Ffffff] min-h-[60vh] justify-center items-center w-full py-8 md:py-12">
            <div className="w-full max-w-[90rem] mx-auto px-4 md:px-8">
                <div className="relative bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 rounded-2xl overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-8 right-20 w-16 h-16 bg-white/20 rounded-lg transform rotate-12"></div>
                        <div className="absolute top-16 right-48 w-12 h-12 bg-white/15 rounded-lg transform -rotate-6"></div>
                        <div className="absolute bottom-20 right-32 w-14 h-14 bg-white/25 rounded-lg transform rotate-45"></div>
                        <div className="absolute top-24 right-80 w-10 h-10 bg-white/10 rounded-lg"></div>
                        <div className="absolute bottom-32 right-60 w-8 h-8 bg-white/20 rounded-lg transform rotate-12"></div>
                        <div className="absolute top-32 right-96 w-12 h-12 bg-white/15 rounded-lg transform -rotate-12"></div>
                    </div>

                    {/* Workflow Diagram on Right */}
                    <div className="absolute right-8 md:right-16 top-1/2 transform -translate-y-1/2 hidden lg:block">
                        <div className="relative">
                            {/* Connected workflow boxes */}
                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <Workflow className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center border-2 border-white/40">
                                        <Zap className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        <ArrowRight className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Connecting lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
                                <path 
                                    d="M50 50 Q100 75 150 50 Q175 75 150 100 Q125 125 100 100 Q75 125 50 100 Q25 75 50 50" 
                                    fill="none" 
                                    stroke="rgba(255,255,255,0.3)" 
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 px-8 md:px-12 py-12 md:py-16 lg:pr-80">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                What is Lancer, and how can it help your business?
                            </h2>
                            <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed">
                                Centralize business setup, hiring, and workflow automation into one AI-powered platform—cutting costs and eliminating overhead so you can scale faster.
                            </p>
                            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
                                <span>Learn more about Lancer</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile workflow icons */}
                    <div className="absolute top-4 right-4 lg:hidden flex space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Workflow className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LancerBanner;