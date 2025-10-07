import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/Accordion';

const faqs = [
  {
    question: 'Who can register?',
    answer: 'Currently, only citizens can register through the public portal. Staff, worker, and admin accounts are created by the system administrator.',
  },
  {
    question: 'How long does resolution take?',
    answer: 'Resolution time depends on the priority of the complaint and the workload of the concerned department. You can track the expected timeline on your complaint details page.',
  },
  {
    question: 'How do I track my complaint?',
    answer: 'Once you log in, you can go to your Dashboard and find all your complaints listed under the "My Complaints" section. Clicking on a complaint will show you its detailed status and timeline.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take data security very seriously. All your personal information and complaint details are stored securely. Please see our Privacy Policy for more information.',
  },
];

const FAQ = () => {
  return (
    <section className="py-12 md:py-20 bg-white/30 dark:bg-gray-900/30" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get answers to common questions about CivicMitra.
          </p>
        </div>
        <div className="glass-card p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                value={`item-${index}`} 
                key={index}
                className="border border-white/20 rounded-lg px-4 bg-white/10 dark:bg-gray-800/10"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 text-sm md:text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 pb-4 text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
