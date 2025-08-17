import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentCheckIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BlockchainService from '../../services/blockchainService';
import { useWeb3 } from '../../context/Web3Context';
import { DocumentMetadata, VerificationResult } from '../../types/DocumentTypes';

const ThirdPartyVerification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [documentHash, setDocumentHash] = useState('');
  const [verificationMode, setVerificationMode] = useState('file'); // 'file' or 'hash'

  const { provider, isConnected, connectWallet } = useWeb3();

  // File drop handler
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setVerificationResult(null);
      toast.info('📄 File selected. Click "Verify Document" to start verification.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Read file content
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  // Convert ArrayBuffer to string for hashing
  const arrayBufferToString = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  };

  // Verify document by file
  const verifyDocumentByFile = async () => {
    if (!selectedFile) {
      toast.error('❌ Please select a file first');
      return;
    }

    if (!isConnected) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Read file content
      const fileBuffer = await readFileContent(selectedFile);
      const fileContent = arrayBufferToString(fileBuffer);

      // Create a basic metadata object for hashing
      const basicMetadata = new DocumentMetadata({
        documentType: 'unknown',
        title: selectedFile.name,
        recipientName: 'unknown'
      });

      // Initialize blockchain service
      const blockchainService = new BlockchainService(provider, provider.getSigner());
      await blockchainService.initialize();

      // Create document hash
      const calculatedHash = blockchainService.createDocumentHash(fileContent, basicMetadata);

      console.log('🔍 Calculated document hash:', calculatedHash);

      // Verify on blockchain
      const result = await blockchainService.verifyDocumentOnChain(calculatedHash);

      setVerificationResult(result);

      if (result.isValid) {
        toast.success('✅ Document verified successfully!');
      } else {
        toast.warning('⚠️ Document verification failed or document not found');
      }

    } catch (error) {
      console.error('❌ Verification error:', error);

      const errorResult = new VerificationResult({
        isValid: false,
        errors: [error.message || 'Verification failed']
      });

      setVerificationResult(errorResult);
      toast.error('❌ Verification failed: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify document by hash
  const verifyDocumentByHash = async () => {
    if (!documentHash.trim()) {
      toast.error('❌ Please enter a document hash');
      return;
    }

    if (!isConnected) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Initialize blockchain service
      const blockchainService = new BlockchainService(provider, provider.getSigner());
      await blockchainService.initialize();

      // Verify on blockchain
      const result = await blockchainService.verifyDocumentOnChain(documentHash.trim());

      setVerificationResult(result);

      if (result.isValid) {
        toast.success('✅ Document verified successfully!');
      } else {
        toast.warning('⚠️ Document verification failed or document not found');
      }

    } catch (error) {
      console.error('❌ Verification error:', error);

      const errorResult = new VerificationResult({
        isValid: false,
        errors: [error.message || 'Verification failed']
      });

      setVerificationResult(errorResult);
      toast.error('❌ Verification failed: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (isValid) => {
    return isValid ? 'text-green-600' : 'text-red-600';
  };

  // Get status icon
  const getStatusIcon = (isValid) => {
    return isValid ? (
      <CheckCircleIcon className="h-6 w-6 text-green-600" />
    ) : (
      <XCircleIcon className="h-6 w-6 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShieldCheckIcon className="h-16 w-16 text-[#296CFF] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-[#E0E0E0] mb-2">
              Third-Party Document Verification
            </h1>
            <p className="text-xl text-[#B0B0B0] max-w-2xl mx-auto">
              Verify documents directly from the blockchain without relying on centralized servers.
              Upload a document or enter its hash to check authenticity.
            </p>
          </motion.div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2A2A2A] border border-[#444444] rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-[#E0E0E0]">
                Please connect your wallet to verify documents on the blockchain.
              </span>
              <button
                onClick={connectWallet}
                className="ml-auto bg-[#296CFF] text-white px-4 py-2 rounded-lg hover:bg-[#2979FF] transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </motion.div>
        )}

        {/* Verification Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#E0E0E0] mb-4">Verification Method</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setVerificationMode('file')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${verificationMode === 'file'
                ? 'border-[#296CFF] bg-[#296CFF]/10 text-[#296CFF]'
                : 'border-[#333333] hover:border-[#444444] text-[#B0B0B0] hover:text-[#E0E0E0]'
                }`}
            >
              <DocumentIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Upload Document</div>
              <div className="text-sm opacity-75">Verify by uploading the document file</div>
            </button>
            <button
              onClick={() => setVerificationMode('hash')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${verificationMode === 'hash'
                ? 'border-[#296CFF] bg-[#296CFF]/10 text-[#296CFF]'
                : 'border-[#333333] hover:border-[#444444] text-[#B0B0B0] hover:text-[#E0E0E0]'
                }`}
            >
              <DocumentCheckIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Enter Hash</div>
              <div className="text-sm opacity-75">Verify using document hash</div>
            </button>
          </div>
        </motion.div>

        {/* File Upload Section */}
        {verificationMode === 'file' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-[#E0E0E0] mb-4">Upload Document</h2>

            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />

              {selectedFile ? (
                <div>
                  <p className="text-lg font-medium text-green-700 mb-2">
                    File Selected: {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop a document here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to select a file (PDF, DOC, DOCX, Images)
                  </p>
                </div>
              )}
            </div>

            {/* Verify Button */}
            {selectedFile && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={verifyDocumentByFile}
                disabled={isVerifying || !isConnected}
                className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying Document...
                  </div>
                ) : (
                  'Verify Document'
                )}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Hash Input Section */}
        {verificationMode === 'hash' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-[#E0E0E0] mb-4">Enter Document Hash</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="documentHash" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                  Document Hash (SHA-256)
                </label>
                <input
                  type="text"
                  id="documentHash"
                  value={documentHash}
                  onChange={(e) => setDocumentHash(e.target.value)}
                  placeholder="Enter the document hash (e.g., 0x1234...)"
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                />
              </div>

              <motion.button
                onClick={verifyDocumentByHash}
                disabled={isVerifying || !isConnected || !documentHash.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying Document...
                  </div>
                ) : (
                  'Verify Document'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Verification Results */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                {getStatusIcon(verificationResult.isValid)}
                <h2 className={`text-2xl font-bold ml-3 ${getStatusColor(verificationResult.isValid)}`}>
                  {verificationResult.isValid ? 'Document Verified' : 'Verification Failed'}
                </h2>
              </div>

              {/* Error Messages */}
              {verificationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-800 mb-2">Verification Errors:</h3>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        {verificationResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Messages */}
              {verificationResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-2">Warnings:</h3>
                      <ul className="list-disc list-inside text-yellow-700 space-y-1">
                        {verificationResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Details */}
              {verificationResult.document && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Document Information
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Document Type</div>
                          <div className="text-gray-900">{verificationResult.document.documentType}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Recipient</div>
                          <div className="text-gray-900">{verificationResult.document.recipientName}</div>
                          {verificationResult.document.recipientId && (
                            <div className="text-sm text-gray-500">ID: {verificationResult.document.recipientId}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Issuance Date</div>
                          <div className="text-gray-900">{formatDate(verificationResult.document.issuanceDate)}</div>
                        </div>
                      </div>

                      {verificationResult.document.expirationDate && (
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-500">Expiration Date</div>
                            <div className="text-gray-900">{formatDate(verificationResult.document.expirationDate)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issuer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Issuer Information
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Institution</div>
                          <div className="text-gray-900">{verificationResult.document.issuerName}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Issuer Address</div>
                          <div className="text-gray-900 font-mono text-sm break-all">
                            {verificationResult.document.issuer}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Status</div>
                          <div className={`font-medium ${getStatusColor(verificationResult.document.isActive)}`}>
                            {verificationResult.document.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Blockchain Confirmation */}
              {verificationResult.blockchainConfirmed && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      Verified on Blockchain
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    This document has been verified directly from the blockchain and is authentic.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThirdPartyVerification;
