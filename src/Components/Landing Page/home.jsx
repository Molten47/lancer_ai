import React, { useRef } from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
import Philosophy from '../Philosophy/Philosophy'
import Unique from '../Unique/Unique'
import Benefits from '../Benefits/Benefits'
import Information from '../Information/information'
import Footer from '../Footer/Footer'

const LandHome = () => {
  // Create ref for the Philosophy section
  const philosophyRef = useRef(null);

  // Function to scroll to the Philosophy section
  const scrollToPhilosophy = () => {
    philosophyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='relative min-h-[80vh] z-0 w-full bg-light'>
      <div className='min-h-full'>
        <Navbar />
        <Hero onExplore={scrollToPhilosophy} />
        <div ref={philosophyRef}>
          <Philosophy />
        </div>
        <Unique />
        <Benefits />
        <Information />
        <Footer />
      </div>
    </div>
  );
};

export default LandHome;