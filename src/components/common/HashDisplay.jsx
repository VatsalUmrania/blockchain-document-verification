// src/components/common/HashDisplay.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  DocumentDuplicateIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

const HashDisplay = ({ 
  hash, 
  label = "Hash", 
  showFullHash = false, 
  copyable = true, 
  showLabel = true,
  variant = 'default' // 'default', 'compact', 'card', 'inline'
}) => {
  const [isExpanded, setIsExpanded] = useState(showFullHash);
  const [justCopied, setJustCopied] = useState(false);

  const formatHash = (hash) => {
    if (!hash) return 'No hash available';
    
    if (isExpanded || variant === 'compact') {
      return hash;
    }
    
    // Show first 8 and last 8 characters with ellipsis
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const copyToClipboard = async () => {
    if (!hash) {
      toast.error('No hash to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(hash);
      setJustCopied(true);
      toast.success('Hash copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setJustCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy hash');
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center space-x-1">
        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
          {formatHash(hash)}
        </code>
        {copyable && (
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {justCopied ? (
              <CheckIcon className="w-3 h-3 text-green-500" />
            ) : (
              <DocumentDuplicateIcon className="w-3 h-3" />
            )}
          </button>
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
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
      >
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-800">{label}</h4>
            <div className="flex items-center space-x-2">
              {hash && hash.length > 16 && (
                <button
                  onClick={toggleExpand}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title={isExpanded ? 'Collapse hash' : 'Expand hash'}
                >
                  {isExpanded ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              )}
              {copyable && (
                <button
                  onClick={copyToClipboard}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy hash"
                >
                  {justCopied ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        <code className="block bg-white border border-blue-200 rounded px-3 py-2 font-mono text-sm text-gray-800 break-all select-all">
          {formatHash(hash)}
        </code>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-gray-100 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm text-gray-800 break-all select-all">
            {formatHash(hash)}
          </code>
          <div className="flex items-center space-x-1">
            {hash && hash.length > 16 && (
              <button
                onClick={toggleExpand}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={isExpanded ? 'Collapse hash' : 'Expand hash'}
              >
                {isExpanded ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            )}
            {copyable && (
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy hash"
              >
                {justCopied ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <DocumentDuplicateIcon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashDisplay;
