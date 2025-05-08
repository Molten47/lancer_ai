import React from 'react';
import { Link } from 'react-router-dom';
const Navbar = () => {
  return (
    <div className='w-full bg-light py-5 px-8 fixed z-20'>
      <nav className='flex flex-row justify-between items-center'>
        {/* Logo (Left) */}
        <div>
          <h2 className='text-[32px] font-bold text-primary uppercase basic-font'>Lancer</h2>
        </div>

        {/* Navigation Options (Center) */}
        <div className='flex-grow flex justify-center'>
          <ul className='flex flex-row gap-10 items-center basic-font text-primary font-semibold text-[18px] '>
            <li className='hover:text-[#00b5b5]'>Find Work</li>
            <li className='hover:text-[#00b5b5]'>Hire Creatives</li>
            <li className='hover:text-[#00b5b5]'>Why Lancer?</li>
          </ul>
        </div>

        {/* Call to Action (Right) */}
        <div className='flex justify-end items-center'>
            <Link to='/signup'>
            <button className='py-2.5 px-10 bg-cta rounded-lg text-light basic-font hover:bg-[#00b5b5]'> Get Started</button>
            </Link>
        
        </div>
      </nav>
    </div>
  );
};

export default Navbar;