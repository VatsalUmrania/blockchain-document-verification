import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      // Check if the browser supports the camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      // Simulate QR code scanning (in a real app, you'd use a QR scanning library)
      toast.info('QR Scanner ready! Point camera at QR code');
      
      // For demo purposes, we'll simulate a scan after 3 seconds
      setTimeout(() => {
        const mockHash = '0x' + Math.random().toString(16).substr(2, 64);
        onScan(mockHash);
        stream.getTracks().forEach(track => track.stop());
        toast.success('QR code scanned successfully!');
      }, 3000);

    } catch (error) {
      console.error('Scanner error:', error);
      setError(error.message);
      toast.error(`Scanner error: ${error.message}`);
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    onClose();
  };

  return (
    <Modal isOpen onClose={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md mx-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => setError(null)} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            {!isScanning ? (
              <>
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500">QR Code</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Click to start scanning QR codes
                </p>
                <Button onClick={startScanning}>
                  Start Scanner
                </Button>
              </>
            ) : (
              <>
                <div className="w-32 h-32 border-4 border-primary-500 rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <span className="text-primary-500">Scanning...</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Point your camera at the QR code
                </p>
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a demo scanner. In production, you would integrate with a real QR code scanning library like `react-qr-scanner` or `qr-scanner`.
          </p>
        </div>
      </motion.div>
    </Modal>
  );
};

export default QRCodeScanner;
