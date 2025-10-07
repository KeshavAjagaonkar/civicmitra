import React from 'react';
import { Pencil, ListChecks, MessageCircle } from 'lucide-react';

const steps = [
  {
    icon: <Pencil className="h-10 w-10 text-blue-500" />,
    title: '1. Submit Your Issue',
    description: 'Use our simple form to detail your complaint, including category, location, and priority.',
  },
  {
    icon: <ListChecks className="h-10 w-10 text-green-500" />,
    title: '2. Track Status',
    description: 'Monitor the progress of your complaint in real-time from your personal dashboard.',
  },
  {
    icon: <MessageCircle className="h-10 w-10 text-orange-500" />,
    title: '3. Get Resolution & Give Feedback',
    description: 'Receive notifications upon resolution and rate your experience to help us improve.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-12 md:py-20 bg-white/30 dark:bg-gray-900/30" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A simple, transparent process.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Step Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-green-300 dark:from-blue-600 dark:to-green-600 transform translate-x-10 z-0"></div>
              )}
              
              {/* Step Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 mx-auto mb-4 md:mb-6 shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
