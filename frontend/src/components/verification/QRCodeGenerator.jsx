import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { 
  QrCodeIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  SparklesIcon,
  HashtagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';

const QRCodeGenerator = ({ hash, metadata }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (hash) {
      generateQRCode();
    }
  }, [hash]);

  const generateQRCode = async () => {
    if (!hash) {
      toast.error('❌ No hash provided for QR code generation');
      return;
    }

    setIsGenerating(true);
    try {
      const qrData = JSON.stringify({
        hash,
        metadata,
        timestamp: Date.now(),
        type: 'document-verification',
        version: '1.0'
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#296CFF',  // Electric blue for QR code
          light: '#1A1A1A'  // Dark background
        },
        errorCorrectionLevel: 'M',
        type: 'image/png'
      });

      setQrCodeUrl(qrUrl);
      toast.success('📱 QR code generated successfully!', {
        icon: '🔲'
      });
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('❌ Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) {
      toast.error('❌ No QR code to download');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `document-qr-${hash.substring(0, 8)}.png`;
    link.click();
    toast.success('💾 QR code downloaded!', {
      icon: '💾'
    });
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(hash).then(() => {
      toast.success('📋 Hash copied to clipboard!', {
        icon: '📋'
      });
    }).catch(() => {
      toast.error('❌ Failed to copy hash');
    });
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) {
      toast.error('❌ No QR code to share');
      return;
    }

    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `document-qr-${hash.substring(0, 8)}.png`, { type: 'image/png' });

        await navigator.share({
          title: 'Document Verification QR Code',
          text: 'Scan this QR code to verify the document',
          files: [file]
        });
      } catch (error) {
        // Fallback to copying hash
        copyHashToClipboard();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyHashToClipboard();
    }
  };

  if (!hash) {
    return (
      <div className="text-center p-6 text-[#666666]">
        <QrCodeIcon className="w-12 h-12 mx-auto mb-2" />
        <p className="text-sm">No hash available for QR code generation</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] border border-[#333333] rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center space-x-2 mb-6">
        <QrCodeIcon className="w-5 h-5 text-[#296CFF]" />
        <h3 className="text-lg font-semibold text-white">Document QR Code</h3>
        <div className="px-2 py-1 bg-[#296CFF]/10 text-[#296CFF] text-xs font-medium rounded border border-[#296CFF]/30">
          Verification
        </div>
      </div>
      
      <div className="text-center">
        {isGenerating ? (
          <div className="w-64 h-64 mx-auto bg-[#0D0D0D] rounded-xl flex items-center justify-center border-2 border-[#296CFF]/30">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-[#296CFF] border-t-transparent rounded-full mx-auto mb-3"
              />
              <p className="text-sm text-[#296CFF] font-medium">Generating QR Code...</p>
            </div>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative inline-block"
            >
              <img 
                src={qrCodeUrl} 
                alt="Document QR Code"
                className="w-64 h-64 mx-auto border-2 border-[#296CFF] rounded-xl shadow-lg shadow-[#296CFF]/20"
              />
              <div className="absolute top-2 right-2 p-1 bg-[#296CFF] rounded-full">
                <SparklesIcon className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            
            {/* QR Info */}
            <div className="bg-[#296CFF]/10 border border-[#296CFF]/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-[#296CFF] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-[#296CFF] font-medium mb-1">
                    Verification Instructions
                  </p>
                  <p className="text-xs text-[#E0E0E0]">
                    Scan this QR code with any QR reader to quickly access document verification data. 
                    Contains encrypted hash and metadata for secure verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={downloadQRCode} 
                  size="sm" 
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={copyHashToClipboard} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  <span>Copy Hash</span>
                </Button>
              </motion.div>
            </div>

            {/* Hash Preview */}
            <div className="bg-[#0D0D0D] rounded-lg p-3 border border-[#333333]">
              <div className="flex items-center space-x-2 mb-2">
                <HashtagIcon className="w-3 h-3 text-[#8B5CF6]" />
                <span className="text-xs font-medium text-[#8B5CF6]">Document Hash</span>
              </div>
              <code className="text-xs font-mono text-[#E0E0E0] break-all">
                {hash.substring(0, 32)}...{hash.substring(hash.length - 8)}
              </code>
            </div>
          </div>
        ) : (
          <div className="w-64 h-64 mx-auto bg-[#0D0D0D] rounded-xl flex items-center justify-center border-2 border-dashed border-[#333333] hover:border-[#296CFF] transition-colors duration-300">
            <div className="text-center">
              <QrCodeIcon className="w-12 h-12 text-[#666666] mx-auto mb-3" />
              <Button 
                onClick={generateQRCode} 
                variant="primary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Generate QR Code</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Info */}
      {metadata && (
        <div className="mt-6 pt-4 border-t border-[#333333]">
          <h4 className="text-sm font-medium text-[#E0E0E0] mb-2">QR Code Contains:</h4>
          <div className="text-xs text-[#999999] space-y-1">
            <div>• Document hash for verification</div>
            <div>• Upload metadata and timestamp</div>
            <div>• Verification type identifier</div>
            <div>• Error correction for reliable scanning</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QRCodeGenerator;
