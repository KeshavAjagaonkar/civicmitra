import React from 'react';
import { Button } from '../ui/Button';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {

  return (
    <section className="relative overflow-hidden" id="home">
      {/* Hero Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 text-center relative z-10">
        {/* Main Heading */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-4 leading-tight">
            CivicMitra — Smart Complaint Management for Your City
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            File issues in minutes. Track progress. Get notified.
          </p>
        </div>

        {/* CTA Buttons -> Navigate to /auth */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto min-w-[160px]">
              Get Started
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]">
              Login / Register
            </Button>
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-12 md:mt-16">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Trusted by thousands of citizens</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-500" />
              <span>6+ Departments</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-green-500" />
              <span>Real-time Tracking</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-orange-500" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;