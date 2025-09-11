import React from 'react';
import Logo from '../../assets/Images/PNG/Full Logo Color 4@4x.png'
import { Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-sm bg-[#151B25] text-[#9CA3AF] mt-auto basic-font">
      <div className="container mx-auto px-6 py-0 md:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-16">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-1 items-start">
            <div className="flex items-center mb-2">
              <img src={Logo} alt="Lancer Logo" className="h-18 w-5/6 rounded object-cover object-center" />
            </div>
            <p className="mb-6 leading-relaxed">AI-powered business lifecycle platform that connects businesses with freelancers and automates operations.</p>
           <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Linkedin size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Twitter size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Instagram size={24} />
                </a>
              </div>
          </div>

          {/* Footer Links - Platform */}
          <div className=''>
            <h5 className="text-white font-bold mb-6 tracking-wider">Platform</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors duration-200">How it works</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">FAQ</a></li>
            </ul>
          </div>

          {/* Footer Links - Company */}
          <div>
            <h5 className="text-white font-bold mb-6 tracking-wider">Company</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Press</a></li>
            </ul>
          </div>

          {/* Footer Links - Resources */}
          <div>
            <h5 className="text-white font-bold mb-6 tracking-wider">Resources</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Partners</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Status</a></li>
            </ul>
          </div>

          {/* Footer Links - Legal */}
          <div>
            <h5 className="text-white font-bold mb-8 tracking-wider">Legal</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-[#ffffff] mt-12 pt-8 text-center text-xs">
          © 2025 Lancer. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer