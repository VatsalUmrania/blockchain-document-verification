import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  CalendarIcon,
  UserIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import HashDisplay from '../common/HashDisplay';

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
      metadata: result.metadata,
      certificateId: `CERT-${Date.now()}`,
      verificationDetails: {
        algorithm: 'SHA-256',
        blockchainNetwork: 'Ethereum',
        verifiedBy: 'DocVerify System'
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
    toast.success('Verification certificate downloaded!');
  };

  const shareVerificationResult = () => {
    const shareData = {
      title: 'Document Verification Result',
      text: `Document verification ${result.isValid ? 'successful' : 'failed'}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).then(() => {
        toast.success('Verification result shared!');
      }).catch(() => {
        copyToClipboard(window.location.href);
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card border-l-4 ${
        result.isValid 
          ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50' 
          : 'border-l-red-500 bg-gradient-to-r from-red-50 to-rose-50'
      }`}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {result.isValid ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold ${
              result.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.isValid ? '✅ Verification Successful' : '❌ Verification Failed'}
            </h3>
            
            <p className={`mt-2 text-sm ${
              result.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.isValid 
                ? 'The document is authentic and has not been tampered with. The document hash matches the expected blockchain record.'
                : 'The document hash does not match the expected value. This could indicate the document has been modified or corrupted.'
              }
            </p>

            {/* Verification Badge */}
            <div className="mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                result.isValid 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                {result.isValid ? 'VERIFIED' : 'VERIFICATION FAILED'}
              </span>
            </div>
          </div>
        </div>

        {/* Hash Comparison Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
            Hash Comparison
          </h4>

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
              label="Expected Hash (From Blockchain Record)"
              variant="card"
            />
          </div>

          {/* Visual Hash Comparison */}
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <h5 className="text-lg font-medium text-gray-700 mb-2">Hash Comparison Result</h5>
                {result.isValid ? (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircleIcon className="w-8 h-8 mr-3" />
                    <div>
                      <div className="text-xl font-bold">MATCH CONFIRMED</div>
                      <div className="text-sm">Hashes are identical</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-red-600">
                    <XCircleIcon className="w-8 h-8 mr-3" />
                    <div>
                      <div className="text-xl font-bold">NO MATCH</div>
                      <div className="text-sm">Hashes are different</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Hash Length Comparison */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Generated:</span> {result.generatedHash?.length || 0} chars
                </div>
                <div>
                  <span className="font-medium">Expected:</span> {result.expectedHash?.length || 0} chars
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Metadata Section */}
        {result.metadata && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Document Information
            </h4>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Document Name</span>
                    <p className="text-gray-800 font-medium">{result.metadata.name}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">File Size</span>
                    <p className="text-gray-800">{(result.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">File Type</span>
                    <p className="text-gray-800">{result.metadata.type}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CalendarIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">Upload Timestamp</span>
                      <p className="text-gray-800">
                        {new Date(result.metadata.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {result.metadata.uploader && (
                    <div className="flex items-start">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-500">Uploaded By</span>
                        <div className="mt-1">
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
                      <span className="text-sm font-medium text-gray-500">Description</span>
                      <p className="text-gray-800">{result.metadata.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-3">Verification Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Algorithm Used:</span>
              <p className="text-gray-800">SHA-256</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Verification Time:</span>
              <p className="text-gray-800">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Network:</span>
              <p className="text-gray-800">Ethereum Blockchain</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <Button onClick={downloadCertificate} className="flex items-center space-x-2">
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>Download Certificate</span>
          </Button>
          
          <Button 
            onClick={shareVerificationResult} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share Result</span>
          </Button>
          
          <Button 
            onClick={() => copyToClipboard(result.generatedHash)} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>Copy Hash</span>
          </Button>
        </div>

        {/* Additional Information */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          <p className="mb-1">
            <strong>Note:</strong> This verification result is based on cryptographic hash comparison. 
            {result.isValid 
              ? ' The document integrity has been successfully validated against the blockchain record.'
              : ' If verification failed, please ensure you have the correct document and try again.'
            }
          </p>
          <p>
            Certificate ID: CERT-{Date.now()} | Verification powered by DocVerify Blockchain System
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationResult;
