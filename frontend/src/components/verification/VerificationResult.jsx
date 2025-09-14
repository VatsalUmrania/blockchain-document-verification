// components/verification/VerificationResult.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  CalendarIcon,
  UserIcon,
  InformationCircleIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ClipboardIcon,
  HashtagIcon,
  ChartBarIcon,
  DocumentIcon,
  SparklesIcon,
  BeakerIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import HashDisplay from '../common/HashDisplay';

const VerificationResult = ({ result }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('📋 Copied to clipboard!', {
        icon: '📋'
      });
    }).catch(() => {
      toast.error('❌ Failed to copy to clipboard');
    });
  };

  const downloadCertificate = () => {
    const certificateData = {
      verificationResult: result.isValid,
      timestamp: new Date().toISOString(),
      generatedHash: result.generatedHash,
      expectedHash: result.expectedHash,
      metadata: result.metadata,
      blockchainVerification: result.blockchainVerification || null,
      blockchainStatus: result.blockchainStatus || 'not_found',
      transactionHash: result.transactionHash || null,
      statusUpdated: result.statusUpdated || false,
      foundInStorage: result.foundInStorage || false,
      currentStatus: result.currentStatus || 'not_found',
      certificateId: `CERT-${Date.now()}`,
      verificationDetails: {
        algorithm: 'SHA-256',
        blockchainNetwork: 'Ethereum',
        verifiedBy: 'DocVerify System',
        hasBlockchainRecord: result.hasBlockchainRecord || false,
        verificationMethod: result.matchingStrategy || 'hash_comparison'
      }
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-certificate-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('💾 Verification certificate downloaded!', {
      icon: '💾'
    });
  };

  const shareVerificationResult = () => {
    const shareData = {
      title: 'Document Verification Result - DocVerify',
      text: `Document verification ${result.isValid ? 'successful' : 'failed'} - MongoDB & Blockchain Security`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).then(() => {
        toast.success('🔗 Verification result shared!', {
          icon: '🔗'
        });
      }).catch(() => {
        copyToClipboard(window.location.href);
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  const getVerificationStatusColors = () => {
    if (result.isValid) {
      if (result.hasBlockchainRecord) {
        return {
          primary: 'text-[rgb(var(--color-success))]',
          bg: 'bg-[rgb(var(--color-success)/0.1)]',
          border: 'border-[rgb(var(--color-success)/0.3)]',
          icon: 'text-[rgb(var(--color-success))]'
        };
      } else if (result.statusUpdated) {
        return {
          primary: 'text-[rgb(var(--color-primary))]',
          bg: 'bg-[rgb(var(--color-primary)/0.1)]',
          border: 'border-[rgb(var(--color-primary)/0.3)]',
          icon: 'text-[rgb(var(--color-primary))]'
        };
      } else {
        return {
          primary: 'text-[rgb(var(--color-accent))]',
          bg: 'bg-[rgb(var(--color-accent)/0.1)]',
          border: 'border-[rgb(var(--color-accent)/0.3)]',
          icon: 'text-[rgb(var(--color-accent))]'
        };
      }
    }
    return {
      primary: 'text-[rgb(var(--color-error))]',
      bg: 'bg-[rgb(var(--color-error)/0.1)]',
      border: 'border-[rgb(var(--color-error)/0.3)]',
      icon: 'text-[rgb(var(--color-error))]'
    };
  };

  const statusColors = getVerificationStatusColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`card border-l-4 ${
        result.isValid 
          ? result.hasBlockchainRecord
            ? 'border-l-[rgb(var(--color-success))]' 
            : result.statusUpdated
              ? 'border-l-[rgb(var(--color-primary))]'
              : 'border-l-[rgb(var(--color-accent))]'
          : 'border-l-[rgb(var(--color-error))]'
      }`}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${statusColors.bg} border-2 ${statusColors.border}`}>
              {result.isValid ? (
                <CheckCircleIcon className={`w-10 h-10 ${statusColors.icon}`} />
              ) : (
                <XCircleIcon className="w-10 h-10 text-[rgb(var(--color-error))]" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-2xl font-bold ${statusColors.primary} mb-2`}>
              {result.isValid 
                ? result.hasBlockchainRecord 
                  ? '🔗 Blockchain Verification Successful' 
                  : result.statusUpdated
                    ? '✨ Verification Complete - Status Updated'
                    : '✅ Hash Verification Successful'
                : '❌ Verification Failed'}
            </h3>
            
            <p className="text-[rgb(var(--text-secondary))] text-lg leading-relaxed">
              {result.isValid 
                ? result.hasBlockchainRecord
                  ? 'The document is authentic and has been verified against blockchain records. Document integrity confirmed with cryptographic proof.'
                  : result.statusUpdated
                    ? 'Document hash verified and status successfully updated in your records from "pending" to "verified".'
                    : 'The document hash matches the expected value. Document integrity has been verified using cryptographic comparison.'
                : 'The document hash does not match the expected value. This could indicate the document has been modified or corrupted.'
              }
            </p>

            {/* Verification Badges */}
            <div className="mt-4 flex flex-wrap gap-3">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusColors.bg} ${statusColors.primary} border ${statusColors.border}`}>
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                {result.isValid ? 'VERIFIED' : 'VERIFICATION FAILED'}
              </span>
              
              {result.hasBlockchainRecord && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary)/0.3)]">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  BLOCKCHAIN CONFIRMED
                </span>
              )}
              
              {result.statusUpdated && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success))] border border-[rgb(var(--color-success)/0.3)]">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  STATUS UPDATED
                </span>
              )}
              
              {result.foundInStorage && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent)/0.3)]">
                  <CubeTransparentIcon className="w-3 h-3 mr-1" />
                  Found in Records
                </span>
              )}
              
              {result.matchingStrategy && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgb(var(--surface-secondary))] text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-primary))]">
                  <BeakerIcon className="w-3 h-3 mr-1" />
                  Strategy: {result.matchingStrategy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Update Notification */}
        <AnimatePresence>
          {result.statusUpdated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[rgb(var(--color-success)/0.1)] border border-[rgb(var(--color-success)/0.3)] rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[rgb(var(--color-success)/0.2)] rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-[rgb(var(--color-success))]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--color-success))] mb-1">Document Status Updated Successfully!</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    Your document has been automatically updated from "pending" to "verified" status. 
                    Check your Dashboard to see the updated statistics.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Storage Status */}
        <AnimatePresence>
          {result.foundInStorage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[rgb(var(--color-primary)/0.1)] border border-[rgb(var(--color-primary)/0.3)] rounded-xl p-4"
            >
              <h4 className="flex items-center text-lg font-semibold text-[rgb(var(--color-primary))] mb-3">
                <CubeTransparentIcon className="w-5 h-5 mr-2" />
                Storage Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Current Status:</span>
                  <p className={`font-semibold ${
                    result.currentStatus === 'verified' ? 'text-[rgb(var(--color-success))]' :
                    result.currentStatus === 'pending' ? 'text-[rgb(var(--color-warning))]' : 
                    'text-[rgb(var(--text-tertiary))]'
                  }`}>
                    {result.currentStatus === 'verified' ? '✅ Verified' :
                     result.currentStatus === 'pending' ? '⏳ Pending' : 
                     '📭 Not Found'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Storage:</span>
                  <p className="text-[rgb(var(--color-primary))] font-medium">📚 Database Records</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blockchain Status Section */}
        <AnimatePresence>
          {result.blockchainVerification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[rgb(var(--surface-secondary))] rounded-xl p-6 border border-[rgb(var(--border-primary))]"
            >
              <h4 className="flex items-center text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                <LinkIcon className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
                Blockchain Verification Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-[rgb(var(--text-tertiary))]">Status:</span>
                  <p className={`font-semibold text-lg ${
                    result.blockchainStatus === 'verified' ? 'text-[rgb(var(--color-success))]' :
                    result.blockchainStatus === 'pending' ? 'text-[rgb(var(--color-warning))]' : 'text-[rgb(var(--text-quaternary))]'
                  }`}>
                    {result.blockchainStatus === 'verified' ? '✅ Verified on Blockchain' :
                     result.blockchainStatus === 'pending' ? '⏳ Pending Blockchain Confirmation' : 
                     '📭 Not Found on Blockchain'}
                  </p>
                </div>
                {result.transactionHash && (
                  <div>
                    <span className="text-sm font-medium text-[rgb(var(--text-tertiary))]">Transaction:</span>
                    <div className="mt-2">
                      <HashDisplay 
                        hash={result.transactionHash}
                        variant="compact"
                        showLabel={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hash Comparison Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <DocumentDuplicateIcon className="w-6 h-6 text-[rgb(var(--color-accent))]" />
            <h4 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Hash Comparison Analysis</h4>
          </div>

          {/* Generated Hash */}
          <div>
            <HashDisplay 
              hash={result.generatedHash}
              label="Generated Hash (From Uploaded Document)"
              variant="card"
            />
          </div>

          {/* Expected Hash */}
          <div>
            <HashDisplay 
              hash={result.expectedHash}
              label="Expected Hash (From Verification Request)"
              variant="card"
            />
          </div>

          {/* Visual Hash Comparison */}
          <div className="bg-[rgb(var(--surface-secondary))] border-2 border-dashed border-[rgb(var(--border-primary))] rounded-xl p-8">
            <div className="text-center">
              <div className="mb-6">
                <h5 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-3">Hash Comparison Result</h5>
                {result.isValid ? (
                  <div className={`flex items-center justify-center ${statusColors.primary}`}>
                    <div className={`w-12 h-12 ${statusColors.bg} rounded-full flex items-center justify-center mr-4 border ${statusColors.border}`}>
                      <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">MATCH CONFIRMED</div>
                      <div className="text-sm text-[rgb(var(--text-tertiary))]">Cryptographic hashes are identical</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-[rgb(var(--color-error))]">
                    <div className="w-12 h-12 bg-[rgb(var(--color-error)/0.1)] rounded-full flex items-center justify-center mr-4 border border-[rgb(var(--color-error)/0.3)]">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">NO MATCH</div>
                      <div className="text-sm text-[rgb(var(--text-tertiary))]">Cryptographic hashes are different</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Hash Length Comparison */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="p-4 bg-[rgb(var(--surface-primary))] rounded-lg border border-[rgb(var(--border-primary))]">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    <span className="font-medium text-[rgb(var(--text-primary))]">Generated:</span>
                  </div>
                  <p className="text-[rgb(var(--color-primary))] font-mono text-lg">{result.generatedHash?.length || 0} chars</p>
                </div>
                <div className="p-4 bg-[rgb(var(--surface-primary))] rounded-lg border border-[rgb(var(--border-primary))]">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                    <span className="font-medium text-[rgb(var(--text-primary))]">Expected:</span>
                  </div>
                  <p className="text-[rgb(var(--color-success))] font-mono text-lg">{result.expectedHash?.length || 0} chars</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Metadata Section */}
        <AnimatePresence>
          {result.metadata && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="w-6 h-6 text-[rgb(var(--color-success))]" />
                <h4 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Document Information</h4>
              </div>
              
              <div className="bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <DocumentIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--text-tertiary))]">Document Name</span>
                      </div>
                      <p className="text-[rgb(var(--text-primary))] font-medium">{result.metadata.name}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <ChartBarIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--text-tertiary))]">File Size</span>
                      </div>
                      <p className="text-[rgb(var(--text-primary))]">{(result.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <CubeTransparentIcon className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--text-tertiary))]">File Type</span>
                      </div>
                      <p className="text-[rgb(var(--text-primary))]">{result.metadata.type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <CalendarIcon className="w-4 h-4 text-[rgb(var(--color-warning))] mt-1" />
                      <div>
                        <span className="text-sm font-semibold text-[rgb(var(--text-tertiary))]">Upload Timestamp</span>
                        <p className="text-[rgb(var(--text-primary))]">
                          {new Date(result.metadata.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {result.metadata.uploader && (
                      <div className="flex items-start space-x-2">
                        <UserIcon className="w-4 h-4 text-[rgb(var(--color-primary))] mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold text-[rgb(var(--text-tertiary))]">Uploaded By</span>
                          <div className="mt-2">
                            <HashDisplay 
                              hash={result.metadata.uploader}
                              variant="compact"
                              showLabel={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {result.metadata.description && (
                      <div>
                        <span className="text-sm font-semibold text-[rgb(var(--text-tertiary))]">Description</span>
                        <p className="text-[rgb(var(--text-primary))] mt-1">{result.metadata.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Details */}
        <div className="bg-[rgb(var(--surface-secondary))] rounded-xl p-6 border border-[rgb(var(--border-primary))]">
          <h5 className="font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center space-x-2">
            <BeakerIcon className="w-5 h-5 text-[rgb(var(--color-accent))]" />
            <span>Verification Technical Details</span>
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[rgb(var(--surface-primary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <HashtagIcon className="w-6 h-6 text-[rgb(var(--color-primary))] mx-auto mb-2" />
              <span className="text-sm font-medium text-[rgb(var(--text-tertiary))] block">Algorithm Used</span>
              <p className="text-[rgb(var(--color-primary))] font-semibold">SHA-256</p>
            </div>
            <div className="text-center p-4 bg-[rgb(var(--surface-primary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <CalendarIcon className="w-6 h-6 text-[rgb(var(--color-success))] mx-auto mb-2" />
              <span className="text-sm font-medium text-[rgb(var(--text-tertiary))] block">Verification Time</span>
              <p className="text-[rgb(var(--color-success))] font-semibold">{new Date().toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-[rgb(var(--surface-primary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <LinkIcon className="w-6 h-6 text-[rgb(var(--color-accent))] mx-auto mb-2" />
              <span className="text-sm font-medium text-[rgb(var(--text-tertiary))] block">Network</span>
              <p className="text-[rgb(var(--color-accent))] font-semibold">
                {result.hasBlockchainRecord ? 'Ethereum Blockchain' : 'Hash Verification'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgb(var(--border-primary))]">
          <Button 
            onClick={downloadCertificate} 
            variant="primary"
            icon={ArrowDownTrayIcon}
            className="h-12"
          >
            Download Certificate
          </Button>
          
          <Button 
            onClick={shareVerificationResult} 
            variant="secondary"
            icon={ShareIcon}
            className="h-12"
          >
            Share Result
          </Button>
          
          <Button 
            onClick={() => copyToClipboard(result.generatedHash)} 
            variant="secondary"
            icon={ClipboardIcon}
            className="h-12"
          >
            Copy Hash
          </Button>
        </div>

        {/* Enhanced Information Footer */}
        <div className="bg-[rgb(var(--color-primary)/0.1)] border border-[rgb(var(--color-primary)/0.3)] rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="w-6 h-6 text-[rgb(var(--color-primary))] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[rgb(var(--color-primary))] mb-2">Security & Verification Information</h4>
                <p className="text-sm text-[rgb(var(--text-primary))] leading-relaxed">
                  This verification result is based on cryptographic hash comparison 
                  {result.hasBlockchainRecord ? ' with blockchain confirmation' : ''}
                  {result.statusUpdated ? ' and includes automatic status updates to your records' : ''}. 
                  {result.isValid 
                    ? ' The document integrity has been successfully validated using SHA-256 cryptographic hashing.'
                    : ' If verification failed, ensure you have the correct document and hash.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--color-primary)/0.2)]">
              <div className="flex items-center space-x-2">
                <CubeTransparentIcon className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                <span className="text-sm text-[rgb(var(--text-tertiary))]">Certificate ID: CERT-{Date.now()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <span className="text-sm text-[rgb(var(--color-primary))] font-medium">Powered by DocVerify System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for Hash-Only Verification */}
        <AnimatePresence>
          {result.isValid && !result.hasBlockchainRecord && !result.statusUpdated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[rgb(var(--color-warning)/0.1)] border-l-4 border-[rgb(var(--color-warning))] rounded-lg p-6"
            >
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-[rgb(var(--color-warning))] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[rgb(var(--color-warning))] mb-2">Hash-Only Verification</h4>
                  <p className="text-sm text-[rgb(var(--text-primary))] leading-relaxed">
                    This document was verified using hash comparison only. For enhanced security and automatic status management, 
                    consider uploading documents through the DocVerify platform for full integration and blockchain verification capabilities.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VerificationResult;
