import React, { useState } from 'react';
import { Twitter, Linkedin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle email subscription logic here
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <footer className="bg-primary text-white py-10 sm:py-12 md:py-16 w-full">
      <div className="container max-w-[90%] mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
          
          {/* Brand & Contact Column */}
          <div className="lg:col-span-1">
            <h2 className="text-[28px] sm:text-[32px] font-extrabold basic-font mb-4 sm:mb-6">LANCER</h2>
            <p className="text-white text-medium text-[14px] basic-font mb-6">
              Lancer is where AI meets human creativity. Building your business, simplified.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-cta" />
                <a href="mailto:hello@lancer.com" className="text-white basic-font text-sm hover:text-cta transition-colors">
                  hello@lancer.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-cta" />
                <a href="tel:+1234567890" className="text-white basic-font text-sm hover:text-cta transition-colors">
                  +1 (234) 567-8900
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a href="#" className="bg-cta h-10 w-10 flex justify-center items-center rounded-full hover:bg-opacity-80 transition-all">
                <Linkedin size={18} className="text-white" />
              </a>
              <a href="#" className="bg-cta h-10 w-10 flex justify-center items-center rounded-full hover:bg-opacity-80 transition-all">
                <Twitter size={18} className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="font-extrabold text-cta basic-font text-[1.2rem] mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white basic-font hover:text-cta transition-colors">
                  Career
                </a>
              </li>
              <li>
                <a href="#" className="text-white basic-font hover:text-cta transition-colors">
                  Team
                </a>
              </li>
            </ul>
          </div>

          {/* Email Subscribe */}
          <div className="lg:col-span-1">
            <h3 className="font-extrabold text-cta basic-font text-[1.2rem] mb-6">Stay Updated</h3>
            <p className="text-white basic-font text-sm mb-4">
              Subscribe to get the latest updates from Lancer.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cta transition-colors basic-font"
                />
                <button
                  onClick={handleSubscribe}
                  className="bg-cta hover:bg-opacity-80 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg basic-font whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800 my-6 sm:my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-between items-center gap-4">
          <div className="text-center lg:text-left">
            <p className="text-white basic-font text-xs sm:text-sm">© 2025 LANCER. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
            <a href="#" className="text-white basic-font hover:text-cta transition-colors">Privacy Policy</a>
            <a href="#" className="text-white basic-font hover:text-cta transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;