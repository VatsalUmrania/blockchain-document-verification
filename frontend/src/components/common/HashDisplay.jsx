// // src/components/common/HashDisplay.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import { 
//   DocumentDuplicateIcon, 
//   EyeIcon, 
//   EyeSlashIcon,
//   CheckIcon,
//   HashtagIcon,
//   LinkIcon
// } from '@heroicons/react/24/outline';

// const HashDisplay = ({ 
//   hash, 
//   label = "Document Hash", 
//   showFullHash = false, 
//   copyable = true, 
//   showLabel = true,
//   variant = 'default' // 'default', 'compact', 'card', 'inline'
// }) => {
//   const [isExpanded, setIsExpanded] = useState(showFullHash);
//   const [justCopied, setJustCopied] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const formatHash = (hash) => {
//     if (!hash) return 'No hash available';
    
//     if (isExpanded || variant === 'compact') {
//       return hash;
//     }
    
//     // Show first 10 and last 10 characters with ellipsis
//     return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
//   };

//   const copyToClipboard = async () => {
//     if (!hash) {
//       toast.error('No hash to copy');
//       return;
//     }

//     try {
//       await navigator.clipboard.writeText(hash);
//       setJustCopied(true);
//       toast.success('📋 Hash copied to clipboard!', {
//         icon: '📋'
//       });
      
//       // Reset the copied state after 2 seconds
//       setTimeout(() => setJustCopied(false), 2000);
//     } catch (error) {
//       toast.error('Failed to copy hash');
//     }
//   };

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//     toast.info(isExpanded ? '👁️ Hash collapsed' : '👁️ Hash expanded', {
//       autoClose: 1000
//     });
//   };

//   // Compact variant for inline display
//   if (variant === 'compact') {
//     return (
//       <span className="inline-flex items-center space-x-2">
//         <code className="bg-[#121212] border border-[#333333] px-2 py-1 rounded text-xs font-mono text-[#296CFF] hover:text-[#2979FF] hover:border-[#296CFF] transition-colors">
//           {formatHash(hash)}
//         </code>
//         {copyable && (
//           <motion.button
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={copyToClipboard}
//             className="text-[#666666] hover:text-[#296CFF] transition-colors"
//           >
//             {justCopied ? (
//               <CheckIcon className="w-3 h-3 text-[#00C853]" />
//             ) : (
//               <DocumentDuplicateIcon className="w-3 h-3" />
//             )}
//           </motion.button>
//         )}
//       </span>
//     );
//   }

//   // Card variant for prominent display
//   if (variant === 'card') {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         whileHover={{ scale: 1.01 }}
//         className="bg-[#1A1A1A] border-2 border-[#296CFF]/30 hover:border-[#296CFF] rounded-xl p-6 shadow-lg shadow-[#296CFF]/20 hover:shadow-[#296CFF]/30 transition-all duration-300"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {showLabel && (
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-2">
//               <HashtagIcon className="w-5 h-5 text-[#296CFF]" />
//               <h4 className="text-lg font-semibold text-white">{label}</h4>
//             </div>
//             <div className="flex items-center space-x-3">
//               {hash && hash.length > 20 && (
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={toggleExpand}
//                   className="p-2 text-[#296CFF] hover:text-[#2979FF] bg-[#296CFF]/10 hover:bg-[#296CFF]/20 rounded-lg border border-[#296CFF]/30 hover:border-[#296CFF] transition-all duration-300"
//                   title={isExpanded ? 'Collapse hash' : 'Expand hash'}
//                 >
//                   {isExpanded ? (
//                     <EyeSlashIcon className="w-4 h-4" />
//                   ) : (
//                     <EyeIcon className="w-4 h-4" />
//                   )}
//                 </motion.button>
//               )}
//               {copyable && (
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={copyToClipboard}
//                   className="p-2 text-[#296CFF] hover:text-[#2979FF] bg-[#296CFF]/10 hover:bg-[#296CFF]/20 rounded-lg border border-[#296CFF]/30 hover:border-[#296CFF] transition-all duration-300"
//                   title="Copy hash"
//                 >
//                   {justCopied ? (
//                     <CheckIcon className="w-4 h-4 text-[#00C853]" />
//                   ) : (
//                     <DocumentDuplicateIcon className="w-4 h-4" />
//                   )}
//                 </motion.button>
//               )}
//             </div>
//           </div>
//         )}
//         <div className="relative">
//           <code className="block bg-[#0D0D0D] border border-[#333333] hover:border-[#296CFF]/50 rounded-lg px-4 py-3 font-mono text-sm text-[#E0E0E0] break-all select-all transition-all duration-300 hover:bg-[#121212]">
//             {formatHash(hash)}
//           </code>
//           {/* Subtle glow effect */}
//           {isHovered && (
//             <div className="absolute inset-0 bg-gradient-to-r from-[#296CFF]/5 to-[#2979FF]/5 rounded-lg pointer-events-none" />
//           )}
//         </div>
        
//         {/* Hash info */}
//         <div className="mt-3 flex items-center justify-between text-xs text-[#999999]">
//           <div className="flex items-center space-x-2">
//             <LinkIcon className="w-3 h-3" />
//             <span>SHA-256 Hash</span>
//           </div>
//           <span>{hash ? `${hash.length} characters` : 'No hash'}</span>
//         </div>
//       </motion.div>
//     );
//   }

//   // Inline variant for simple display
//   if (variant === 'inline') {
//     return (
//       <span className="inline-flex items-center space-x-2 bg-[#1A1A1A] px-3 py-1 rounded-lg border border-[#333333]">
//         <code className="font-mono text-sm text-[#296CFF]">
//           {formatHash(hash)}
//         </code>
//         {copyable && (
//           <button
//             onClick={copyToClipboard}
//             className="text-[#666666] hover:text-[#296CFF] transition-colors"
//           >
//             {justCopied ? (
//               <CheckIcon className="w-3 h-3 text-[#00C853]" />
//             ) : (
//               <DocumentDuplicateIcon className="w-3 h-3" />
//             )}
//           </button>
//         )}
//       </span>
//     );
//   }

//   // Default variant
//   return (
//     <div className="space-y-3">
//       {showLabel && (
//         <div className="flex items-center space-x-2">
//           <HashtagIcon className="w-4 h-4 text-[#296CFF]" />
//           <label className="block text-sm font-semibold text-white">{label}</label>
//         </div>
//       )}
//       <div className="relative">
//         <div className="flex items-center space-x-3">
//           <div className="flex-1 relative">
//             <code className="block w-full bg-[#121212] border border-[#333333] hover:border-[#296CFF]/50 rounded-xl px-4 py-3 font-mono text-sm text-[#E0E0E0] break-all select-all transition-all duration-300 hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF]">
//               {formatHash(hash)}
//             </code>
            
//             {/* Copy feedback overlay */}
//             {justCopied && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.8 }}
//                 className="absolute inset-0 bg-[#00C853]/20 rounded-xl flex items-center justify-center border border-[#00C853]"
//               >
//                 <div className="flex items-center space-x-2 text-[#00C853] font-semibold">
//                   <CheckIcon className="w-5 h-5" />
//                   <span>Copied!</span>
//                 </div>
//               </motion.div>
//             )}
//           </div>
          
//           <div className="flex items-center space-x-2">
//             {hash && hash.length > 20 && (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={toggleExpand}
//                 className="p-3 text-[#666666] hover:text-[#296CFF] bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] hover:border-[#296CFF] rounded-lg transition-all duration-300"
//                 title={isExpanded ? 'Collapse hash' : 'Expand hash'}
//               >
//                 {isExpanded ? (
//                   <EyeSlashIcon className="w-5 h-5" />
//                 ) : (
//                   <EyeIcon className="w-5 h-5" />
//                 )}
//               </motion.button>
//             )}
//             {copyable && (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={copyToClipboard}
//                 className={`p-3 rounded-lg border transition-all duration-300 ${
//                   justCopied
//                     ? 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]'
//                     : 'text-[#666666] hover:text-[#296CFF] bg-[#1A1A1A] hover:bg-[#2A2A2A] border-[#333333] hover:border-[#296CFF]'
//                 }`}
//                 title="Copy hash"
//               >
//                 {justCopied ? (
//                   <CheckIcon className="w-5 h-5" />
//                 ) : (
//                   <DocumentDuplicateIcon className="w-5 h-5" />
//                 )}
//               </motion.button>
//             )}
//           </div>
//         </div>
        
//         {/* Hash metadata */}
//         <div className="mt-2 flex items-center justify-between text-xs text-[#666666]">
//           <div className="flex items-center space-x-2">
//             <LinkIcon className="w-3 h-3" />
//             <span>Cryptographic Hash</span>
//           </div>
//           <span>{hash ? `${hash.length} chars` : 'No data'}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HashDisplay;


// src/components/common/HashDisplay.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  DocumentDuplicateIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckIcon,
  HashtagIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const HashDisplay = ({ 
  hash, 
  label = "Document Hash", 
  showFullHash = false, 
  copyable = true, 
  showLabel = true,
  variant = 'default', // 'default', 'compact', 'card', 'inline'
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [isExpanded, setIsExpanded] = useState(showFullHash);
  const [justCopied, setJustCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatHash = (hash) => {
    if (!hash) return 'No hash available';
    
    if (isExpanded || variant === 'compact') {
      return hash;
    }
    
    // Responsive hash display based on size
    const displayLengths = {
      sm: { start: 6, end: 6 },
      md: { start: 10, end: 10 },
      lg: { start: 15, end: 15 }
    };
    
    const { start, end } = displayLengths[size];
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const copyToClipboard = async () => {
    if (!hash) {
      toast.error('No hash to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(hash);
      setJustCopied(true);
      toast.success('📋 Hash copied to clipboard!', {
        icon: '📋'
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setJustCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy hash');
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    toast.info(isExpanded ? '👁️ Hash collapsed' : '👁️ Hash expanded', {
      autoClose: 1000
    });
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      text: 'text-xs',
      padding: 'px-2 py-1',
      iconSize: 'w-3 h-3',
      buttonPadding: 'p-1',
      spacing: 'space-x-1'
    },
    md: {
      text: 'text-sm',
      padding: 'px-3 py-2',
      iconSize: 'w-4 h-4',
      buttonPadding: 'p-2',
      spacing: 'space-x-2'
    },
    lg: {
      text: 'text-base',
      padding: 'px-4 py-3',
      iconSize: 'w-5 h-5',
      buttonPadding: 'p-3',
      spacing: 'space-x-3'
    }
  };

  const config = sizeConfig[size];

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center ${config.spacing}`}>
        <code className={`hash-compact ${config.text} ${config.padding} font-mono`}>
          {formatHash(hash)}
        </code>
        {copyable && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className={`text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors ${config.buttonPadding} rounded`}
            title="Copy hash"
          >
            <AnimatePresence mode="wait">
              {justCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <CheckIcon className={`${config.iconSize} text-[rgb(var(--color-success))]`} />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <DocumentDuplicateIcon className={config.iconSize} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </span>
    );
  }

  // Card variant for prominent display
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="hash-card rounded-xl p-6 shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showLabel && (
          <div className={`flex items-center justify-between mb-4`}>
            <div className={`flex items-center ${config.spacing}`}>
              <HashtagIcon className={`${config.iconSize} text-[rgb(var(--color-primary))]`} />
              <h4 className={`${size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-base' : 'text-lg'} font-semibold text-[rgb(var(--text-primary))]`}>
                {label}
              </h4>
            </div>
            <div className={`flex items-center ${config.spacing}`}>
              {hash && hash.length > 20 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleExpand}
                  className={`${config.buttonPadding} text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] bg-[rgb(var(--color-primary)/0.1)] hover:bg-[rgb(var(--color-primary)/0.2)] rounded-lg border border-[rgb(var(--color-primary)/0.3)] hover:border-[rgb(var(--color-primary))] transition-all duration-300`}
                  title={isExpanded ? 'Collapse hash' : 'Expand hash'}
                >
                  {isExpanded ? (
                    <EyeSlashIcon className={config.iconSize} />
                  ) : (
                    <EyeIcon className={config.iconSize} />
                  )}
                </motion.button>
              )}
              {copyable && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className={`${config.buttonPadding} rounded-lg border transition-all duration-300 ${
                    justCopied
                      ? 'text-[rgb(var(--color-success))] bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success))]'
                      : 'text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] bg-[rgb(var(--color-primary)/0.1)] hover:bg-[rgb(var(--color-primary)/0.2)] border-[rgb(var(--color-primary)/0.3)] hover:border-[rgb(var(--color-primary))]'
                  }`}
                  title="Copy hash"
                >
                  <AnimatePresence mode="wait">
                    {justCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckIcon className={config.iconSize} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <DocumentDuplicateIcon className={config.iconSize} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          </div>
        )}
        
        <div className="relative">
          <code className={`hash-display block bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] rounded-lg ${config.padding} font-mono ${config.text} text-[rgb(var(--text-primary))] break-all select-all transition-all duration-300 hover:bg-[rgb(var(--surface-hover))]`}>
            {formatHash(hash)}
          </code>
          
          {/* Subtle glow effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary)/0.05)] to-[rgb(var(--color-primary-hover)/0.05)] rounded-lg pointer-events-none" 
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Hash info */}
        <div className={`mt-3 flex items-center justify-between ${config.text === 'text-xs' ? 'text-xs' : 'text-xs'} text-[rgb(var(--text-quaternary))]`}>
          <div className={`flex items-center ${config.spacing}`}>
            <LinkIcon className="w-3 h-3" />
            <span>SHA-256 Hash</span>
          </div>
          <span>{hash ? `${hash.length} characters` : 'No hash'}</span>
        </div>
      </motion.div>
    );
  }

  // Inline variant for simple display
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center ${config.spacing} bg-[rgb(var(--surface-primary))] ${config.padding} rounded-lg border border-[rgb(var(--border-primary))]`}>
        <code className={`font-mono ${config.text} text-[rgb(var(--color-primary))]`}>
          {formatHash(hash)}
        </code>
        {copyable && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
            title="Copy hash"
          >
            <AnimatePresence mode="wait">
              {justCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <CheckIcon className={`${config.iconSize} text-[rgb(var(--color-success))]`} />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <DocumentDuplicateIcon className={config.iconSize} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </span>
    );
  }

  // Default variant
  return (
    <div className={`space-y-${size === 'sm' ? '2' : '3'}`}>
      {showLabel && (
        <div className={`flex items-center ${config.spacing}`}>
          <HashtagIcon className={`${config.iconSize} text-[rgb(var(--color-primary))]`} />
          <label className={`block ${config.text} font-semibold text-[rgb(var(--text-primary))]`}>
            {label}
          </label>
        </div>
      )}
      
      <div className="relative">
        <div className={`flex items-center ${config.spacing}`}>
          <div className="flex-1 relative">
            <code className={`hash-display block w-full bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] rounded-xl ${config.padding} font-mono ${config.text} text-[rgb(var(--text-primary))] break-all select-all transition-all duration-300 hover:bg-[rgb(var(--surface-hover))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]`}>
              {formatHash(hash)}
            </code>
            
            {/* Copy feedback overlay */}
            <AnimatePresence>
              {justCopied && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-[rgb(var(--color-success)/0.2)] rounded-xl flex items-center justify-center border border-[rgb(var(--color-success))]"
                >
                  <div className={`flex items-center ${config.spacing} text-[rgb(var(--color-success))] font-semibold`}>
                    <CheckIcon className={config.iconSize} />
                    <span>Copied!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className={`flex items-center ${config.spacing}`}>
            {hash && hash.length > 20 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleExpand}
                className={`${config.buttonPadding} text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] bg-[rgb(var(--surface-primary))] hover:bg-[rgb(var(--surface-hover))] border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))] rounded-lg transition-all duration-300`}
                title={isExpanded ? 'Collapse hash' : 'Expand hash'}
              >
                <AnimatePresence mode="wait">
                  {isExpanded ? (
                    <motion.div
                      key="hide"
                      initial={{ rotate: 180 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: -180 }}
                    >
                      <EyeSlashIcon className={config.iconSize} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="show"
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 180 }}
                    >
                      <EyeIcon className={config.iconSize} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
            
            {copyable && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className={`${config.buttonPadding} rounded-lg border transition-all duration-300 ${
                  justCopied
                    ? 'text-[rgb(var(--color-success))] bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success))]'
                    : 'text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] bg-[rgb(var(--surface-primary))] hover:bg-[rgb(var(--surface-hover))] border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))]'
                }`}
                title="Copy hash"
              >
                <AnimatePresence mode="wait">
                  {justCopied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckIcon className={config.iconSize} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <DocumentDuplicateIcon className={config.iconSize} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Hash metadata */}
        <div className={`mt-2 flex items-center justify-between text-xs text-[rgb(var(--text-quaternary))]`}>
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-3 h-3" />
            <span>Cryptographic Hash</span>
          </div>
          <span>{hash ? `${hash.length} chars` : 'No data'}</span>
        </div>
      </div>
    </div>
  );
};

export default HashDisplay;
