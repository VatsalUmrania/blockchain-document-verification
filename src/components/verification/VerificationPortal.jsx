import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import QRCodeScanner from './QRCodeScanner';
import VerificationResult from './VerificationResult';
import { verifyDocumentHash } from '../../services/hashService';

const VerificationPortal = () => {
  const [verificationMethod, setVerificationMethod] = useState('hash');
  const [hashInput, setHashInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleHashVerification = async () => {
    if (!hashInput.trim()) {
      toast.error('Please enter a document hash');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to verify');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyDocumentHash(selectedFile, hashInput.trim());
      setVerificationResult(result);
      
      if (result.isValid) {
        toast.success('Document verification successful!');
      } else {
        toast.error('Document verification failed!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Error during verification process');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      toast.info(`File selected: ${file.name}`);
    }
  };

  const handleQRScan = (result) => {
    if (result) {
      setHashInput(result);
      setShowScanner(false);
      toast.success('QR code scanned successfully!');
    }
  };

  const clearVerification = () => {
    setHashInput('');
    setSelectedFile(null);
    setVerificationResult(null);
    toast.info('Verification form cleared');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Document Verification</h2>
          <p className="text-gray-600">Verify document authenticity using blockchain technology</p>
        </div>

        {/* Verification Method Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Choose Verification Method</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setVerificationMethod('hash')}
              className={`flex-1 p-4 border rounded-lg transition-colors ${
                verificationMethod === 'hash'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <MagnifyingGlassIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Hash Verification</div>
            </button>
            <button
              onClick={() => setVerificationMethod('qr')}
              className={`flex-1 p-4 border rounded-lg transition-colors ${
                verificationMethod === 'qr'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <QrCodeIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">QR Code Scan</div>
            </button>
          </div>
        </div>

        {/* Verification Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Verification Details</h3>
          
          {/* Hash Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Hash
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter document hash..."
                  className="input-field flex-1 font-mono text-sm"
                />
                <Button
                  onClick={() => setShowScanner(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <QrCodeIcon className="w-4 h-4" />
                  <span>Scan QR</span>
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document to Verify
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="input-field"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleHashVerification}
                loading={isVerifying}
                disabled={!hashInput.trim() || !selectedFile}
                className="flex-1"
              >
                Verify Document
              </Button>
              <Button
                onClick={clearVerification}
                variant="outline"
                disabled={isVerifying}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRCodeScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Verification Result */}
        {verificationResult && (
          <VerificationResult result={verificationResult} />
        )}
      </motion.div>
    </div>
  );
};

export default VerificationPortal;
