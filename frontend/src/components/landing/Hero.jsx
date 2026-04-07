import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';

const PHRASES = [
  'File issues in minutes.',
  'Track resolution in real-time.',
  'Hold your city accountable.',
];

function useTypingCycle(phrases, interval = 3000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % phrases.length);
    }, interval);
    return () => clearInterval(timer);
  }, [phrases, interval]);
  return phrases[index];
}

function AnimatedCounter({ to, suffix = '' }) {
  const nodeRef = useRef(null);
  useEffect(() => {
    if (!nodeRef.current) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate(v) {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toLocaleString() + suffix;
      },
    });
    return () => controls.stop();
  }, [to, suffix]);
  return <span ref={nodeRef}>0</span>;
}

const Hero = () => {
  const phrase = useTypingCycle(PHRASES);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/complaints/public-stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const statItems = stats
    ? [
        { label: 'Total Filed', value: stats.total, color: 'text-blue-400' },
        { label: 'In Progress', value: stats.inProgress, color: 'text-amber-400' },
        { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400' },
      ]
    : [
        { label: 'Total Filed', value: 142, color: 'text-blue-400' },
        { label: 'In Progress', value: 38, color: 'text-amber-400' },
        { label: 'Resolved', value: 981, color: 'text-emerald-400' },
      ];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-950" id="home">
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text + CTA */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 mb-6"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Trusted by 10,000+ citizens
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
            >
              Smart Complaint Management{' '}
              <span className="text-blue-600">for Your City</span>
            </motion.h1>

            {/* Cycling phrase */}
            <div className="h-8 mb-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phrase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="text-base sm:text-lg text-blue-600 dark:text-blue-400 font-medium"
                >
                  {phrase}
                </motion.p>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg"
            >
              File civic issues in minutes. Track resolution progress in real-time. Get notified when your complaint is resolved.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto min-w-[160px]">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span>6+ City Departments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>AI-Powered</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Stats Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-gray-400 text-sm font-mono">CivicMitra Dashboard</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {statItems.map((stat) => (
                  <div key={stat.label} className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      <AnimatedCounter to={stat.value} />
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-3">Recent Complaints</p>
                {[
                  { title: 'Pothole on MG Road', status: 'In Progress', dot: 'bg-amber-400' },
                  { title: 'Street light broken', status: 'Submitted', dot: 'bg-blue-400' },
                  { title: 'Water pipe leakage', status: 'Resolved', dot: 'bg-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.dot}`} />
                      <span className="text-gray-300 text-sm">{item.title}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{item.status}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  <span>10,243 citizens served</span>
                </div>
                <div className="h-2 w-16 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-10 bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
