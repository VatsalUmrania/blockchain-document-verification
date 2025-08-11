// src/components/document/DocumentCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentIcon, 
  CalendarIcon, 
  TagIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import HashDisplay from '../common/HashDisplay';
import Button from '../common/Button';

const DocumentCard = ({ document, onShare, onVerify }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card hover:shadow-xl transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(document.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {document.name}
            </h3>
            <p className="text-sm text-gray-600">
              {(document.size / 1024 / 1024).toFixed(2)} MB • {document.type}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
          {document.status || 'Unknown'}
        </span>
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
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>Uploaded {new Date(document.timestamp).toLocaleDateString()}</span>
        </div>
        {document.category && (
          <div className="flex items-center text-sm text-gray-600">
            <TagIcon className="w-4 h-4 mr-2" />
            <span className="capitalize">{document.category}</span>
          </div>
        )}
        {document.description && (
          <p className="text-sm text-gray-600 mt-2">
            {document.description}
          </p>
        )}
      </div>

      {/* Expandable Details */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
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
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-700 mb-2">Metadata</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  {document.metadata.uploader && (
                    <div>
                      <span className="font-medium">Uploader:</span>
                      <HashDisplay 
                        hash={document.metadata.uploader}
                        variant="compact"
                        showLabel={false}
                      />
                    </div>
                  )}
                  {document.metadata.description && (
                    <div>
                      <span className="font-medium">Description:</span> {document.metadata.description}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => onVerify(document)} size="sm" variant="outline">
            Verify
          </Button>
          <Button onClick={() => onShare(document)} size="sm" variant="outline">
            <ShareIcon className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
