import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { 
  QrCodeIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  SparklesIcon,
  HashtagIcon,
  InformationCircleIcon,
  ShareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import HashDisplay from '../common/HashDisplay';

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
        width: 280,
        margin: 2,
        color: {
          dark: '#1A1A1A',  // Theme-aware dark color
          light: '#FFFFFF'  // White background for better contrast
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

        toast.success('📤 QR code shared successfully!');
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
      <div className="text-center p-6 text-[rgb(var(--text-quaternary))]">
        <QrCodeIcon className="w-12 h-12 mx-auto mb-2" />
        <p className="text-sm">No hash available for QR code generation</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
            <QrCodeIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Document QR Code</h3>
        </div>
        <div className="px-3 py-1 bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] text-xs font-medium rounded-full border border-[rgb(var(--color-primary)/0.3)]">
          Verification
        </div>
      </div>
      
      <div className="text-center">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-72 h-72 mx-auto bg-[rgb(var(--surface-secondary))] rounded-xl flex items-center justify-center border-2 border-[rgb(var(--color-primary)/0.3)]"
            >
              <LoadingSpinner size="lg" color="primary" text="Generating QR Code..." />
            </motion.div>
          ) : qrCodeUrl ? (
            <motion.div
              key="qr-code"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="space-y-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative inline-block"
              >
                <img 
                  src={qrCodeUrl} 
                  alt="Document QR Code"
                  className="w-72 h-72 mx-auto border-2 border-[rgb(var(--color-primary))] rounded-xl shadow-xl"
                  style={{
                    boxShadow: `0 0 20px rgba(var(--color-primary), 0.3)`
                  }}
                />
                <div className="absolute top-3 right-3 p-2 bg-[rgb(var(--color-primary))] rounded-full">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              
              {/* QR Info */}
              <div className="bg-[rgb(var(--color-primary)/0.1)] border border-[rgb(var(--color-primary)/0.3)] rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-[rgb(var(--color-primary))] font-medium mb-2">
                      Verification Instructions
                    </p>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">
                      Scan this QR code with any QR reader to quickly access document verification data. 
                      Contains encrypted hash and metadata for secure verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  onClick={downloadQRCode} 
                  size="sm" 
                  variant="primary"
                  icon={ArrowDownTrayIcon}
                >
                  Download
                </Button>
                
                <Button 
                  onClick={shareQRCode} 
                  variant="secondary" 
                  size="sm"
                  icon={ShareIcon}
                >
                  Share
                </Button>

                <Button 
                  onClick={copyHashToClipboard} 
                  variant="secondary" 
                  size="sm"
                  icon={ClipboardIcon}
                >
                  Copy Hash
                </Button>

                <Button 
                  onClick={generateQRCode} 
                  variant="ghost" 
                  size="sm"
                  icon={ArrowPathIcon}
                  title="Regenerate QR Code"
                >
                  Regenerate
                </Button>
              </div>

              {/* Hash Preview */}
              <div className="bg-[rgb(var(--surface-secondary))] rounded-xl p-4 border border-[rgb(var(--border-primary))]">
                <div className="flex items-center space-x-2 mb-3">
                  <HashtagIcon className="w-4 h-4 text-[rgb(139,92,246)]" />
                  <span className="text-sm font-medium text-[rgb(139,92,246)]">Document Hash</span>
                </div>
                <HashDisplay 
                  hash={hash}
                  variant="compact"
                  showLabel={false}
                  size="sm"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="generate-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-72 h-72 mx-auto bg-[rgb(var(--surface-secondary))] rounded-xl flex items-center justify-center border-2 border-dashed border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))] transition-colors duration-300"
            >
              <div className="text-center">
                <QrCodeIcon className="w-16 h-16 text-[rgb(var(--text-quaternary))] mx-auto mb-4" />
                <Button 
                  onClick={generateQRCode} 
                  variant="primary"
                  size="sm"
                  icon={SparklesIcon}
                >
                  Generate QR Code
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metadata Info */}
      {metadata && qrCodeUrl && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-[rgb(var(--border-primary))]"
        >
          <h4 className="text-sm font-medium text-[rgb(var(--text-primary))] mb-3 flex items-center space-x-2">
            <InformationCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            <span>QR Code Contains:</span>
          </h4>
          <div className="text-xs text-[rgb(var(--text-secondary))] space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[rgb(var(--color-primary))] font-bold">•</span>
              <span>Document hash for verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[rgb(var(--color-primary))] font-bold">•</span>
              <span>Upload metadata and timestamp</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[rgb(var(--color-primary))] font-bold">•</span>
              <span>Verification type identifier</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[rgb(var(--color-primary))] font-bold">•</span>
              <span>Error correction for reliable scanning</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QRCodeGenerator;
