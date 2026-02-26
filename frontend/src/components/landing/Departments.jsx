import React from 'react';
import { Droplet, Zap, Trash2, CarIcon, Lightbulb, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

const departments = [
  { name: 'Water', icon: <Droplet className="h-8 w-8" /> },
  { name: 'Electricity', icon: <Zap className="h-8 w-8" /> },
  { name: 'Waste Mgmt', icon: <Trash2 className="h-8 w-8" /> },
  { name: 'Roads', icon: <CarIcon className="h-8 w-8" /> },
  { name: 'Streetlights', icon: <Lightbulb className="h-8 w-8" /> },
  { name: 'Drainage', icon: <Waves className="h-8 w-8" /> },
];

const Departments = () => {
  return (
    <section className="py-12 md:py-20" id="departments">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Covering All Key Departments</h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your complaints are automatically routed to the right department.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 max-w-4xl mx-auto">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col items-center space-y-3 text-gray-600 dark:text-gray-300 group hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-full bg-white dark:bg-gray-700 shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                  {dept.icon}
                </div>
              </div>
              <span className="text-sm md:text-base font-medium text-center leading-tight">
                {dept.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Departments;
