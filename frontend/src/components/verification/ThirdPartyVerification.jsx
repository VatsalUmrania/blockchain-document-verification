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
  ShieldCheckIcon,
  HashtagIcon,
  WalletIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BlockchainService from '../../services/blockchainService';
import { useWeb3 } from '../../context/Web3Context';
import { DocumentMetadata, VerificationResult } from '../../types/DocumentTypes';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import HashDisplay from '../common/HashDisplay';

const ThirdPartyVerification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [documentHash, setDocumentHash] = useState('');
  const [verificationMode, setVerificationMode] = useState('file');

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
      const fileBuffer = await readFileContent(selectedFile);
      const fileContent = arrayBufferToString(fileBuffer);

      const basicMetadata = new DocumentMetadata({
        documentType: 'unknown',
        title: selectedFile.name,
        recipientName: 'unknown'
      });

      const blockchainService = new BlockchainService(provider, provider.getSigner());
      await blockchainService.initialize();

      const calculatedHash = blockchainService.createDocumentHash(fileContent, basicMetadata);

      console.log('🔍 Calculated document hash:', calculatedHash);

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
      const blockchainService = new BlockchainService(provider, provider.getSigner());
      await blockchainService.initialize();

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

  // Get status color - FIXED: Use gray instead of green/red
  const getStatusColor = (isValid) => {
    return isValid ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]';
  };

  // Get status icon - FIXED: Use gray instead of green/red
  const getStatusIcon = (isValid) => {
    return isValid ? (
      <CheckCircleIcon className="h-6 w-6 text-[rgb(var(--text-primary))]" />
    ) : (
      <XCircleIcon className="h-6 w-6 text-[rgb(var(--text-secondary))]" />
    );
  };

  return (
    <div className="min-h-screen py-8">      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* FIXED: Changed shield icon color to gray */}
            <div className="p-4 bg-[rgb(var(--surface-secondary))] rounded-2xl w-fit mx-auto mb-4 border border-[rgb(var(--border-primary))]">
              <ShieldCheckIcon className="h-16 w-16 text-[rgb(var(--text-secondary))]" />
            </div>
            {/* FIXED: Changed gradient to use consistent colors */}
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                background: `linear-gradient(135deg, rgb(var(--text-primary)), rgb(var(--text-secondary)))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Third-Party Document Verification
            </h1>
            <p className="text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto">
              Verify documents directly from the blockchain without relying on centralized servers.
              Upload a document or enter its hash to check authenticity.
            </p>
          </motion.div>
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-[rgb(var(--text-secondary))] mr-3" />
                  <div>
                    <span className="text-[rgb(var(--text-primary))] font-medium">
                      Wallet Connection Required
                    </span>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      Connect your wallet to verify documents on the blockchain.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={connectWallet}
                  variant="primary"
                  icon={WalletIcon}
                >
                  Connect Wallet
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card mb-6"
        >
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Verification Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMode('file')}
              className={`p-6 rounded-xl border-2 transition-all text-center ${verificationMode === 'file'
                ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))]'
                : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
              }`}
            >
              <DocumentIcon className="h-12 w-12 mx-auto mb-3" />
              <div className="font-semibold text-lg mb-2">Upload Document</div>
              <div className="text-sm opacity-75">Verify by uploading the document file</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMode('hash')}
              className={`p-6 rounded-xl border-2 transition-all text-center ${verificationMode === 'hash'
                ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))]'
                : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
              }`}
            >
              <HashtagIcon className="h-12 w-12 mx-auto mb-3" />
              <div className="font-semibold text-lg mb-2">Enter Hash</div>
              <div className="text-sm opacity-75">Verify using document hash</div>
            </motion.button>
          </div>
        </motion.div>

        {/* File Upload Section */}
        <AnimatePresence mode="wait">
          {verificationMode === 'file' && (
            <motion.div
              key="file-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="card mb-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Upload Document</h2>
              </div>

              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)]'
                    : selectedFile
                      ? 'border-[rgb(var(--text-secondary))] bg-[rgb(var(--surface-secondary))]'
                      : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))]'
                }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-4 ${
                  isDragActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--text-quaternary))]'
                }`} />

                {selectedFile ? (
                  <div>
                    {/* FIXED: Changed success color to gray */}
                    <p className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">
                      File Selected: {selectedFile.name}
                    </p>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-medium text-[rgb(var(--text-primary))] mb-2">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop a document here'}
                    </p>
                    <p className="text-[rgb(var(--text-secondary))] mb-6">
                      or click to select a file (PDF, DOC, DOCX, Images)
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300">
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <span>Choose File</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verify Button */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6"
                >
                  <Button
                    onClick={verifyDocumentByFile}
                    disabled={isVerifying || !isConnected}
                    variant="primary"
                    size="lg"
                    loading={isVerifying}
                    icon={isVerifying ? undefined : EyeIcon}
                    className="w-full h-14"
                  >
                    {isVerifying ? 'Verifying Document...' : 'Verify Document'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Hash Input Section */}
          {verificationMode === 'hash' && (
            <motion.div
              key="hash-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="card mb-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <HashtagIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Enter Document Hash</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="documentHash" className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Document Hash (SHA-256)
                  </label>
                  <input
                    type="text"
                    id="documentHash"
                    value={documentHash}
                    onChange={(e) => setDocumentHash(e.target.value)}
                    placeholder="Enter the document hash (e.g., 0x1234...)"
                    className="input-field font-mono"
                  />
                </div>

                <Button
                  onClick={verifyDocumentByHash}
                  disabled={isVerifying || !isConnected || !documentHash.trim()}
                  variant="primary"
                  size="lg"
                  loading={isVerifying}
                  icon={isVerifying ? undefined : EyeIcon}
                  className="w-full h-14"
                >
                  {isVerifying ? 'Verifying Document...' : 'Verify Document'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Results */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <div className="flex items-center mb-6">
                {getStatusIcon(verificationResult.isValid)}
                <h2 className={`text-2xl font-bold ml-3 ${getStatusColor(verificationResult.isValid)}`}>
                  {verificationResult.isValid ? 'Document Verified ✅' : 'Verification Failed ❌'}
                </h2>
              </div>

              {/* Error Messages */}
              {verificationResult.errors && verificationResult.errors.length > 0 && (
                <div className="bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-[rgb(var(--text-secondary))] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[rgb(var(--text-primary))] mb-2">Verification Errors:</h3>
                      <ul className="list-disc list-inside text-[rgb(var(--text-secondary))] space-y-1">
                        {verificationResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Messages */}
              {verificationResult.warnings && verificationResult.warnings.length > 0 && (
                <div className="bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-[rgb(var(--text-secondary))] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[rgb(var(--text-primary))] mb-2">Warnings:</h3>
                      <ul className="list-disc list-inside text-[rgb(var(--text-secondary))] space-y-1">
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
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] border-b border-[rgb(var(--border-primary))] pb-2">
                      Document Information
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <DocumentIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Document Type</div>
                          <div className="text-[rgb(var(--text-primary))] capitalize">{verificationResult.document.documentType}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <UserIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Recipient</div>
                          <div className="text-[rgb(var(--text-primary))]">{verificationResult.document.recipientName}</div>
                          {verificationResult.document.recipientId && (
                            <div className="text-sm text-[rgb(var(--text-secondary))]">ID: {verificationResult.document.recipientId}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Issuance Date</div>
                          <div className="text-[rgb(var(--text-primary))]">{formatDate(verificationResult.document.issuanceDate)}</div>
                        </div>
                      </div>

                      {verificationResult.document.expirationDate && (
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Expiration Date</div>
                            <div className="text-[rgb(var(--text-primary))]">{formatDate(verificationResult.document.expirationDate)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issuer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] border-b border-[rgb(var(--border-primary))] pb-2">
                      Issuer Information
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <BuildingOfficeIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Institution</div>
                          <div className="text-[rgb(var(--text-primary))]">{verificationResult.document.issuerName}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Issuer Address</div>
                          <HashDisplay 
                            hash={verificationResult.document.issuer}
                            variant="compact"
                            showLabel={false}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">Status</div>
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
                <div className="mt-6 bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-[rgb(var(--text-primary))] mr-2" />
                    <span className="font-medium text-[rgb(var(--text-primary))]">
                      Verified on Blockchain
                    </span>
                  </div>
                  <p className="text-[rgb(var(--text-secondary))] text-sm mt-1">
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
