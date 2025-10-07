import React from 'react';
import Hero from '../components/landing/Hero';
import ValueCards from '../components/landing/ValueCards';
import HowItWorks from '../components/landing/HowItWorks';
import Departments from '../components/landing/Departments';
import FAQ from '../components/landing/FAQ';

const LandingPage = () => {
  return (
    <div>
      <Hero />
      <ValueCards />
      <HowItWorks />
      <Departments />
      <FAQ />
    </div>
  );
};

export default LandingPage;