// components/verification/VerificationResult.jsx
import React from 'react';
import { motion } from 'framer-motion';
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
          primary: 'text-[#00C853]',
          bg: 'bg-[#00C853]/10',
          border: 'border-[#00C853]/30',
          icon: 'text-[#00C853]'
        };
      } else if (result.statusUpdated) {
        return {
          primary: 'text-[#296CFF]',
          bg: 'bg-[#296CFF]/10',
          border: 'border-[#296CFF]/30',
          icon: 'text-[#296CFF]'
        };
      } else {
        return {
          primary: 'text-[#8B5CF6]',
          bg: 'bg-[#8B5CF6]/10',
          border: 'border-[#8B5CF6]/30',
          icon: 'text-[#8B5CF6]'
        };
      }
    }
    return {
      primary: 'text-[#FF4C4C]',
      bg: 'bg-[#FF4C4C]/10',
      border: 'border-[#FF4C4C]/30',
      icon: 'text-[#FF4C4C]'
    };
  };

  const statusColors = getVerificationStatusColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card border-l-4 ${
        result.isValid 
          ? result.hasBlockchainRecord
            ? 'border-l-[#00C853] bg-gradient-to-r from-[#00C853]/5 to-[#00C853]/10' 
            : result.statusUpdated
              ? 'border-l-[#296CFF] bg-gradient-to-r from-[#296CFF]/5 to-[#296CFF]/10'
              : 'border-l-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/5 to-[#8B5CF6]/10'
          : 'border-l-[#FF4C4C] bg-gradient-to-r from-[#FF4C4C]/5 to-[#FF4C4C]/10'
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
                <XCircleIcon className="w-10 h-10 text-[#FF4C4C]" />
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
            
            <p className="text-[#CCCCCC] text-lg leading-relaxed">
              {result.isValid 
                ? result.hasBlockchainRecord
                  ? 'The document is authentic and has been verified against blockchain records. Document integrity confirmed with cryptographic proof.'
                  : result.statusUpdated
                    ? 'Document hash verified and status successfully updated in your MongoDB records from "pending" to "verified".'
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
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#296CFF]/10 text-[#296CFF] border border-[#296CFF]/30">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  BLOCKCHAIN CONFIRMED
                </span>
              )}
              
              {result.statusUpdated && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  STATUS UPDATED
                </span>
              )}
              
              {result.foundInStorage && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  <CubeTransparentIcon className="w-3 h-3 mr-1" />
                  Found in Records
                </span>
              )}
              
              {result.matchingStrategy && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#333333] text-[#999999] border border-[#444444]">
                  <BeakerIcon className="w-3 h-3 mr-1" />
                  Strategy: {result.matchingStrategy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Update Notification */}
        {result.statusUpdated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#00C853]/20 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-[#00C853]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#00C853] mb-1">Document Status Updated Successfully!</h4>
                <p className="text-sm text-[#E0E0E0]">
                  Your document has been automatically updated from "pending" to "verified" status in MongoDB. 
                  Check your Dashboard to see the updated statistics.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* MongoDB Storage Status */}
        {result.foundInStorage && (
          <div className="bg-[#296CFF]/10 border border-[#296CFF]/30 rounded-xl p-4">
            <h4 className="flex items-center text-lg font-semibold text-[#296CFF] mb-3">
              <CubeTransparentIcon className="w-5 h-5 mr-2" />
              MongoDB Storage Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-[#E0E0E0]">Current Status:</span>
                <p className={`font-semibold ${
                  result.currentStatus === 'verified' ? 'text-[#00C853]' :
                  result.currentStatus === 'pending' ? 'text-[#FF9800]' : 
                  'text-[#999999]'
                }`}>
                  {result.currentStatus === 'verified' ? '✅ Verified' :
                   result.currentStatus === 'pending' ? '⏳ Pending' : 
                   '📭 Not Found'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-[#E0E0E0]">Storage:</span>
                <p className="text-[#296CFF] font-medium">📚 MongoDB Database</p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Status Section */}
        {result.blockchainVerification && (
          <div className="bg-[#121212] rounded-xl p-6 border border-[#333333]">
            <h4 className="flex items-center text-lg font-semibold text-white mb-4">
              <LinkIcon className="w-5 h-5 mr-2 text-[#296CFF]" />
              Blockchain Verification Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-[#999999]">Status:</span>
                <p className={`font-semibold text-lg ${
                  result.blockchainStatus === 'verified' ? 'text-[#00C853]' :
                  result.blockchainStatus === 'pending' ? 'text-[#FF9800]' : 'text-[#666666]'
                }`}>
                  {result.blockchainStatus === 'verified' ? '✅ Verified on Blockchain' :
                   result.blockchainStatus === 'pending' ? '⏳ Pending Blockchain Confirmation' : 
                   '📭 Not Found on Blockchain'}
                </p>
              </div>
              {result.transactionHash && (
                <div>
                  <span className="text-sm font-medium text-[#999999]">Transaction:</span>
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
          </div>
        )}

        {/* Hash Comparison Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <DocumentDuplicateIcon className="w-6 h-6 text-[#8B5CF6]" />
            <h4 className="text-xl font-semibold text-white">Hash Comparison Analysis</h4>
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
          <div className="bg-[#121212] border-2 border-dashed border-[#333333] rounded-xl p-8">
            <div className="text-center">
              <div className="mb-6">
                <h5 className="text-xl font-semibold text-white mb-3">Hash Comparison Result</h5>
                {result.isValid ? (
                  <div className={`flex items-center justify-center ${statusColors.primary}`}>
                    <div className={`w-12 h-12 ${statusColors.bg} rounded-full flex items-center justify-center mr-4 border ${statusColors.border}`}>
                      <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">MATCH CONFIRMED</div>
                      <div className="text-sm text-[#999999]">Cryptographic hashes are identical</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-[#FF4C4C]">
                    <div className="w-12 h-12 bg-[#FF4C4C]/10 rounded-full flex items-center justify-center mr-4 border border-[#FF4C4C]/30">
                      <XCircleIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">NO MATCH</div>
                      <div className="text-sm text-[#999999]">Cryptographic hashes are different</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Hash Length Comparison */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="p-4 bg-[#0D0D0D] rounded-lg border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-[#296CFF]" />
                    <span className="font-medium text-[#E0E0E0]">Generated:</span>
                  </div>
                  <p className="text-[#296CFF] font-mono text-lg">{result.generatedHash?.length || 0} chars</p>
                </div>
                <div className="p-4 bg-[#0D0D0D] rounded-lg border border-[#333333]">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-[#00C853]" />
                    <span className="font-medium text-[#E0E0E0]">Expected:</span>
                  </div>
                  <p className="text-[#00C853] font-mono text-lg">{result.expectedHash?.length || 0} chars</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Metadata Section */}
        {result.metadata && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <InformationCircleIcon className="w-6 h-6 text-[#00C853]" />
              <h4 className="text-xl font-semibold text-white">Document Information</h4>
            </div>
            
            <div className="bg-[#121212] rounded-xl border border-[#333333] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <DocumentIcon className="w-4 h-4 text-[#296CFF]" />
                      <span className="text-sm font-semibold text-[#999999]">Document Name</span>
                    </div>
                    <p className="text-white font-medium">{result.metadata.name}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ChartBarIcon className="w-4 h-4 text-[#00C853]" />
                      <span className="text-sm font-semibold text-[#999999]">File Size</span>
                    </div>
                    <p className="text-white">{(result.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <CubeTransparentIcon className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-sm font-semibold text-[#999999]">File Type</span>
                    </div>
                    <p className="text-white">{result.metadata.type}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <CalendarIcon className="w-4 h-4 text-[#FF9800] mt-1" />
                    <div>
                      <span className="text-sm font-semibold text-[#999999]">Upload Timestamp</span>
                      <p className="text-white">
                        {new Date(result.metadata.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {result.metadata.uploader && (
                    <div className="flex items-start space-x-2">
                      <UserIcon className="w-4 h-4 text-[#296CFF] mt-1" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-[#999999]">Uploaded By</span>
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
                      <span className="text-sm font-semibold text-[#999999]">Description</span>
                      <p className="text-white mt-1">{result.metadata.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Details */}
        <div className="bg-[#121212] rounded-xl p-6 border border-[#333333]">
          <h5 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <BeakerIcon className="w-5 h-5 text-[#8B5CF6]" />
            <span>Verification Technical Details</span>
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[#0D0D0D] rounded-lg border border-[#333333]">
              <HashtagIcon className="w-6 h-6 text-[#296CFF] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#999999] block">Algorithm Used</span>
              <p className="text-[#296CFF] font-semibold">SHA-256</p>
            </div>
            <div className="text-center p-4 bg-[#0D0D0D] rounded-lg border border-[#333333]">
              <CalendarIcon className="w-6 h-6 text-[#00C853] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#999999] block">Verification Time</span>
              <p className="text-[#00C853] font-semibold">{new Date().toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-[#0D0D0D] rounded-lg border border-[#333333]">
              <LinkIcon className="w-6 h-6 text-[#8B5CF6] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#999999] block">Network</span>
              <p className="text-[#8B5CF6] font-semibold">
                {result.hasBlockchainRecord ? 'Ethereum Blockchain' : 'Hash Verification'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-6 border-t border-[#333333]">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={downloadCertificate} 
              variant="primary"
              className="flex items-center space-x-2 h-12"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download Certificate</span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={shareVerificationResult} 
              variant="outline"
              className="flex items-center space-x-2 h-12"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Share Result</span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => copyToClipboard(result.generatedHash)} 
              variant="outline"
              className="flex items-center space-x-2 h-12"
            >
              <ClipboardIcon className="w-5 h-5" />
              <span>Copy Hash</span>
            </Button>
          </motion.div>
        </div>

        {/* Enhanced Information Footer */}
        <div className="bg-[#296CFF]/10 border border-[#296CFF]/30 rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="w-6 h-6 text-[#296CFF] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#296CFF] mb-2">Security & Verification Information</h4>
                <p className="text-sm text-[#E0E0E0] leading-relaxed">
                  This verification result is based on cryptographic hash comparison 
                  {result.hasBlockchainRecord ? ' with blockchain confirmation' : ''}
                  {result.statusUpdated ? ' and includes automatic status updates to your MongoDB records' : ''}. 
                  {result.isValid 
                    ? ' The document integrity has been successfully validated using SHA-256 cryptographic hashing.'
                    : ' If verification failed, ensure you have the correct document and hash.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#296CFF]/20">
              <div className="flex items-center space-x-2">
                <CubeTransparentIcon className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-sm text-[#999999]">Certificate ID: CERT-{Date.now()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-[#296CFF]" />
                <span className="text-sm text-[#296CFF] font-medium">Powered by DocVerify MongoDB System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for Hash-Only Verification */}
        {result.isValid && !result.hasBlockchainRecord && !result.statusUpdated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF9800]/10 border-l-4 border-[#FF9800] rounded-lg p-6"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-[#FF9800] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#FF9800] mb-2">Hash-Only Verification</h4>
                <p className="text-sm text-[#E0E0E0] leading-relaxed">
                  This document was verified using hash comparison only. For enhanced security and automatic status management, 
                  consider uploading documents through the DocVerify platform for full MongoDB integration and blockchain verification capabilities.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationResult;
