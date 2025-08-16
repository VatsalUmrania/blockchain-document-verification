// // import React from 'react';
// // import { motion } from 'framer-motion';
// // import { DocumentCheckIcon } from '@heroicons/react/24/outline';
// // import WalletConnect from '../wallet/WalletConnect';

// // const Navbar = ({ activeTab, setActiveTab }) => {
// //   const tabs = [
// //     { id: 'dashboard', label: 'Dashboard' },
// //     { id: 'upload', label: 'Upload Documents' },
// //     { id: 'verify', label: 'Verify Documents' },
// //     { id: 'analytics', label: 'Analytics' },
// //   ];

// //   return (
// //     <motion.nav
// //       initial={{ opacity: 0, y: -20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       className="bg-white shadow-lg border-b border-gray-200"
// //     >
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         <div className="flex justify-between items-center h-16">
// //           {/* Logo Section */}
// //           <div className="flex items-center space-x-3">
// //             <DocumentCheckIcon className="w-8 h-8 text-primary-500" />
// //             <h1 className="text-xl font-bold text-gray-800">DocVerify</h1>
// //           </div>

// //           {/* Tab Navigation */}
// //           <div className="flex items-center space-x-6">
// //             <nav className="hidden md:flex space-x-6">
// //               {tabs.map((tab) => (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`text-sm font-medium transition-colors duration-200 ${
// //                     activeTab === tab.id
// //                       ? 'text-blue-600 border-b-2 border-blue-500'
// //                       : 'text-gray-600 hover:text-primary-500'
// //                   }`}
// //                 >
// //                   {tab.label}
// //                 </button>
// //               ))}
// //             </nav>

// //             <WalletConnect />
// //           </div>
// //         </div>
// //       </div>
// //     </motion.nav>
// //   );
// // };

// // export default Navbar;


// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   DocumentCheckIcon,
//   HomeIcon,
//   CloudArrowUpIcon,
//   ShieldCheckIcon,
//   ChartBarIcon,
//   Bars3Icon,
//   XMarkIcon
// } from '@heroicons/react/24/outline';
// import WalletConnect from '../wallet/WalletConnect';

// const Navbar = ({ activeTab, setActiveTab }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const tabs = [
//     { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
//     { id: 'upload', label: 'Upload Documents', icon: CloudArrowUpIcon },
//     { id: 'verify', label: 'Verify Documents', icon: ShieldCheckIcon },
//     { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
//   ];

//   return (
//     <motion.nav
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="header bg-surface/95 backdrop-blur-md shadow-lg border-b border-primary-500/20"
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo Section */}
//           <div className="flex items-center space-x-3">
//             <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-400/30">
//               <DocumentCheckIcon className="w-6 h-6 text-accent-400" />
//             </div>
//             <div className="flex flex-col">
//               <h1 className="text-lg font-semibold text-foreground">DocVerify</h1>
//               <p className="text-xs text-gray-400 -mt-1">Blockchain Security</p>
//             </div>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="flex items-center space-x-8">
//             <nav className="hidden md:flex items-center space-x-1">
//               {tabs.map((tab) => {
//                 const IconComponent = tab.icon;
//                 return (
//                   <motion.button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     whileHover={{ y: -1 }}
//                     whileTap={{ scale: 0.98 }}
//                     className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
//                       activeTab === tab.id
//                         ? 'bg-accent-500/15 text-accent-400 border border-accent-400/30'
//                         : 'text-gray-300 hover:text-accent-400 hover:bg-primary-500/10'
//                     }`}
//                   >
//                     <IconComponent className="w-4 h-4" />
//                     <span className="hidden lg:block">{tab.label}</span>
//                     <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
//                   </motion.button>
//                 );
//               })}
//             </nav>

//             {/* Mobile Menu Button */}
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/20 border border-primary-400/30 text-primary-400 hover:bg-primary-500/30 transition-all duration-200"
//             >
//               {isMobileMenuOpen ? (
//                 <XMarkIcon className="w-5 h-5" />
//               ) : (
//                 <Bars3Icon className="w-5 h-5" />
//               )}
//             </motion.button>

//             <WalletConnect />
//           </div>
//         </div>

//         {/* Mobile Navigation Menu */}
//         <motion.div
//           initial={{ height: 0, opacity: 0 }}
//           animate={{ 
//             height: isMobileMenuOpen ? 'auto' : 0, 
//             opacity: isMobileMenuOpen ? 1 : 0 
//           }}
//           className="md:hidden overflow-hidden border-t border-primary-500/20"
//         >
//           <div className="py-4 space-y-2">
//             {tabs.map((tab) => {
//               const IconComponent = tab.icon;
//               return (
//                 <motion.button
//                   key={tab.id}
//                   onClick={() => {
//                     setActiveTab(tab.id);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   whileHover={{ x: 4 }}
//                   className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
//                     activeTab === tab.id
//                       ? 'bg-accent-500/15 text-accent-400 border border-accent-400/30'
//                       : 'text-gray-300 hover:text-accent-400 hover:bg-primary-500/10'
//                   }`}
//                 >
//                   <IconComponent className="w-5 h-5" />
//                   <span className="font-medium">{tab.label}</span>
//                 </motion.button>
//               );
//             })}
//           </div>
//         </motion.div>
//       </div>
//     </motion.nav>
//   );
// };

// export default Navbar;


// components/layout/Navbar.jsx (Updated with proper routing)
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Add useLocation
import { motion } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Get current location
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  // Navigation items with proper paths
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: ChartBarIcon },
    { name: 'Upload Documents', path: '/upload', icon: CloudArrowUpIcon },
    { name: 'Verify Documents', path: '/verify', icon: ShieldCheckIcon },
    // { name: 'Analytics', path: '/analytics', icon: DocumentIcon },
  ];

  // Function to check if current path matches nav item
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-accent-500 to-secondary-400 rounded-lg">
                <CubeTransparentIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-accent-400 to-secondary-400 bg-clip-text text-transparent">
                  DocVerify
                </h1>
                <p className="text-xs text-muted-400">Blockchain Security</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActivePath(item.path)
                        ? 'bg-accent-500/20 text-accent-400 border border-accent-400/30'
                        : 'text-muted-300 hover:text-foreground hover:bg-primary-500/10'
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
                  <div className="text-xs text-muted-400">Connected</div>
                  <div className="blockchain-address text-sm">
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-outline text-sm px-3 py-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary text-sm px-4 py-2"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-300 hover:text-foreground hover:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-accent-500"
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
          className="md:hidden bg-surface/95 backdrop-blur-sm border-t border-primary-500/20"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)} // Close menu on click
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActivePath(item.path)
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-400/30'
                      : 'text-muted-300 hover:text-foreground hover:bg-primary-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
