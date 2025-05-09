import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8 sm:py-12 md:py-16 w-full">
      <div className="container max-w-[90%] mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h2 className="text-[28px] sm:text-[32px] font-extrabold basic-font mb-4 sm:mb-6">LANCER</h2>
            <p className="text-white text-medium text-[12px] basic-font mb-4 sm:mb-6">
              Lancer is where AI meets human creativity. Whether you're building your first product or scaling a global campaign.
            </p>
            <div className="flex flex-col space-x-4">
                <h2 className='text-white basic-font font-extrabold'>Social Links</h2>
                <div className='flex flex-row gap-3 sm:gap-4 mt-3 sm:mt-4'>
                    <div className='bg-cta h-8 w-8 p-4 sm:p-5 flex justify-center items-center rounded-full'>
                    <a href="#" className="text-white hover:text-white transition-colors">
                      <Facebook size={18} />
                    </a>
                   </div>
                    <div className='bg-cta h-8 w-8 p-4 sm:p-5 flex justify-center items-center rounded-full'>
                    <a href="#" className="text-white hover:text-white transition-colors">
                        <Twitter size={18} />
                      </a>
                    </div>
                
                    <div className='bg-cta h-8 w-8 p-4 sm:p-5 flex justify-center items-center rounded-full'>
                      <a href="#" className="text-white hover:text-white transition-colors">
                        <Instagram size={18} />
                      </a>
                    </div>
                  
                    <div className='bg-cta h-8 w-8 p-4 sm:p-5 flex justify-center items-center rounded-full'>
                      <a href="#" className="text-white hover:text-white transition-colors">
                        <Linkedin size={18} />
                      </a>
                    </div>
                </div>
            </div>
          </div>

          {/* For Clients */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-extrabold text-cta basic-font text-[1rem] sm:text-[1.2rem] mb-4 sm:mb-8">For Clients</h3>
            <ul className="space-y-1">
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">How to Hire</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Talent Marketplace</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Hire an Agency</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Direct Contracts</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Enterprises</a></li>
            </ul>
          </div>

          {/* For Creatives */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-extrabold text-cta basic-font text-[1rem] sm:text-[1.2rem] mb-4 sm:mb-8">For Creatives</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">How to Find Work</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Resources</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Help & Support</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Business Structure</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-extrabold text-cta basic-font text-[1rem] sm:text-[1.2rem] mb-4 sm:mb-8">Resources</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Blogs</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Community</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">How we Work</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Free Business Tools</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-extrabold text-cta basic-font text-[1rem] sm:text-[1.2rem] mb-4 sm:mb-8">Company</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">About Us</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Leadership</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Careers</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Press</a></li>
              <li><a href="#" className="text-white basic-font text-medium hover:text-[#cccccc] transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800 my-6 sm:my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-white basic-font text-xs sm:text-sm">© 2025 LANCER. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:space-x-4 text-xs sm:text-sm">
            <a href="#" className="text-white basic-font hover:text-white transition-colors mb-2">Privacy Policy</a>
            <a href="#" className="text-white basic-font hover:text-white transition-colors mb-2">Terms of Service</a>
            <a href="#" className="text-white basic-font hover:text-white transition-colors mb-2">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;