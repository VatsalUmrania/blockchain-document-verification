import React from 'react';
import { motion } from 'framer-motion';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';
import WalletConnect from '../wallet/WalletConnect';

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-lg border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <DocumentCheckIcon className="w-8 h-8 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-800">
              DocVerify
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-6">
              <a href="#dashboard" className="text-gray-600 hover:text-primary-500 font-medium">
                Dashboard
              </a>
              <a href="#upload" className="text-gray-600 hover:text-primary-500 font-medium">
                Upload
              </a>
              <a href="#verify" className="text-gray-600 hover:text-primary-500 font-medium">
                Verify
              </a>
            </nav>
            
            <WalletConnect />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
