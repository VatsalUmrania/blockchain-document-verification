import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  XMarkIcon,
  QrCodeIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScanProgress(0);
      
      // Check if the browser supports the camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      // Simulate QR code scanning with progress
      toast.info('📷 QR Scanner ready! Point camera at QR code', {
        icon: '📷'
      });
      
      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      // For demo purposes, simulate a scan after 3 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        const mockQRData = {
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          timestamp: Date.now(),
          type: 'document-verification',
          metadata: {
            uploader: '0x' + Math.random().toString(16).substr(2, 40),
            category: 'document',
            status: 'pending'
          }
        };
        
        onScan(mockQRData);
        stream.getTracks().forEach(track => track.stop());
        toast.success('✅ QR code scanned successfully!', {
          icon: '📱'
        });
        setIsScanning(false);
      }, 3000);

    } catch (error) {
      console.error('Scanner error:', error);
      setError(error.message);
      setIsScanning(false);
      setScanProgress(0);
      toast.error(`❌ Scanner error: ${error.message}`);
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    setScanProgress(0);
    onClose();
  };

  const tryAgain = () => {
    setError(null);
    setScanProgress(0);
  };

  return (
    <Modal isOpen onClose={handleClose} size="md" title="QR Code Scanner">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6"
      >
        {error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#FF4C4C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-[#FF4C4C]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scanner Error</h3>
            <p className="text-[#FF4C4C] mb-6 bg-[#FF4C4C]/10 p-3 rounded-lg border border-[#FF4C4C]/30">
              {error}
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={tryAgain} variant="primary" className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            {!isScanning ? (
              <>
                <div className="w-32 h-32 border-2 border-dashed border-[#333333] hover:border-[#296CFF] rounded-xl mx-auto mb-6 flex items-center justify-center transition-colors duration-300 bg-[#121212]">
                  <QrCodeIcon className="w-12 h-12 text-[#666666]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Scan</h3>
                <p className="text-[#CCCCCC] mb-6">
                  Click below to activate your camera and scan QR codes for document verification
                </p>
                <Button 
                  onClick={startScanning}
                  variant="primary"
                  className="flex items-center space-x-2 mx-auto"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>Start Camera Scanner</span>
                </Button>
              </>
            ) : (
              <>
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-32 h-32 border-4 border-[#296CFF] rounded-xl flex items-center justify-center bg-[#296CFF]/10 relative overflow-hidden">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <EyeIcon className="w-8 h-8 text-[#296CFF]" />
                    </motion.div>
                    
                    {/* Scanning line effect */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-0.5 bg-[#00C853]"
                      animate={{ y: [0, 128, 0] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  </div>
                  
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#296CFF]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#296CFF]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#296CFF]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#296CFF]" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">Scanning...</h3>
                <p className="text-[#296CFF] mb-4 font-medium">
                  Point your camera at the QR code
                </p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-xs mx-auto mb-6">
                  <div className="flex justify-between text-sm text-[#999999] mb-2">
                    <span>Scanning Progress</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-[#333333] rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-[#296CFF] to-[#00C853] h-2 rounded-full transition-all duration-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleClose} 
                  variant="outline"
                  className="flex items-center space-x-2 mx-auto"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancel Scan</span>
                </Button>
              </>
            )}
          </div>
        )}

        {/* Information Card */}
        <div className="mt-6 p-4 bg-[#296CFF]/10 rounded-xl border border-[#296CFF]/30">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-[#296CFF] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#296CFF] mb-1">
                Demo Scanner Information
              </p>
              <p className="text-xs text-[#E0E0E0]">
                This is a demonstration scanner. In production, integrate with a real QR scanning library 
                like <code className="bg-[#121212] px-1 rounded">react-qr-scanner</code> or 
                <code className="bg-[#121212] px-1 rounded ml-1">qr-scanner</code> for actual camera functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Scanner Features */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-[#121212] rounded-lg border border-[#333333]">
            <CameraIcon className="w-6 h-6 text-[#00C853] mx-auto mb-1" />
            <p className="text-xs text-[#999999]">Camera Access</p>
          </div>
          <div className="p-3 bg-[#121212] rounded-lg border border-[#333333]">
            <QrCodeIcon className="w-6 h-6 text-[#296CFF] mx-auto mb-1" />
            <p className="text-xs text-[#999999]">QR Detection</p>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default QRCodeScanner;
