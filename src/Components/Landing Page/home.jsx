import React, { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../Navbar/Navbar';
import Hero from '../Hero/Hero';
import Philosophy from '../Philosophy/Philosophy';
import Unique from '../Unique/Unique';
import Benefits from '../Benefits/Benefits';
import Information from '../Information/information';
import Footer from '../Footer/Footer';
import FAQs from '../FAQs/FAQs';


const LandHome = () => {
  const philosophyRef = useRef(null);

  const scrollToPhilosophy = () => {
    philosophyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[80vh] z-0 w-full bg-light">
      {/* ✅ SEO tags */}
      <Helmet>
        <title>Lancer | Build Your Team, Get Things Done</title>
        <meta
          name="description"
          content="Automate business operations with AI. Connect founders with skilled freelancers. Lancer powers your business growth with GenAI automation and talent matching."
        />
        <meta property="og:title" content="Lancer | Build Your Team, Get Things Done" />
        <meta
          property="og:description"
          content="Automate business operations with AI. Connect founders with skilled freelancers. Lancer powers your business growth with GenAI automation and talent matching."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lancer.work/" />
        <meta property="og:image" content="https://lancer.work/" />
      </Helmet>

      <div className="min-h-full">
        <Navbar />
        <Hero onExplore={scrollToPhilosophy} />
        <div ref={philosophyRef}>
          <Philosophy />
        </div>
        <Unique />
        <Benefits />
        <FAQs />
        <Information />
        <Footer />
      </div>
    </div>
  );
};

export default LandHome;
