import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Button from '../common/Button';

const VerificationResult = ({ result }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const downloadCertificate = () => {
    const certificateData = {
      verificationResult: result.isValid,
      timestamp: new Date().toISOString(),
      generatedHash: result.generatedHash,
      expectedHash: result.expectedHash,
      metadata: result.metadata
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-certificate-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Verification certificate downloaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card border-l-4 ${
        result.isValid 
          ? 'border-l-green-500 bg-green-50' 
          : 'border-l-red-500 bg-red-50'
      }`}
    >
      <div className="flex items-start space-x-4">
        {result.isValid ? (
          <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
        ) : (
          <XCircleIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
        )}

        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            result.isValid ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.isValid ? 'Verification Successful' : 'Verification Failed'}
          </h3>
          
          <p className={`mt-1 ${
            result.isValid ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.isValid 
              ? 'The document is authentic and has not been tampered with.'
              : 'The document hash does not match the expected value.'
            }
          </p>

          {/* Hash Details */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated Hash
              </label>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono flex-1 break-all">
                  {result.generatedHash}
                </code>
                <button
                  onClick={() => copyToClipboard(result.generatedHash)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Hash
              </label>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono flex-1 break-all">
                  {result.expectedHash}
                </code>
                <button
                  onClick={() => copyToClipboard(result.expectedHash)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata */}
            {result.metadata && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Metadata
                </label>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Name:</span> {result.metadata.name}</div>
                    <div><span className="font-medium">Size:</span> {(result.metadata.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div><span className="font-medium">Type:</span> {result.metadata.type}</div>
                    <div><span className="font-medium">Timestamp:</span> {new Date(result.metadata.timestamp).toLocaleString()}</div>
                  </div>
                  {result.metadata.description && (
                    <div className="mt-2">
                      <span className="font-medium">Description:</span> {result.metadata.description}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-3">
            <Button onClick={downloadCertificate} variant="outline" size="sm">
              Download Certificate
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationResult;
