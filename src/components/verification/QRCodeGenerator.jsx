import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
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
      toast.error('No hash provided for QR code generation');
      return;
    }

    setIsGenerating(true);
    try {
      const qrData = JSON.stringify({
        hash,
        metadata,
        timestamp: Date.now(),
        type: 'document-verification'
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrUrl);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) {
      toast.error('No QR code to download');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `document-qr-${hash.substring(0, 8)}.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(hash).then(() => {
      toast.success('Hash copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy hash');
    });
  };

  if (!hash) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg font-semibold mb-4">Document QR Code</h3>
      
      <div className="text-center">
        {isGenerating ? (
          <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            <img 
              src={qrCodeUrl} 
              alt="Document QR Code"
              className="w-64 h-64 mx-auto border rounded-lg shadow-sm"
            />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Scan this QR code to quickly verify the document
              </p>
              <div className="flex space-x-2 justify-center">
                <Button onClick={downloadQRCode} size="sm">
                  Download QR
                </Button>
                <Button onClick={copyHashToClipboard} variant="outline" size="sm">
                  Copy Hash
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <Button onClick={generateQRCode}>Generate QR Code</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QRCodeGenerator;
