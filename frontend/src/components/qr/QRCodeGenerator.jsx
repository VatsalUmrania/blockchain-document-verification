import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import {
  QrCodeIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const QRCodeGenerator = ({
  documentHash,
  transactionHash,
  contractAddress,
  metadata = {},
  onQRGenerated = null
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [verificationURL, setVerificationURL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate verification URL and QR code
  useEffect(() => {
    if (documentHash && contractAddress) {
      generateQRCode();
    }
  }, [documentHash, transactionHash, contractAddress, metadata]);

  const generateQRCode = async () => {
    setIsGenerating(true);

    try {
      // Create verification data object
      const verificationData = {
        documentHash,
        transactionHash,
        contractAddress,
        timestamp: Date.now(),
        version: '1.0',
        network: 'ethereum', // or get from provider
        metadata: {
          documentType: metadata.documentType || 'document',
          issuer: metadata.issuerName || 'Unknown',
          recipient: metadata.recipientName || 'Unknown',
          issuanceDate: metadata.issuanceDate || Date.now()
        }
      };

      // Create verification URL
      const baseURL = window.location.origin;
      const verifyURL = `${baseURL}/verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;

      setVerificationURL(verifyURL);

      // Generate QR code
      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrDataURL = await QRCode.toDataURL(verifyURL, qrOptions);
      setQrCodeDataURL(qrDataURL);

      if (onQRGenerated) {
        onQRGenerated({
          qrCodeDataURL: qrDataURL,
          verificationURL: verifyURL,
          verificationData
        });
      }

      console.log('✅ QR Code generated successfully');
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy verification URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationURL);
      setCopied(true);
      toast.success('📋 Verification URL copied to clipboard!');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `document-verification-qr-${documentHash?.substring(0, 8)}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📥 QR Code downloaded successfully!');
  };

  // Download verification data as JSON
  const downloadVerificationData = () => {
    const verificationData = {
      documentHash,
      transactionHash,
      contractAddress,
      verificationURL,
      timestamp: Date.now(),
      metadata
    };

    const dataStr = JSON.stringify(verificationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.download = `verification-data-${documentHash?.substring(0, 8)}.json`;
    link.href = URL.createObjectURL(dataBlob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📥 Verification data downloaded successfully!');
  };

  if (!documentHash || !contractAddress) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">
            Document hash and contract address are required to generate QR code
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6"
    >
      <div className="text-center mb-6">
        <QrCodeIcon className="h-12 w-12 text-[#296CFF] mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">
          Document Verification QR Code
        </h3>
        <p className="text-[#B0B0B0]">
          Scan this QR code to verify the document authenticity
        </p>
      </div>

      {isGenerating ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating QR Code...</span>
        </div>
      ) : qrCodeDataURL ? (
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
              <img
                src={qrCodeDataURL}
                alt="Document Verification QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* Verification URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E0E0E0]">
              Verification URL
            </label>
            <div className="flex">
              <input
                type="text"
                value={verificationURL}
                readOnly
                className="flex-1 px-3 py-2 border border-[#444444] rounded-l-lg bg-[#2A2A2A] text-[#E0E0E0] text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={downloadQRCode}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download QR Code
            </button>

            <button
              onClick={downloadVerificationData}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download Data
            </button>
          </div>

          {/* Document Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">Document Information</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Document Hash:</span>
                <div className="font-mono text-gray-600 break-all">
                  {documentHash?.substring(0, 20)}...
                </div>
              </div>

              {transactionHash && (
                <div>
                  <span className="font-medium text-gray-700">Transaction Hash:</span>
                  <div className="font-mono text-gray-600 break-all">
                    {transactionHash?.substring(0, 20)}...
                  </div>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Contract Address:</span>
                <div className="font-mono text-gray-600 break-all">
                  {contractAddress?.substring(0, 20)}...
                </div>
              </div>

              {metadata.documentType && (
                <div>
                  <span className="font-medium text-gray-700">Document Type:</span>
                  <div className="text-gray-600">{metadata.documentType}</div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How to Use</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Embed this QR code in your document</li>
              <li>• Third parties can scan it to verify authenticity</li>
              <li>• Verification works without accessing your servers</li>
              <li>• All data is verified directly from the blockchain</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to generate QR code</p>
          <button
            onClick={generateQRCode}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default QRCodeGenerator;
