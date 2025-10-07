import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-card rounded-none border-t-0">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-wrap justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h3 className="font-bold text-lg text-blue-600 mb-2">CivicMitra</h3>
            <p>Smart Complaint Management for Your City.</p>
          </div>
          <div className="w-full md:w-2/3 flex flex-wrap">
            <div className="w-1/2 md:w-1/4 mb-4 md:mb-0">
              <h4 className="font-semibold mb-2">Company</h4>
              <ul>
                <li><Link to="#" className="hover:underline">About</Link></li>
                <li><Link to="#" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
            <div className="w-1/2 md:w-1/4 mb-4 md:mb-0">
              <h4 className="font-semibold mb-2">Legal</h4>
              <ul>
                <li><Link to="#" className="hover:underline">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:underline">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div className="w-1/2 md:w-1/4 mb-4 md:mb-0">
              <h4 className="font-semibold mb-2">Support</h4>
              <ul>
                <li><Link to="#" className="hover:underline">Help Center</Link></li>
                <li><Link to="#" className="hover:underline">Accessibility</Link></li>
              </ul>
            </div>
            <div className="w-1/2 md:w-1/4 mb-4 md:mb-0">
                <h4 className="font-semibold mb-2">Language</h4>
                {/* Placeholder for language switcher */}
                <p>English</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CivicMitra. All rights reserved.</p>
          <p className="mt-2">
            <strong>Disclaimer:</strong> CivicMitra is a platform to submit and track municipal complaints. Emergency issues? Call your local helpline.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;