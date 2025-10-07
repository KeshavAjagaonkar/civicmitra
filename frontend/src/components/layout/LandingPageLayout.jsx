import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import { Button } from '../ui/Button';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

// New Header for Landing Page - consistent with Navbar
const LandingHeader = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <header className="sticky top-0 z-40 glass-navbar">
            <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    CivicMitra
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-6">
                    <a href="#home" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
                    <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
                    <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
                    <a href="#departments" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Departments</a>
                    <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a>
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleDarkMode}
                        className="p-2"
                        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>Login / Register</Button>
                </div>

                {/* Mobile Menu Button */}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass-navbar border-t border-white/20">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {/* Mobile Navigation Links */}
                        <nav className="flex flex-col space-y-2">
                            <a 
                                href="#home" 
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </a>
                            <a 
                                href="#about" 
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About
                            </a>
                            <a 
                                href="#how-it-works" 
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                How It Works
                            </a>
                            <a 
                                href="#departments" 
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Departments
                            </a>
                            <a 
                                href="#faq" 
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                FAQ
                            </a>
                        </nav>

                        {/* Mobile Auth Buttons */}
                        <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start" 
                                onClick={() => { toggleDarkMode(); setIsMobileMenuOpen(false); }}
                            >
                                {isDarkMode ? (
                                    <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
                                ) : (
                                    <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>
                                )}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }}>
                                Login / Register
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};


const LandingPageLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPageLayout;