// components/verification/VerificationPortal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  MagnifyingGlassIcon, 
  QrCodeIcon, 
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  BugAntIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
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
      toast.error('Please enter a document hash');
      return;
    }

    const hashValidation = validateHashFormat(hashInput);
    if (!hashValidation.isValid) {
      toast.error(`Invalid hash format. Expected 64 hexadecimal characters, got ${hashValidation.length}`);
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to verify');
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
      
      toast.info('🔍 Analyzing document and checking verification status...');
      
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
                
                toast.success('✅ Document verified and status updated successfully!', {
                  autoClose: 5000
                });
                
              } else {
                console.error('❌ Status update verification failed');
                toast.error('❌ Status update failed - please refresh and try again');
              }
              
            } else {
              console.log(`ℹ️ Document already has status: ${foundDocument.status}`);
              toast.info(`✅ Document already ${foundDocument.status}`);
            }
          } else {
            console.log('❌ Document not found in storage');
            console.log('💡 This document may not have been uploaded through this app');
            
            // Still show success for hash verification even if not in storage
            if (combinedResult.isValid) {
              toast.success('✅ Document hash verified successfully!');
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
          toast.success('✅ Document hash verified successfully!');
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
        'image/webp'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('📄 File type not supported. Please use PDF, DOC, DOCX, or image files.');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`📁 File selected: ${file.name}`);
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
    if (result) {
      setHashInput(result);
      setShowScanner(false);
      setVerificationMethod('hash');
      toast.success('📱 QR code scanned successfully!');
    }
  };

  const clearVerification = () => {
    setHashInput('');
    setSelectedFile(null);
    setVerificationResult(null);
    document.getElementById('file-input').value = '';
    toast.info('🧹 Verification form cleared');
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.length > 10) {
        setHashInput(text.trim());
        toast.success('📋 Hash pasted from clipboard');
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
            <div className="p-3 bg-accent-500/20 rounded-full border border-accent-400/30">
              <ShieldCheckIcon className="w-8 h-8 text-accent-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-400 to-secondary-400 bg-clip-text text-transparent mb-3">
            Document Verification
          </h1>
          <p className="text-lg text-muted-300 max-w-2xl mx-auto">
            Verify document authenticity and update verification status. Successfully verified documents will be marked as verified in your records.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-500/10 border-l-4 border-primary-400 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <InformationCircleIcon className="w-6 h-6 text-primary-400 mr-3" />
              <div>
                <p className="text-primary-400 font-medium">
                  Enhanced Verification Available
                </p>
                <p className="text-muted-300 text-sm mt-1">
                  Connect your wallet to check against your uploaded documents and update verification status.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Verification Method Selection */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Choose Verification Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMethod('hash')}
              className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                verificationMethod === 'hash'
                  ? 'border-accent-400 bg-accent-500/10 shadow-lg shadow-accent-500/20'
                  : 'border-primary-500/30 hover:border-accent-400/50 hover:bg-accent-500/5'
              }`}
            >
              <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-4 text-accent-400" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Hash Verification</h3>
              <p className="text-muted-300 text-sm">
                Enter the document hash and upload the file for comprehensive verification and status updates
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMethod('qr')}
              className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                verificationMethod === 'qr'
                  ? 'border-accent-400 bg-accent-500/10 shadow-lg shadow-accent-500/20'
                  : 'border-primary-500/30 hover:border-accent-400/50 hover:bg-accent-500/5'
              }`}
            >
              <QrCodeIcon className="w-10 h-10 mx-auto mb-4 text-accent-400" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">QR Code Verification</h3>
              <p className="text-muted-300 text-sm">
                Scan QR code to automatically extract hash and verify document with status updates
              </p>
            </motion.button>
          </div>
        </div>

        {/* Verification Form */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Verification Details</h2>
          
          <div className="space-y-6">
            {/* Hash Input Section */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3">
                📝 Document Hash
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter or paste the document hash (64 character SHA-256)..."
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={pasteFromClipboard}
                    variant="outline"
                    size="sm"
                    className="px-4"
                  >
                    📋 Paste
                  </Button>
                  <Button
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    <span>📱 Scan QR</span>
                  </Button>
                </div>
                
                {/* Hash Validation Display */}
                {hashValidation && (
                  <div className="text-sm text-muted-300 bg-surface/40 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Hash Length: {hashValidation.displayLength} characters</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        hashValidation.status === 'valid'
                          ? 'bg-secondary-400/20 text-secondary-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {hashValidation.status === 'valid' ? '✓ Valid SHA-256' : `⚠ Invalid (expected 64)`}
                      </span>
                    </div>
                    
                    {hashValidation.hadPrefix && (
                      <div className="flex items-center space-x-2 text-xs">
                        <InformationCircleIcon className="w-4 h-4 text-accent-400" />
                        <span className="text-accent-400">
                          Hash contains '0x' prefix - will be normalized for comparison
                        </span>
                      </div>
                    )}
                    
                    {hashValidation.status === 'invalid' && (
                      <p className="text-xs text-red-400 mt-1">
                        Please enter a valid 64-character SHA-256 hash (with or without 0x prefix)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3">
                📄 Document to Verify
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-accent-400 bg-accent-500/10' 
                    : selectedFile
                      ? 'border-secondary-400 bg-secondary-400/10'
                      : 'border-primary-500/30 hover:border-accent-400/50'
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
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="pointer-events-none">
                  {selectedFile ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-3"
                    >
                      <DocumentTextIcon className="w-16 h-16 mx-auto text-secondary-400" />
                      <div>
                        <p className="text-lg font-semibold text-secondary-400">{selectedFile.name}</p>
                        <p className="text-muted-300">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                        </p>
                      </div>
                    </motion.div>
                  ) : dragActive ? (
                    <div className="space-y-3">
                      <CloudArrowUpIcon className="w-16 h-16 mx-auto text-accent-400" />
                      <p className="text-lg font-semibold text-accent-400">🎯 Drop your file here!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CloudArrowUpIcon className="w-16 h-16 mx-auto text-muted-400" />
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          📁 Drag & drop your document here
                        </p>
                        <p className="text-muted-300">
                          or click to browse files
                        </p>
                        <p className="text-sm text-muted-400 mt-2">
                          Supports PDF, DOC, DOCX, and Images (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-primary-500/20">
              <Button
                onClick={handleHashVerification}
                loading={isVerifying}
                disabled={!hashInput.trim() || !selectedFile || (hashValidation && hashValidation.status === 'invalid')}
                className="btn-primary flex-1 min-w-[200px] h-12 text-lg font-semibold"
              >
                {isVerifying ? '🔍 Verifying...' : '🔍 Verify & Update Status'}
              </Button>
              
              <Button
                onClick={clearVerification}
                variant="outline"
                disabled={isVerifying}
                className="h-12 px-6"
              >
                🧹 Clear
              </Button>
            </div>

            {/* Enhanced Tips */}
            <div className="bg-accent-500/10 border border-accent-400/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-accent-400 mb-2">💡 Verification & Status Updates</h4>
                  <ul className="text-sm text-muted-300 space-y-1">
                    <li>• Successfully verified documents will automatically update from "pending" to "verified"</li>
                    <li>• Hash comparison is case-insensitive with automatic normalization</li>
                    <li>• Multiple verification strategies ensure maximum accuracy</li>
                    <li>• Document status updates are reflected immediately in your Dashboard</li>
                    <li>• Connect wallet to enable automatic status management</li>
                  </ul>
                </div>
              </div>
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

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
              📊 Recent Verification Attempts
            </h3>
            <div className="space-y-3">
              {verificationHistory.map((attempt) => (
                <motion.div
                  key={`${attempt.id}-${attempt.timestamp}-${Math.random().toString(36).substr(2, 9)}`} // Unique key
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    attempt.status === 'success' 
                      ? 'border-l-secondary-400 bg-secondary-400/10'
                      : attempt.status === 'failed'
                        ? 'border-l-red-500 bg-red-500/10'
                        : attempt.status === 'error'
                          ? 'border-l-orange-500 bg-orange-500/10'
                          : 'border-l-accent-400 bg-accent-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{attempt.fileName}</p>
                      <p className="text-sm text-muted-300 mt-1">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                      {attempt.result?.statusUpdated && (
                        <p className="text-xs text-secondary-400 mt-1">
                          ✨ Status updated to verified in records
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        attempt.status === 'success' 
                          ? 'bg-secondary-400/20 text-secondary-400'
                          : attempt.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : attempt.status === 'error'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-accent-500/20 text-accent-400'
                      }`}>
                        {attempt.status === 'success' ? '✅ Verified' : 
                         attempt.status === 'failed' ? '❌ Failed' :
                         attempt.status === 'error' ? '⚠️ Error' : '⏳ Processing'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Information for Failed Verifications */}
        {verificationResult && !verificationResult.isValid && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <BugAntIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-800">🐛 Debug Information</h3>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-orange-700">Expected Hash:</span>
                  <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                    {verificationResult.expectedHash}
                  </code>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-orange-700">Generated Hash:</span>
                  <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                    {verificationResult.generatedHash}
                  </code>
                </div>
                
                {verificationResult.debugInfo && (
                  <div>
                    <span className="text-sm font-medium text-orange-700">Debug Details:</span>
                    <pre className="bg-white p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify(verificationResult.debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerificationPortal;
