import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  WalletIcon,
  LinkIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  DocumentPlusIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  // Navigation items with proper paths and icons
  const navigationItems = [
    { name: 'Home', path: '/', icon: ChartBarIcon },
    { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
    { name: 'Upload Documents', path: '/upload', icon: CloudArrowUpIcon },
    { name: 'Verify Documents', path: '/verify', icon: ShieldCheckIcon },
    { name: 'Issue Documents', path: '/issue-document', icon: DocumentPlusIcon },
    { name: 'Third-Party Verify', path: '/third-party-verify', icon: BuildingOfficeIcon },
    { name: 'QR Scanner', path: '/qr-scanner', icon: QrCodeIcon },
  ];

  // Function to check if current path matches nav item
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A] border-b border-[#333333] shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-r from-[#296CFF] to-[#2979FF] rounded-lg shadow-lg shadow-[#296CFF]/30 group-hover:shadow-[#296CFF]/50 transition-all duration-300">
                <CubeTransparentIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#296CFF] to-[#2979FF] bg-clip-text text-transparent">
                  DocVerify
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${isActivePath(item.path)
                      ? 'bg-[#296CFF] text-white shadow-lg shadow-[#296CFF]/30 border border-[#2979FF]'
                      : 'text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A] border border-transparent hover:border-[#333333]'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2 text-xs text-[#999999]">
                    <LinkIcon className="w-3 h-3 text-[#00C853]" />
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm bg-[#001A4D] text-[#296CFF] px-2 py-1 rounded border border-[#296CFF] font-mono">
                    <WalletIcon className="w-3 h-3" />
                    <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-sm px-3 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#E0E0E0] hover:text-white border border-[#333333] hover:border-[#FF4C4C] rounded-lg transition-all duration-300 flex items-center space-x-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
              >
                <WalletIcon className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] border border-[#333333] hover:border-[#296CFF] transition-all duration-300"
              >
                {isOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-[#121212] border-t border-[#333333] shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 flex items-center space-x-3 ${isActivePath(item.path)
                    ? 'bg-[#296CFF] text-white shadow-lg shadow-[#296CFF]/30 border border-[#2979FF]'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A] border border-transparent hover:border-[#333333]'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Wallet Connection */}
            <div className="pt-2 border-t border-[#333333]">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm">
                    <div className="flex items-center space-x-2 text-[#999999] mb-1">
                      <LinkIcon className="w-3 h-3 text-[#00C853]" />
                      <span>Wallet Connected</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#296CFF] font-mono text-sm bg-[#001A4D] px-2 py-1 rounded border border-[#296CFF]">
                      <WalletIcon className="w-3 h-3" />
                      <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#E0E0E0] hover:text-white border border-[#333333] hover:border-[#FF4C4C] rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-[#296CFF] hover:bg-[#2979FF] text-white font-semibold rounded-lg shadow-lg shadow-[#296CFF]/30 hover:shadow-[#296CFF]/50 transition-all duration-300 flex items-center space-x-2"
                >
                  <WalletIcon className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
