// src/components/document/DocumentCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentIcon, 
  CalendarIcon, 
  TagIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  FolderIcon,
  ChartBarIcon,
  HashtagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import HashDisplay from '../common/HashDisplay';
import Button from '../common/Button';

const DocumentCard = ({ document, onShare, onVerify, onSelect, isSelected }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5 text-[#00C853]" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-[#FF9800]" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-[#FF4C4C]" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-[#666666]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-[#00C853]/20 text-[#00C853] border-[#00C853]/30';
      case 'pending':
        return 'bg-[#FF9800]/20 text-[#FF9800] border-[#FF9800]/30';
      case 'failed':
        return 'bg-[#FF4C4C]/20 text-[#FF4C4C] border-[#FF4C4C]/30';
      default:
        return 'bg-[#333333] text-[#999999] border-[#444444]';
    }
  };

  const getFileTypeIcon = (type) => {
    if (type?.includes('pdf')) return <DocumentTextIcon className="w-5 h-5 text-[#FF4C4C]" />;
    if (type?.includes('image')) return <CubeIcon className="w-5 h-5 text-[#00C853]" />;
    if (type?.includes('word') || type?.includes('document')) return <DocumentIcon className="w-5 h-5 text-[#296CFF]" />;
    return <FolderIcon className="w-5 h-5 text-[#8B5CF6]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`card hover:shadow-2xl hover:shadow-[#296CFF]/20 transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-[#296CFF] bg-[#296CFF]/5' : ''
      }`}
      onClick={() => onSelect && onSelect(document.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#121212] rounded-lg border border-[#333333]">
            {getFileTypeIcon(document.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {document.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-[#999999]">
              <ChartBarIcon className="w-3 h-3" />
              <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
              <span className="text-[#666666]">•</span>
              <span>{document.type || 'Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-1 bg-[#296CFF] rounded-full"
            >
              <CheckCircleIcon className="w-3 h-3 text-white" />
            </motion.div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(document.status)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(document.status)}
              <span>{document.status || 'Unknown'}</span>
            </div>
          </span>
        </div>
      </div>

      {/* Document Hash - Beautiful Display */}
      <div className="mb-4">
        <HashDisplay 
          hash={document.hash} 
          label="Document Hash"
          variant="card"
        />
      </div>

      {/* Metadata */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-[#CCCCCC]">
          <CalendarIcon className="w-4 h-4 mr-2 text-[#296CFF]" />
          <span>Uploaded {new Date(document.timestamp).toLocaleDateString()}</span>
        </div>
        
        {document.category && (
          <div className="flex items-center text-sm text-[#CCCCCC]">
            <TagIcon className="w-4 h-4 mr-2 text-[#00C853]" />
            <span className="capitalize bg-[#121212] px-2 py-1 rounded border border-[#333333]">
              {document.category}
            </span>
          </div>
        )}
        
        {document.metadata?.uploader && (
          <div className="flex items-center text-sm text-[#CCCCCC]">
            <UserIcon className="w-4 h-4 mr-2 text-[#8B5CF6]" />
            <span className="font-mono text-xs">
              {document.metadata.uploader.substring(0, 8)}...
            </span>
          </div>
        )}
        
        {document.description && (
          <div className="bg-[#121212] p-3 rounded-lg border border-[#333333]">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-[#296CFF] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#CCCCCC]">
                {document.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <div className="border-t border-[#333333] pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="flex items-center space-x-2 text-sm text-[#296CFF] hover:text-[#2979FF] font-medium mb-4 transition-colors duration-200"
        >
          {showDetails ? (
            <EyeSlashIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
        </motion.button>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-4"
          >
            {/* Full Hash Display */}
            <div>
              <HashDisplay 
                hash={document.hash}
                label="Full Document Hash"
                showFullHash
              />
            </div>

            {/* Additional Metadata */}
            {document.metadata && (
              <div className="bg-[#121212] rounded-xl p-4 border border-[#333333]">
                <div className="flex items-center space-x-2 mb-3">
                  <HashtagIcon className="w-4 h-4 text-[#8B5CF6]" />
                  <h5 className="font-semibold text-white">Metadata</h5>
                </div>
                <div className="space-y-3 text-sm">
                  {document.metadata.uploader && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-[#296CFF]" />
                        <span className="font-medium text-[#E0E0E0]">Uploader:</span>
                      </div>
                      <HashDisplay 
                        hash={document.metadata.uploader}
                        variant="compact"
                        showLabel={false}
                      />
                    </div>
                  )}
                  
                  {document.metadata.uploadedAt && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-[#00C853]" />
                      <span className="font-medium text-[#E0E0E0]">Upload Time:</span>
                      <span className="text-[#CCCCCC]">
                        {new Date(document.metadata.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {document.metadata.fileType && (
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="w-4 h-4 text-[#FF9800]" />
                      <span className="font-medium text-[#E0E0E0]">File Type:</span>
                      <span className="text-[#CCCCCC] bg-[#0D0D0D] px-2 py-1 rounded border border-[#333333]">
                        {document.metadata.fileType}
                      </span>
                    </div>
                  )}
                  
                  {document.metadata.description && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <InformationCircleIcon className="w-4 h-4 text-[#296CFF]" />
                        <span className="font-medium text-[#E0E0E0]">Description:</span>
                      </div>
                      <p className="text-[#CCCCCC] bg-[#0D0D0D] p-3 rounded border border-[#333333]">
                        {document.metadata.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#296CFF]/10 p-3 rounded-lg border border-[#296CFF]/30">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-4 h-4 text-[#296CFF]" />
                  <span className="text-xs font-medium text-[#296CFF]">File Size</span>
                </div>
                <p className="text-lg font-bold text-white mt-1">
                  {(document.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="bg-[#00C853]/10 p-3 rounded-lg border border-[#00C853]/30">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#00C853]" />
                  <span className="text-xs font-medium text-[#00C853]">Status</span>
                </div>
                <p className="text-lg font-bold text-white mt-1 capitalize">
                  {document.status || 'Unknown'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onVerify(document);
            }} 
            size="sm" 
            variant="primary"
            className="flex items-center space-x-2"
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Verify</span>
          </Button>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onShare(document);
            }} 
            size="sm" 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
