import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  QrCodeIcon,
  HomeIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(shouldUseDark);
    applyTheme(shouldUseDark);
  }, []);

  // Apply theme to document
  const applyTheme = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    applyTheme(newTheme);
  };

  // Navigation items with proper paths and icons
  const navigationItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
    { name: 'Upload', path: '/upload', icon: CloudArrowUpIcon },
    { name: 'Verify', path: '/verify', icon: ShieldCheckIcon },
    { name: 'Issue Docs', path: '/issue-document', icon: DocumentPlusIcon },
    { name: 'Third-Party', path: '/third-party-verify', icon: BuildingOfficeIcon },
    { name: 'QR Scanner', path: '/qr-scanner', icon: QrCodeIcon },
  ];

  // Function to check if current path matches nav item
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="header fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-lg">
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-16 min-w-0">
            
            {/* Logo - Fixed width */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="p-2 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-hover))] rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CubeTransparentIcon className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-hover))] bg-clip-text text-transparent whitespace-nowrap">
                    DocVerify
                  </h1>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Flexible width with scroll */}
            <div className="hidden lg:flex flex-1 justify-center mx-4 min-w-0">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group px-2 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-all duration-300 flex items-center space-x-1 xl:space-x-2 whitespace-nowrap flex-shrink-0 border ${
                        isActivePath(item.path)
                          ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg border-[rgb(var(--color-primary-hover))]'
                          : 'nav-link hover:bg-[rgb(var(--surface-hover))] border-transparent hover:border-[rgb(var(--border-secondary))]'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden xl:block">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side controls - Fixed width */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Theme Toggle Button */}         
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full transition-all duration-300 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--surface-hover))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: isDarkMode ? 0 : 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {isDarkMode ? (
                    <SunIcon className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <MoonIcon className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </motion.div>
              </button>
              {/* Wallet Connection - Desktop */}
              {isConnected ? (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded-lg font-mono blockchain-address">
                    <div className="w-2 h-2 bg-[rgb(var(--color-success))] rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="truncate max-w-[80px]">{formatAddress(account)}</span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs px-2 py-1 rounded-lg transition-all duration-300 flex items-center space-x-1 bg-[rgb(var(--surface-primary))] hover:bg-[rgb(var(--surface-hover))] border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-error))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--color-error))]"
                  >
                    <XMarkIcon className="w-3 h-3" />
                    <span className="hidden xl:block">Disconnect</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="btn-primary hidden md:flex text-xs px-3 py-2 items-center space-x-1"
                >
                  <WalletIcon className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              )}

              {/* Mobile connection indicator */}
              {isConnected && (
                <div className="md:hidden flex items-center">
                  <div className="w-2 h-2 bg-[rgb(var(--color-success))] rounded-full animate-pulse"></div>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 border bg-[rgb(var(--surface-primary))] hover:bg-[rgb(var(--surface-hover))] border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                aria-label="Toggle menu"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? (
                    <XMarkIcon className="block h-5 w-5" />
                  ) : (
                    <Bars3Icon className="block h-5 w-5" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-[rgb(var(--surface-secondary))] border-t border-[rgb(var(--border-primary))] shadow-lg overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Navigation Items */}
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center space-x-3 border ${
                          isActivePath(item.path)
                            ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg border-[rgb(var(--color-primary-hover))]'
                            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-hover))] border-transparent hover:border-[rgb(var(--border-secondary))]'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Theme Toggle for Mobile */}
                <div className="pt-2 border-t border-[rgb(var(--border-primary))]">
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-hover))] border border-transparent hover:border-[rgb(var(--border-secondary))]"
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isDarkMode ? 0 : 180 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {isDarkMode ? (
                        <SunIcon className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <MoonIcon className="w-5 h-5 flex-shrink-0" />
                      )}
                    </motion.div>
                    <span>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</span>
                  </button>
                </div>

                {/* Mobile Wallet Connection */}
                <div className="pt-2 border-t border-[rgb(var(--border-primary))] space-y-3">
                  {isConnected ? (
                    <>
                      <div className="px-4 py-2 text-sm">
                        <div className="flex items-center space-x-2 text-[rgb(var(--color-success))] mb-2">
                          <div className="w-2 h-2 bg-[rgb(var(--color-success))] rounded-full animate-pulse"></div>
                          <span>Wallet Connected</span>
                        </div>
                        <div className="blockchain-address flex items-center space-x-2 font-mono text-sm px-3 py-2">
                          <WalletIcon className="w-4 h-4" />
                          <span>{formatAddress(account)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 bg-[rgb(var(--surface-primary))] hover:bg-[rgb(var(--surface-hover))] border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-error))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--color-error))]"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        <span>Disconnect Wallet</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        connectWallet();
                        setIsOpen(false);
                      }}
                      className="btn-primary w-full text-left px-4 py-3 flex items-center space-x-2"
                    >
                      <WalletIcon className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Navbar;
