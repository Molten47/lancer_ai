import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Building, PaletteIcon, ArrowUpRight } from 'lucide-react';
import Frame1 from '../../assets/Images/6@3x 1.png';
import Frame2 from '../../assets/Images/5@3x 1.png';
import Frame3 from '../../assets/Images/4@3x 1.png';

const Unique = () => {


  return (
    <main className="bg-white h-[380vh] third-font items-center justify-center flex flex-col py-16 px-4 ">
      {/* Top section */}
      <div className='flex flex-col items-center justify-center gap-6 mb-12'>
        <span className='bg-[#F3F4F6]  p-2.5 text-[#080026] rounded-[5px] border border-[#E5E7EB] text-base font-normal'>
          How it works!
        </span>
        <p className='max-w-3xl text-center text-[#080026] font-medium text-2xl leading-relaxed'>
        Let's get started
        </p>
      </div>
      {/*Project Setup ......*/}
      <section className='flex flex-col justify-center items-center text-center gap-4 py-5'>
        {/*The header texts */}
        <div className='gap-6 flex flex-col'>
        <h2 className='font-semibold text-4xl'>Setup your project</h2>
        <p className='font-normal text-xl max-w-xl'>Create a Project workspace with an assistant that ideate, researches and plans with you.</p>
        </div> 
        {/*Call to action buttons */}
        <div className='flex flex-row gap-4'>
          <button className='bg-[#2255D2] text-white py-2.5 transition font-medium text-[16px] delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 px-5 gap-2.5 rounded-4xl'>Get started</button>
          <button className='border-[#2255D2] border-3 text-[#2255d2] font-medium text-[16px] py-2.5 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 px-5 gap-2.5 rounded-4xl'>Learn More</button>
        </div>
        {/*Demo-image */}
        <div className='flex items-center justify-center'>
          <img 
          loading='lazy'
          src={Frame1} alt="" />

        </div>
      </section>
        {/*Onboarding ...... */}
      <section className='flex flex-col justify-center items-center text-center gap-4 py-5 '>
        {/*The header texts */}
        <div className='gap-4 flex flex-col'>
        <h2 className='font-semibold text-4xl max-w-xl'>Build a new team or Onboard an existing one</h2>
        <p className='font-normal text-xl max-w-2xl'>For every Project, a dedicated Project manager agent can onboard an existing team or set up an interview process to hire from our in-house talent pool</p>
        </div> 
        {/*Call to action buttons */}
        <motion.div 
          className='flex flex-row gap-4'
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <button className='bg-[#2255D2] text-white py-2.5 transition font-medium text-[16px] delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 px-5 gap-2.5 rounded-4xl'>Get started</button>
          <button className='border-[#2255D2] border-3 text-[#2255d2] font-medium text-[16px] py-2.5 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 px-5 gap-2.5 rounded-4xl'>Learn More</button>
        </motion.div>
        {/*Demo-image */}
        <motion.div 
          className='flex items-center justify-center'
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img 
          loading='lazy'
          src={Frame2} alt="" />
        </motion.div>
      </section>
     {/*Manage Project...... */}
      <section className='flex flex-col justify-center items-center text-center gap-4 py-9'>
        {/*The header texts */}
        <div className='gap-6 flex flex-col text-center'>
        <h2 className='font-semibold text-4xl'>Manage Project</h2>
        <p className='font-normal text-xl '>Our AI integrated workflow management system:</p>
        
        {/* Feature list */}
        <ul className='text-center text-lg max-w-3xl space-y-3 mx-auto'>
          <li>-Handles vertical coordination and horizontal collaboration between Employers, Teams and individual employees.</li>
          <li>-Tracks important stats like overall Project progress, Team level performance data & individual productivity metrics.</li>
          <li>-Boosts employee productivity with Job assistant Agents.</li>
        </ul>
        </div> 
        {/*Call to action buttons */}
        <motion.div 
          className='flex flex-row gap-4'
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <button className='bg-[#2255D2] text-white py-2.5 transition font-medium text-[16px] delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 px-5 gap-2.5 rounded-4xl'>Get Started</button>
          <button className='border-[#2255D2] border-3 text-[#2255d2] font-medium text-[16px] py-2.5 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 px-5 gap-2.5 rounded-4xl'>Learn More</button>
        </motion.div>
        {/*Demo-image */}
        <motion.div 
          className='flex items-center justify-center'
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img src={Frame3} 
          loading='lazy'
          className="object-cover" alt="" />
        </motion.div>
      </section>
    
    </main>
  );
};

export default Unique;