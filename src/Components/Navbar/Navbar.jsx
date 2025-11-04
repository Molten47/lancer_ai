import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/Images/SVG/Flogo2.svg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Main Navbar */}
      <div className='w-full bg-white py-4 md:py-4 lg:py-6 px-3 md:px-6 lg:px-8  top-0 left-0 z-40 shadow-sm third-font fixed'>
        <nav className='flex flex-row justify-between h-full items-center relative'>
          {/* Logo (Left) */}
          <div className='absolute text-cta flex flex-row items-center justify-center'>
            <img src={Logo} className=' h-28 md:h-35' alt="" />
          </div>

          {/* Mobile Menu Button - Only visible on small screens */}
          <div className='lg:hidden ml-auto'>
            <button 
              onClick={toggleMenu} 
              className='text-primary p-2 focus:outline-none'
            >
              {isMenuOpen ? 
                <X className="h-6 w-6" /> : 
                <Menu className="h-6 w-6" />
              }
            </button>
          </div>

          {/* Navigation Options (Center) - Hidden on mobile, shown on large screens */}
          <div className='hidden lg:flex flex-grow justify-center'>
            <ul className='flex flex-row gap-10 items-center text-dark font-semibold text-[16px]'>
              <li className='hover:text-[#1447e6] cursor-pointer'>Join Waitlist</li>
              <li className='hover:text-[#1447e6] cursor-pointer'>Contact Us</li>
              <li className='hover:text-[#1447e6] cursor-pointer'>FAQs</li>
            </ul>
          </div>

          {/* Call to Action (Right) - Hidden on mobile, shown on large screens */}
          <div className='flex fl-row gap-2'>
           <div className='hidden lg:flex justify-end items-center'>
            <Link to='/signup'>
              <button className='py-2 px-6 bg-light rounded-md text-[#2563EB] transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50'>Sign Up</button>
            </Link>
            </div>
            <div className='hidden lg:flex justify-end items-center'>
            <Link to='/'>
              <button className='py-2 px-6 bg-[#2563EB] rounded-md text-[16px] font-medium text-white hover:bg-[#1447e6]'>See Demo</button>
            </Link>
          </div>
          </div>
       

          {/* Mobile Menu - Dropdown */}
          {isMenuOpen && (
            <div className='lg:hidden absolute top-full left-0 w-full bg-light shadow-lg border-t border-gray-200 z-50'>
              <div className='flex flex-col p-4'>
                <ul className='flex flex-col gap-4 text-primary font-semibold text-lg'>
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
                      Start a Project
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={closeMenu}
                      className='hover:text-[#1447e6] cursor-pointer py-2 w-full text-left transition-colors duration-200'
                    >
                      Why Lancer?
                    </button>
                  </li>
                </ul>

                {/* Mobile CTA */}
                <div className='mt-6 pt-4 border-t border-gray-200'>
                  <Link to='/signup' onClick={closeMenu} className='block w-full'>
                    <button className='py-3 px-6 bg-cta rounded-lg text-white hover:bg-[#3163e0] w-full transition-colors duration-200 text-base font-semibold'>
                      Become a Lancer
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