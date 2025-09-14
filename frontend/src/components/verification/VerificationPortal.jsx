import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  MagnifyingGlassIcon, 
  QrCodeIcon, 
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  BugAntIcon,
  ShieldCheckIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  WalletIcon,
  SparklesIcon,
  HashtagIcon,
  DocumentIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import QRCodeScanner from './QRCodeScanner';
import VerificationResult from './VerificationResult';
import { verifyDocumentHash, normalizeHash, validateHashFormat } from '../../services/hashService';
import { useWeb3 } from '../../context/Web3Context';
import DocumentService from '../../services/DocumentService';
import { useDocumentStats } from '../../context/DocumentStatsContext';

const VerificationPortal = () => {
  const [verificationMethod, setVerificationMethod] = useState('hash');
  const [hashInput, setHashInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState([]);

  const { isConnected, provider, signer } = useWeb3();
  const { refreshStats } = useDocumentStats();

  const handleHashVerification = async () => {
    if (!hashInput.trim()) {
      toast.error('📝 Please enter a document hash');
      return;
    }

    const hashValidation = validateHashFormat(hashInput);
    if (!hashValidation.isValid) {
      toast.error(`❌ Invalid hash format. Expected 64 hexadecimal characters, got ${hashValidation.length}`);
      return;
    }

    if (!selectedFile) {
      toast.error('📄 Please select a file to verify');
      return;
    }

    setIsVerifying(true);
    
    const normalizedHash = normalizeHash(hashInput.trim());
    const verificationAttempt = {
      id: Date.now(),
      fileName: selectedFile.name,
      expectedHash: normalizedHash,
      originalHash: hashInput.trim(),
      timestamp: new Date().toISOString(),
      status: 'processing'
    };
    
    setVerificationHistory(prev => [verificationAttempt, ...prev.slice(0, 4)]);

    try {
      console.log('🔍 Starting comprehensive verification...');
      console.log('📁 Selected file:', selectedFile.name, selectedFile.size, selectedFile.type);
      console.log('📝 Normalized expected hash:', normalizedHash);
      
      toast.info('🔍 Analyzing document and checking verification status...', {
        icon: '🔍'
      });
      
      // Step 1: Hash-based verification
      const hashResult = await verifyDocumentHash(selectedFile, normalizedHash);
      console.log('🔢 Hash verification result:', hashResult);
      
      // Step 2: Check DocumentService for existing documents
      let documentService = null;
      let documentStatus = null;
      let blockchainResult = null;
      
      if (isConnected && provider && signer) {
        try {
          documentService = new DocumentService(provider, signer);
          
          // Check if this hash exists in our storage
          documentStatus = documentService.getDocumentStatus(normalizedHash);
          console.log('📋 Document status check:', documentStatus);
          
          // Try blockchain verification
          const fileContent = await readFileContent(selectedFile);
          blockchainResult = await documentService.verifyDocument(fileContent, selectedFile.name);
          console.log('🔗 Blockchain verification result:', blockchainResult);
          
        } catch (error) {
          console.log('⚠️ DocumentService verification error:', error.message);
        }
      }

      // Step 3: Combine all verification results
      const combinedResult = {
        ...hashResult,
        blockchainVerification: blockchainResult,
        documentStatus: documentStatus,
        hasBlockchainRecord: blockchainResult?.isValid || false,
        blockchainStatus: blockchainResult?.status || 'not_found',
        transactionHash: blockchainResult?.transactionHash || null,
        foundInStorage: documentStatus?.exists || false,
        currentStatus: documentStatus?.status || 'not_found',
        isValid: hashResult.isValid
      };
      
      console.log('✅ Combined verification result:', combinedResult);
      setVerificationResult(combinedResult);
      
      // Step 4: BULLETPROOF DOCUMENT STATUS UPDATE
      if (combinedResult.isValid && isConnected) {
        try {
          console.log('🔄 Starting bulletproof verification update...');
          console.log('🔍 Looking for hash:', normalizedHash);
          
          // Get current documents from localStorage
          let docs = JSON.parse(localStorage.getItem('docverify_documents') || '{}');
          console.log('📋 Total documents in storage:', Object.keys(docs).length);
          
          let foundDocument = null;
          let foundKey = null;
          
          // Search strategy 1: Direct hash match
          if (docs[normalizedHash]) {
            foundDocument = docs[normalizedHash];
            foundKey = normalizedHash;
            console.log('✅ Found by direct hash match');
          }
          
          // Search strategy 2: Normalize all stored hashes
          if (!foundDocument) {
            for (const [storedHash, doc] of Object.entries(docs)) {
              const normalizedStored = normalizeHash(storedHash);
              if (normalizedStored === normalizedHash) {
                foundDocument = doc;
                foundKey = storedHash;
                console.log('✅ Found after normalizing stored hash');
                break;
              }
            }
          }
          
          // Search strategy 3: By file name (fallback)
          if (!foundDocument && selectedFile) {
            for (const [storedHash, doc] of Object.entries(docs)) {
              if (doc.fileName === selectedFile.name) {
                foundDocument = doc;
                foundKey = storedHash;
                console.log('✅ Found by filename match');
                break;
              }
            }
          }
          
          if (foundDocument) {
            console.log('📄 Document found:', foundDocument.fileName);
            console.log('📄 Current status:', foundDocument.status);
            
            if (foundDocument.status === 'pending') {
              console.log('🔄 Updating to verified...');
              
              // Update the document
              docs[foundKey] = {
                ...foundDocument,
                status: 'verified',
                verifiedAt: Date.now(),
                lastUpdated: Date.now(),
                verificationData: {
                  verifiedBy: 'verification_portal',
                  verifiedAt: Date.now(),
                  method: combinedResult.matchingStrategy || 'hash_comparison',
                  fileVerified: selectedFile.name
                }
              };
              
              // Save to localStorage
              localStorage.setItem('docverify_documents', JSON.stringify(docs));
              console.log('✅ Document status saved to localStorage');
              
              // Verify the save worked
              const verification = JSON.parse(localStorage.getItem('docverify_documents'));
              console.log('🔍 Verification check:', verification[foundKey]?.status);
              
              if (verification[foundKey]?.status === 'verified') {
                console.log('✅ Status update confirmed in storage');
                
                // Dispatch multiple events to ensure stats refresh
                ['documentStatsChanged', 'storage'].forEach(eventType => {
                  window.dispatchEvent(new CustomEvent(eventType, {
                    detail: { action: 'verify', hash: foundKey, timestamp: Date.now() }
                  }));
                });
                
                // Force refresh stats immediately with delay
                setTimeout(async () => {
                  console.log('🔄 Calling refreshStats after delay...');
                  await refreshStats();
                  console.log('✅ refreshStats completed');
                }, 300);
                
                // Update result
                combinedResult.statusUpdated = true;
                combinedResult.foundInStorage = true;
                combinedResult.currentStatus = 'verified';
                
                toast.success('🎉 Document verified and status updated successfully!', {
                  autoClose: 5000,
                  icon: '🎉'
                });
                
              } else {
                console.error('❌ Status update verification failed');
                toast.error('❌ Status update failed - please refresh and try again');
              }
              
            } else {
              console.log(`ℹ️ Document already has status: ${foundDocument.status}`);
              toast.info(`✅ Document already ${foundDocument.status}`, {
                icon: '✅'
              });
            }
          } else {
            console.log('❌ Document not found in storage');
            console.log('💡 This document may not have been uploaded through this app');
            
            // Still show success for hash verification even if not in storage
            if (combinedResult.isValid) {
              toast.success('✅ Document hash verified successfully!', {
                icon: '✅'
              });
              toast.info('💡 Document not found in your uploaded documents - may not have been uploaded through this app');
            }
          }
          
        } catch (error) {
          console.error('❌ Error during bulletproof status update:', error);
          toast.error('❌ Error updating document status: ' + error.message);
        }
      } else {
        console.log('⚠️ Status update skipped - conditions not met');
        console.log('   - isValid:', combinedResult.isValid);
        console.log('   - isConnected:', isConnected);
        
        // Still show hash verification result
        if (combinedResult.isValid) {
          toast.success('✅ Document hash verified successfully!', {
            icon: '✅'
          });
          if (!isConnected) {
            toast.info('💡 Connect wallet to check against your uploaded documents');
          }
        }
      }
      
      // Update history
      setVerificationHistory(prev => prev.map(item => 
        item.id === verificationAttempt.id 
          ? { ...item, status: combinedResult.isValid ? 'success' : 'failed', result: combinedResult }
          : item
      ));
      
      // Enhanced success/failure messages
      if (combinedResult.isValid) {
        let successMessage = '✅ Document verification successful!';
        
        if (combinedResult.foundInStorage) {
          successMessage += ` Found in your records (${combinedResult.currentStatus})`;
        }
        if (combinedResult.hasBlockchainRecord) {
          successMessage += ` 🔗 Blockchain status: ${blockchainResult.status}`;
        }
        if (combinedResult.statusUpdated) {
          successMessage += ' ✨ Status updated to verified';
        }
        
        // Don't show duplicate toast if already shown above
        if (!combinedResult.statusUpdated && !combinedResult.foundInStorage) {
          toast.success(successMessage, { autoClose: 5000 });
        }
      } else {
        let errorMessage = '❌ Document verification failed!';
        
        if (hashValidation.hadPrefix) {
          errorMessage += ' Note: Hash was normalized from 0x format.';
        }
        
        toast.error(errorMessage);
        console.log('🐛 Verification debug info:', combinedResult.debugInfo);
      }
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      toast.error(`❌ Error during verification: ${error.message}`);
      
      setVerificationHistory(prev => prev.map(item => 
        item.id === verificationAttempt.id 
          ? { ...item, status: 'error', error: error.message }
          : item
      ));
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper function to read file content
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file.slice(0, 1024));
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('📏 File size must be less than 10MB');
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('📄 File type not supported. Please use PDF, DOC, DOCX, images, or text files.');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`📁 File selected: ${file.name}`, {
        icon: '📁'
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleQRScan = (result) => {
    if (result && result.hash) {
      setHashInput(result.hash);
      setShowScanner(false);
      setVerificationMethod('hash');
      toast.success('📱 QR code scanned successfully!', {
        icon: '📱'
      });
    }
  };

  const clearVerification = () => {
    setHashInput('');
    setSelectedFile(null);
    setVerificationResult(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    toast.info('🧹 Verification form cleared', {
      icon: '🧹'
    });
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.length > 10) {
        setHashInput(text.trim());
        toast.success('📋 Hash pasted from clipboard', {
          icon: '📋'
        });
      } else {
        toast.error('📋 Clipboard does not contain a valid hash');
      }
    } catch (error) {
      toast.error('📋 Failed to read from clipboard');
    }
  };

  const getHashValidation = () => {
    if (!hashInput) return null;
    
    const validation = validateHashFormat(hashInput);
    return {
      ...validation,
      displayLength: validation.normalized.length,
      status: validation.isValid ? 'valid' : 'invalid'
    };
  };

  const hashValidation = getHashValidation();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-[rgb(var(--surface-secondary))] rounded-full border border-[rgb(var(--border-primary))]">
              <ShieldCheckIcon className="w-8 h-8 text-[rgb(var(--text-primary))]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[rgb(var(--text-primary))] mb-3">
            Document Verification Portal
          </h1>
          <p className="text-lg text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">
            Verify document authenticity and update verification status. Successfully verified documents will be marked as verified in your records.
          </p>
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
            >
              <div className="flex items-center">
                <InformationCircleIcon className="w-6 h-6 text-[rgb(var(--text-secondary))] mr-3" />
                <div>
                  <p className="text-[rgb(var(--text-primary))] font-semibold">
                    Enhanced Verification Available
                  </p>
                  <p className="text-[rgb(var(--text-secondary))] text-sm mt-1 flex items-center space-x-2">
                    <WalletIcon className="w-4 h-4" />
                    <span>Connect your wallet to check against your uploaded documents and enable automatic status updates.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Method Selection */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <MagnifyingGlassIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            <h2 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Choose Verification Method</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMethod('hash')}
              className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                verificationMethod === 'hash'
                  ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)]'
                  : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] hover:bg-[rgb(var(--color-primary)/0.05)]'
              }`}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))] mx-auto mb-4">
                <MagnifyingGlassIcon className="w-10 h-10 text-[rgb(var(--color-primary))]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[rgb(var(--text-primary))]">Hash Verification</h3>
              <p className="text-[rgb(var(--text-secondary))] text-sm">
                Enter the document hash and upload the file for comprehensive verification and status updates
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMethod('qr')}
              className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                verificationMethod === 'qr'
                  ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)]'
                  : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] hover:bg-[rgb(var(--color-primary)/0.05)]'
              }`}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))] mx-auto mb-4">
                <QrCodeIcon className="w-10 h-10 text-[rgb(var(--color-primary))]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[rgb(var(--text-primary))]">QR Code Verification</h3>
              <p className="text-[rgb(var(--text-secondary))] text-sm">
                Scan QR code to automatically extract hash and verify document with status updates
              </p>
            </motion.button>
          </div>
        </div>

        {/* Verification Form */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <DocumentTextIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            <h2 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Verification Details</h2>
          </div>
          
          <div className="space-y-6">
            {/* Hash Input Section */}
            <div>
              <label className="flex items-center space-x-2 text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                <HashtagIcon className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                <span>Document Hash</span>
              </label>
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter or paste the document hash (64 character SHA-256)..."
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={pasteFromClipboard}
                    variant="secondary"
                    size="sm"
                    icon={ClipboardIcon}
                  >
                    Paste
                  </Button>
                  <Button
                    onClick={() => setShowScanner(true)}
                    variant="secondary"
                    size="sm"
                    icon={QrCodeIcon}
                  >
                    Scan QR
                  </Button>
                </div>
                
                {/* Hash Validation Display */}
                {hashValidation && (
                  <div className="text-sm bg-[rgb(var(--surface-secondary))] p-4 rounded-xl border border-[rgb(var(--border-primary))]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[rgb(var(--text-primary))]">Hash Length: {hashValidation.displayLength} characters</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        hashValidation.status === 'valid'
                          ? 'bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] border-[rgb(var(--color-success)/0.3)]'
                          : 'bg-[rgb(var(--color-error)/0.2)] text-[rgb(var(--color-error))] border-[rgb(var(--color-error)/0.3)]'
                      }`}>
                        {hashValidation.status === 'valid' ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Valid SHA-256</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <XCircleIcon className="w-3 h-3" />
                            <span>Invalid (expected 64)</span>
                          </div>
                        )}
                      </span>
                    </div>
                    
                    {hashValidation.hadPrefix && (
                      <div className="flex items-center space-x-2 text-xs p-2 bg-[rgb(var(--color-primary)/0.1)] rounded border border-[rgb(var(--color-primary)/0.3)]">
                        <InformationCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                        <span className="text-[rgb(var(--color-primary))]">
                          Hash contains '0x' prefix - will be normalized for comparison
                        </span>
                      </div>
                    )}
                    
                    {hashValidation.status === 'invalid' && (
                      <p className="text-xs text-[rgb(var(--color-error))] mt-2 p-2 bg-[rgb(var(--color-error)/0.1)] rounded border border-[rgb(var(--color-error)/0.3)]">
                        Please enter a valid 64-character SHA-256 hash (with or without 0x prefix)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="flex items-center space-x-2 text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                <span>Document to Verify</span>
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)] scale-105' 
                    : selectedFile
                      ? 'border-[rgb(var(--color-success))] bg-[rgb(var(--color-success)/0.1)]'
                      : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] hover:bg-[rgb(var(--color-primary)/0.05)]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="pointer-events-none">
                  {selectedFile ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="w-16 h-16 bg-[rgb(var(--color-success)/0.2)] rounded-xl flex items-center justify-center mx-auto border border-[rgb(var(--color-success)/0.3)]">
                        <DocumentTextIcon className="w-10 h-10 text-[rgb(var(--color-success))]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[rgb(var(--color-success))]">{selectedFile.name}</p>
                        <div className="flex items-center justify-center space-x-2 text-[rgb(var(--text-secondary))] mt-2">
                          <ChartBarIcon className="w-4 h-4" />
                          <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{selectedFile.type || 'Unknown'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : dragActive ? (
                    <div className="space-y-4">
                      <CloudArrowUpIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))]" />
                      <p className="text-lg font-semibold text-[rgb(var(--color-primary))]">Drop your file here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <CloudArrowUpIcon className="w-16 h-16 mx-auto text-[rgb(var(--text-quaternary))]" />
                      <div>
                        <p className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
                          Drag & drop your document here
                        </p>
                        <p className="text-[rgb(var(--text-secondary))] mb-2">
                          or click to browse files
                        </p>
                        <p className="text-sm text-[rgb(var(--text-tertiary))]">
                          Supports PDF, DOC, DOCX, Images, and Text files (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgb(var(--border-primary))]">
              <Button
                onClick={handleHashVerification}
                loading={isVerifying}
                disabled={!hashInput.trim() || !selectedFile || (hashValidation && hashValidation.status === 'invalid')}
                variant="primary"
                size="lg"
                icon={isVerifying ? undefined : ShieldCheckIcon}
                className="flex-1 min-w-[200px] h-12"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Update Status'}
              </Button>
              
              <Button
                onClick={clearVerification}
                variant="secondary"
                disabled={isVerifying}
                icon={XCircleIcon}
                className="h-12 px-6"
              >
                Clear
              </Button>
            </div>

            {/* Enhanced Tips */}
            <div className="bg-[rgb(var(--color-primary)/0.1)] border border-[rgb(var(--color-primary)/0.3)] rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-6 h-6 text-[rgb(var(--color-primary))] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[rgb(var(--color-primary))] mb-3 flex items-center space-x-2">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Verification & Status Updates</span>
                  </h4>
                  <ul className="text-sm text-[rgb(var(--text-primary))] space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-[rgb(var(--color-success))] mt-0.5 flex-shrink-0" />
                      <span>Successfully verified documents will automatically update from "pending" to "verified"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <HashtagIcon className="w-4 h-4 text-[rgb(var(--color-accent))] mt-0.5 flex-shrink-0" />
                      <span>Hash comparison is case-insensitive with automatic normalization</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
                      <span>Multiple verification strategies ensure maximum accuracy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChartBarIcon className="w-4 h-4 text-[rgb(var(--color-warning))] mt-0.5 flex-shrink-0" />
                      <span>Document status updates are reflected immediately in your Dashboard</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <WalletIcon className="w-4 h-4 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
                      <span>Connect wallet to enable automatic status management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Scanner Modal */}
        <AnimatePresence>
          {showScanner && (
            <QRCodeScanner
              onScan={handleQRScan}
              onClose={() => setShowScanner(false)}
            />
          )}
        </AnimatePresence>

        {/* Verification Result */}
        <AnimatePresence>
          {verificationResult && (
            <VerificationResult result={verificationResult} />
          )}
        </AnimatePresence>

        {/* Verification History */}
        <AnimatePresence>
          {verificationHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <ClockIcon className="w-5 h-5 text-[rgb(var(--color-warning))]" />
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Verification Attempts</h3>
                <div className="px-2 py-1 bg-[rgb(var(--surface-secondary))] text-[rgb(var(--text-primary))] text-xs font-medium rounded border border-[rgb(var(--border-primary))]">
                  {verificationHistory.length} attempts
                </div>
              </div>
              <div className="space-y-3">
                {verificationHistory.map((attempt) => (
                  <motion.div
                    key={`${attempt.id}-${attempt.timestamp}-${Math.random().toString(36).substr(2, 9)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-l-4 ${
                      attempt.status === 'success' 
                        ? 'border-l-[rgb(var(--color-success))] bg-[rgb(var(--color-success)/0.1)]'
                        : attempt.status === 'failed'
                          ? 'border-l-[rgb(var(--color-error))] bg-[rgb(var(--color-error)/0.1)]'
                          : attempt.status === 'error'
                            ? 'border-l-[rgb(var(--color-warning))] bg-[rgb(var(--color-warning)/0.1)]'
                            : 'border-l-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <DocumentIcon className="w-4 h-4 text-[rgb(var(--text-primary))]" />
                          <p className="font-medium text-[rgb(var(--text-primary))]">{attempt.fileName}</p>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </p>
                        {attempt.result?.statusUpdated && (
                          <div className="flex items-center space-x-1 text-xs">
                            <SparklesIcon className="w-3 h-3 text-[rgb(var(--color-success))]" />
                            <span className="text-[rgb(var(--color-success))]">Status updated to verified in records</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          attempt.status === 'success' 
                            ? 'bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] border-[rgb(var(--color-success)/0.3)]'
                            : attempt.status === 'failed'
                              ? 'bg-[rgb(var(--color-error)/0.2)] text-[rgb(var(--color-error))] border-[rgb(var(--color-error)/0.3)]'
                              : attempt.status === 'error'
                                ? 'bg-[rgb(var(--color-warning)/0.2)] text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning)/0.3)]'
                                : 'bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary)/0.3)]'
                        }`}>
                          <div className="flex items-center space-x-1">
                            {attempt.status === 'success' && <CheckCircleIcon className="w-3 h-3" />}
                            {attempt.status === 'failed' && <XCircleIcon className="w-3 h-3" />}
                            {attempt.status === 'error' && <ExclamationCircleIcon className="w-3 h-3" />}
                            {attempt.status === 'processing' && <ClockIcon className="w-3 h-3" />}
                            <span>
                              {attempt.status === 'success' ? 'Verified' : 
                               attempt.status === 'failed' ? 'Failed' :
                               attempt.status === 'error' ? 'Error' : 'Processing'}
                            </span>
                          </div>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Information for Failed Verifications */}
        <AnimatePresence>
          {verificationResult && !verificationResult.isValid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <BugAntIcon className="w-5 h-5 text-[rgb(var(--color-warning))]" />
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Debug Information</h3>
                <div className="px-2 py-1 bg-[rgb(var(--color-warning)/0.1)] text-[rgb(var(--color-warning))] text-xs font-medium rounded border border-[rgb(var(--color-warning)/0.3)]">
                  Debugging
                </div>
              </div>
              
              <div className="bg-[rgb(var(--color-warning)/0.1)] border border-[rgb(var(--color-warning)/0.3)] rounded-xl p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <HashtagIcon className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                      <span className="text-sm font-semibold text-[rgb(var(--color-warning))]">Expected Hash:</span>
                    </div>
                    <code className="block bg-[rgb(var(--surface-secondary))] p-3 rounded-lg font-mono text-xs text-[rgb(var(--text-primary))] break-all border border-[rgb(var(--border-primary))]">
                      {verificationResult.expectedHash}
                    </code>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <HashtagIcon className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                      <span className="text-sm font-semibold text-[rgb(var(--color-warning))]">Generated Hash:</span>
                    </div>
                    <code className="block bg-[rgb(var(--surface-secondary))] p-3 rounded-lg font-mono text-xs text-[rgb(var(--text-primary))] break-all border border-[rgb(var(--border-primary))]">
                      {verificationResult.generatedHash}
                    </code>
                  </div>
                  
                  {verificationResult.debugInfo && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <BugAntIcon className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--color-warning))]">Debug Details:</span>
                      </div>
                      <pre className="bg-[rgb(var(--surface-secondary))] p-3 rounded-lg text-xs text-[rgb(var(--text-primary))] overflow-auto border border-[rgb(var(--border-primary))]">
                        {JSON.stringify(verificationResult.debugInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VerificationPortal;
