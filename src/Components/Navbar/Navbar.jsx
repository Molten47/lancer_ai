import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/Images/SVG/Flogo2.svg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle scroll to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      // Change this value to match your hero section height
      // Typically around 80vh or adjust based on your design
      const heroHeight = window.innerHeight * 0.8; 
      
      if (window.scrollY > heroHeight) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Main Navbar */}
      <div 
        className={`w-full py-4 md:py-4 lg:py-6 px-3 md:px-6 lg:px-8 top-0 left-0 z-40 third-font fixed transition-all duration-300 shadow-sm ${
          isScrolled 
            ? 'bg-white shadow-md' 
            : 'bg-transparent'
        }`}
      >
        <nav className='flex flex-row justify-between h-full items-center relative '>
          {/* Logo (Left) */}
          <div className='absolute text-cta flex flex-row items-center justify-center'>
            <img src={Logo} className='h-28 md:h-35' alt="" />
          </div>

          {/* Mobile Menu Button - Only visible on small screens */}
          <div className='lg:hidden ml-auto'>
            <button 
              onClick={toggleMenu} 
              className={`p-2 focus:outline-none transition-colors duration-300 ${
                isScrolled ? 'text-gray-800' : 'text-[#151B25]'
              }`}
            >
              {isMenuOpen ? 
                <X className="h-6 w-6" /> : 
                <Menu className="h-6 w-6" />
              }
            </button>
          </div>

          {/* Navigation Options (Center) - Hidden on mobile, shown on large screens */}
          <div className='hidden lg:flex flex-grow justify-center'>
            <ul className={`flex flex-row gap-10 items-center font-semibold text-[16px] transition-colors duration-300 ${
              isScrolled ? 'text-gray-800' : 'text-[#000000]'
            }`}>
              <li 
              
              className='hover:text-[#1447e6] cursor-pointer transition-colors duration-200
              '> <a 
                href='https://forms.gle/BPQ4XXApoRNbRBXR7'
                target="_blank" // Opens in new tab
                rel="noopener noreferrer"
              >Join Waitlist</a></li>
              <li className='hover:text-[#1447e6] cursor-pointer transition-colors duration-200'>Contact Us</li>
              <li className='hover:text-[#1447e6] cursor-pointer transition-colors duration-200'>FAQs</li>
            </ul>
          </div>

          {/* Call to Action (Right) - Hidden on mobile, shown on large screens */}
          <div className='flex flex-row gap-2'>
            <div className='hidden lg:flex justify-end items-center'>
              <Link to='/signup'>
                <button className={`py-2 px-6 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 ${
                  isScrolled 
                    ? 'text-[#2255D7]' 
                    : 'text-[#2255D7] border border-white/30'
                }`}>
                  Sign Up
                </button>
              </Link>
            </div>
            <div className='hidden lg:flex justify-end items-center'>
              <Link to='/login'>
                <button className='py-2 px-6 bg-[#2255D7] rounded-md text-[16px] font-medium text-white hover:bg-[#1447e6] transition-colors duration-300'>
                  Sign in
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu - Dropdown */}
          {isMenuOpen && (
            <div className='lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50'>
              <div className='flex flex-col p-4'>
                <ul className='flex flex-col gap-4 text-gray-800 font-semibold text-lg'>
                  <li>
                    <button 
                      onClick={closeMenu}
                      className='hover:text-[#1447e6] cursor-pointer py-2 w-full text-left transition-colors duration-200'
                    >
                      Join Waitlist
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={closeMenu}
                      className='hover:text-[#1447e6] cursor-pointer py-2 w-full text-left transition-colors duration-200'
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={closeMenu}
                      className='hover:text-[#1447e6] cursor-pointer py-2 w-full text-left transition-colors duration-200'
                    >
                      FAQs
                    </button>
                  </li>
                </ul>

                {/* Mobile CTA */}
                <div className='mt-6 pt-4 border-t border-gray-200'>
                  <Link to='/signup' onClick={closeMenu} className='block w-full mb-3'>
                    <button className='py-3 px-6 rounded-md text-[#2255D7] border border-[#2255D7] w-full transition-colors duration-200 text-base font-semibold'>
                      Sign Up
                    </button>
                  </Link>
                  <Link to='/login' onClick={closeMenu} className='block w-full'>
                    <button className='py-3 px-6 bg-[#2255D7] rounded-md text-white hover:bg-[#1447e6] w-full transition-colors duration-200 text-base font-semibold'>
                      Sign in
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;