import React from 'react';
import { motion } from 'framer-motion';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';
import WalletConnect from '../wallet/WalletConnect';

const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'upload', label: 'Upload Documents' },
    { id: 'verify', label: 'Verify Documents' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-lg border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <DocumentCheckIcon className="w-8 h-8 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-800">DocVerify</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <WalletConnect />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
