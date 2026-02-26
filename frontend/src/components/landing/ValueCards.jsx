import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { FileText, Eye, ShieldCheck, Route, MessageSquare, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const valueProps = [
  {
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    title: 'File a Complaint Easily',
    description: 'A guided form with location & attachments makes reporting simple.',
  },
  {
    icon: <Eye className="h-8 w-8 text-green-500" />,
    title: 'Transparent Tracking',
    description: "Follow your complaint's status with a live timeline from start to finish.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
    title: 'Priority Handling',
    description: 'High, Medium, and Low priority levels ensure urgent issues get fast attention.',
  },
  {
    icon: <Route className="h-8 w-8 text-purple-500" />,
    title: 'Department Routing',
    description: 'Your complaint is automatically sent to the correct department (Water, Roads, etc.).',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-orange-500" />,
    title: 'Chat & Feedback',
    description: 'Communicate directly with staff for clarifications and rate the resolution.',
  },
  {
    icon: <Lock className="h-8 w-8 text-gray-500" />,
    title: 'Secure & Private',
    description: 'Your personal information and complaint data are kept secure and protected.',
  },
];

const ValueCards = () => {
  return (
    <section className="py-12 md:py-20" id="about">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">A Better Way to Be Heard</h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need for effective complaint resolution.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={index === valueProps.length - 1 && valueProps.length % 2 !== 0 ? 'sm:col-span-2 lg:col-span-1' : ''}
            >
              <Card className="value-card-style hover:scale-105 transition-transform duration-200 h-full">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 mx-auto">
                    {prop.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl">{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                    {prop.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueCards;
