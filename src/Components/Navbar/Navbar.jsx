import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import {Link} from 'react-router-dom'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className='w-full bg-light py-3 md:py-4 lg:py-5 px-4 md:px-6 lg:px-8 fixed z-30 shadow-sm'>
      <nav className='flex flex-row justify-between items-center'>
        {/* Logo (Left) */}
        <div>
          <h2 className='text-2xl md:text-[28px] lg:text-[32px] font-bold text-primary uppercase basic-font'>Lancer</h2>
        </div>

        {/* Mobile Menu Button - Only visible on small screens */}
        <div className='lg:hidden'>
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
          <ul className='flex flex-row gap-10 items-center basic-font text-primary font-semibold text-[18px]'>
            <li className='hover:text-[#00b5b5] cursor-pointer'>Find Work</li>
            <li className='hover:text-[#00b5b5] cursor-pointer'>Hire Creatives</li>
            <li className='hover:text-[#00b5b5] cursor-pointer'>Why Lancer?</li>
          </ul>
        </div>

        {/* Call to Action (Right) - Hidden on mobile, shown on large screens */}
        <div className='hidden lg:flex justify-end items-center'>
          <Link to='/signup'>
            <button className='py-2.5 px-10 bg-cta rounded-lg text-light basic-font hover:bg-[#00b5b5]'>Get Started</button>
          </Link>
        </div>

        {/* Mobile Menu - Full screen overlay, only shown when menu is open */}
        {isMenuOpen && (
          <div className='lg:hidden fixed inset-0 top-[60px] bg-light z-50 flex flex-col p-5'>
            <ul className='flex flex-col gap-6 items-center basic-font text-primary font-semibold text-xl mt-10'>
              <li className='hover:text-[#00b5b5] cursor-pointer py-2'>Find Work</li>
              <li className='hover:text-[#00b5b5] cursor-pointer py-2'>Hire Creatives</li>
              <li className='hover:text-[#00b5b5] cursor-pointer py-2'>Why Lancer?</li>
              <li className='mt-6 w-full'>
                <Link to='/signup' className='block w-full'>
                  <button className='py-3 px-10 bg-cta rounded-lg text-light basic-font hover:bg-[#00b5b5] w-full'>
                    Get Started
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;