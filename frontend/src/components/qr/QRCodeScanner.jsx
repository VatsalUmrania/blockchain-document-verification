// import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//   QrCodeIcon,
//   CameraIcon,
//   StopIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   XCircleIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-toastify';
// import BlockchainService from '../../services/blockchainService';
// import { useWeb3 } from '../../context/Web3Context';

// const QRCodeScanner = ({ onVerificationComplete = null }) => {
//   const [isScanning, setIsScanning] = useState(false);
//   const [hasCamera, setHasCamera] = useState(false);
//   const [stream, setStream] = useState(null);
//   const [verificationResult, setVerificationResult] = useState(null);
//   const [isVerifying, setIsVerifying] = useState(false);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const scanIntervalRef = useRef(null);

//   const { provider, isConnected } = useWeb3();

//   // Check camera availability
//   useEffect(() => {
//     checkCameraAvailability();
//     return () => {
//       stopScanning();
//     };
//   }, []);

//   const checkCameraAvailability = async () => {
//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
//       setHasCamera(videoDevices.length > 0);
//     } catch (error) {
//       console.error('Error checking camera availability:', error);
//       setHasCamera(false);
//     }
//   };

//   // Start camera and scanning
//   const startScanning = async () => {
//     if (!hasCamera) {
//       toast.error('❌ No camera available');
//       return;
//     }

//     if (!isConnected) {
//       toast.error('❌ Please connect your wallet first');
//       return;
//     }

//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: 'environment', // Use back camera if available
//           width: { ideal: 640 },
//           height: { ideal: 480 }
//         }
//       });

//       setStream(mediaStream);
//       setIsScanning(true);

//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//         videoRef.current.play();

//         // Start scanning for QR codes
//         scanIntervalRef.current = setInterval(scanForQRCode, 1000);
//       }

//       toast.success('📷 Camera started. Point at a QR code to scan.');
//     } catch (error) {
//       console.error('Error starting camera:', error);
//       toast.error('❌ Failed to access camera');
//     }
//   };

//   // Stop camera and scanning
//   const stopScanning = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//     }

//     if (scanIntervalRef.current) {
//       clearInterval(scanIntervalRef.current);
//       scanIntervalRef.current = null;
//     }

//     setIsScanning(false);
//   };

//   // Scan for QR codes in video feed
//   const scanForQRCode = async () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');

//     // Set canvas size to match video
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     // Draw current video frame to canvas
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     try {
//       // Get image data from canvas
//       const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//       // Use a QR code library to decode (you'd need to install jsQR or similar)
//       // For now, we'll simulate QR code detection
//       // In a real implementation, you would use:
//       // const code = jsQR(imageData.data, imageData.width, imageData.height);

//       // Simulated QR code detection - replace with actual QR library
//       // if (code && code.data) {
//       //   await handleQRCodeDetected(code.data);
//       // }

//     } catch (error) {
//       console.error('Error scanning QR code:', error);
//     }
//   };

//   // Handle detected QR code
//   const handleQRCodeDetected = async (qrData) => {
//     stopScanning();
//     setIsVerifying(true);

//     try {
//       // Parse QR code data
//       let verificationData;

//       if (qrData.startsWith('http')) {
//         // Extract data from URL
//         const url = new URL(qrData);
//         const dataParam = url.searchParams.get('data');
//         if (dataParam) {
//           verificationData = JSON.parse(decodeURIComponent(dataParam));
//         } else {
//           throw new Error('Invalid QR code format');
//         }
//       } else {
//         // Direct JSON data
//         verificationData = JSON.parse(qrData);
//       }

//       // Validate verification data
//       if (!verificationData.documentHash || !verificationData.contractAddress) {
//         throw new Error('Invalid verification data');
//       }

//       // Initialize blockchain service
//       const blockchainService = new BlockchainService(provider, provider.getSigner());
//       await blockchainService.initialize(verificationData.contractAddress);

//       // Verify document on blockchain
//       const result = await blockchainService.verifyDocumentOnChain(verificationData.documentHash);

//       setVerificationResult(result);

//       if (onVerificationComplete) {
//         onVerificationComplete(result);
//       }

//       if (result.isValid) {
//         toast.success('✅ Document verified successfully!');
//       } else {
//         toast.warning('⚠️ Document verification failed');
//       }

//     } catch (error) {
//       console.error('❌ QR verification error:', error);
//       toast.error('❌ Failed to verify QR code: ' + error.message);

//       setVerificationResult({
//         isValid: false,
//         errors: [error.message]
//       });
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   // Manual QR data input for testing
//   const handleManualInput = async (qrData) => {
//     await handleQRCodeDetected(qrData);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6"
//     >
//       <div className="text-center mb-6">
//         <QrCodeIcon className="h-12 w-12 text-[#296CFF] mx-auto mb-3" />
//         <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">
//           QR Code Scanner
//         </h3>
//         <p className="text-[#B0B0B0]">
//           Scan a document verification QR code to check authenticity
//         </p>
//       </div>

//       {!hasCamera && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center">
//             <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
//             <span className="text-yellow-800">
//               Camera not available. Please ensure camera permissions are granted.
//             </span>
//           </div>
//         </div>
//       )}

//       {!isConnected && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center">
//             <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
//             <span className="text-red-800">
//               Please connect your wallet to verify documents.
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Camera Controls */}
//       <div className="space-y-4">
//         {!isScanning ? (
//           <button
//             onClick={startScanning}
//             disabled={!hasCamera || !isConnected}
//             className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             <CameraIcon className="h-5 w-5 mr-2" />
//             Start Camera
//           </button>
//         ) : (
//           <button
//             onClick={stopScanning}
//             className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//           >
//             <StopIcon className="h-5 w-5 mr-2" />
//             Stop Scanning
//           </button>
//         )}

//         {/* Camera Feed */}
//         {isScanning && (
//           <div className="relative">
//             <video
//               ref={videoRef}
//               className="w-full rounded-lg bg-black"
//               autoPlay
//               playsInline
//               muted
//             />
//             <canvas
//               ref={canvasRef}
//               className="hidden"
//             />

//             {/* Scanning Overlay */}
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-48 h-48 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
//                 <span className="text-blue-500 font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
//                   Point camera at QR code
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Verification Status */}
//         {isVerifying && (
//           <div className="flex items-center justify-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
//             <span className="text-gray-600">Verifying document...</span>
//           </div>
//         )}

//         {/* Verification Results */}
//         {verificationResult && (
//           <div className={`rounded-lg p-4 ${verificationResult.isValid
//             ? 'bg-green-50 border border-green-200'
//             : 'bg-red-50 border border-red-200'
//             }`}>
//             <div className="flex items-center mb-2">
//               {verificationResult.isValid ? (
//                 <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
//               ) : (
//                 <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
//               )}
//               <span className={`font-medium ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'
//                 }`}>
//                 {verificationResult.isValid ? 'Document Verified' : 'Verification Failed'}
//               </span>
//             </div>

//             {verificationResult.document && (
//               <div className="text-sm space-y-1">
//                 <div><strong>Type:</strong> {verificationResult.document.documentType}</div>
//                 <div><strong>Recipient:</strong> {verificationResult.document.recipientName}</div>
//                 <div><strong>Issuer:</strong> {verificationResult.document.issuerName}</div>
//               </div>
//             )}

//             {verificationResult.errors && verificationResult.errors.length > 0 && (
//               <div className="mt-2 text-sm text-red-700">
//                 <strong>Errors:</strong>
//                 <ul className="list-disc list-inside">
//                   {verificationResult.errors.map((error, index) => (
//                     <li key={index}>{error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Manual Input for Testing */}
//         <details className="mt-6">
//           <summary className="cursor-pointer text-sm text-[#B0B0B0] hover:text-[#E0E0E0]">
//             Manual QR Data Input (for testing)
//           </summary>
//           <div className="mt-2 space-y-2">
//             <textarea
//               placeholder="Paste QR code data here..."
//               className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] text-sm focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
//               rows={3}
//               onChange={(e) => {
//                 if (e.target.value.trim()) {
//                   handleManualInput(e.target.value.trim());
//                   e.target.value = '';
//                 }
//               }}
//             />
//           </div>
//         </details>
//       </div>
//     </motion.div>
//   );
// };

// export default QRCodeScanner;


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCodeIcon,
  CameraIcon,
  StopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BlockchainService from '../../services/blockchainService';
import { useWeb3 } from '../../context/Web3Context';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const QRCodeScanner = ({ onVerificationComplete = null }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const { provider, isConnected } = useWeb3();

  // Check camera availability
  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);
    } catch (error) {
      console.error('Error checking camera availability:', error);
      setHasCamera(false);
    }
  };

  // Start camera and scanning
  const startScanning = async () => {
    if (!hasCamera) {
      toast.error('❌ No camera available');
      return;
    }

    if (!isConnected) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      setStream(mediaStream);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();

        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(scanForQRCode, 1000);
      }

      toast.success('📷 Camera started. Point at a QR code to scan.');
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('❌ Failed to access camera');
    }
  };

  // Stop camera and scanning
  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    setIsScanning(false);
  };

  // Scan for QR codes in video feed
  const scanForQRCode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Use a QR code library to decode (you'd need to install jsQR or similar)
      // For now, we'll simulate QR code detection
      // In a real implementation, you would use:
      // const code = jsQR(imageData.data, imageData.width, imageData.height);

      // Simulated QR code detection - replace with actual QR library
      // if (code && code.data) {
      //   await handleQRCodeDetected(code.data);
      // }

    } catch (error) {
      console.error('Error scanning QR code:', error);
    }
  };

  // Handle detected QR code
  const handleQRCodeDetected = async (qrData) => {
    stopScanning();
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Parse QR code data
      let verificationData;

      if (qrData.startsWith('http')) {
        // Extract data from URL
        const url = new URL(qrData);
        const dataParam = url.searchParams.get('data');
        if (dataParam) {
          verificationData = JSON.parse(decodeURIComponent(dataParam));
        } else {
          throw new Error('Invalid QR code format');
        }
      } else {
        // Direct JSON data
        verificationData = JSON.parse(qrData);
      }

      // Validate verification data
      if (!verificationData.documentHash || !verificationData.contractAddress) {
        throw new Error('Invalid verification data');
      }

      // Initialize blockchain service
      const blockchainService = new BlockchainService(provider, provider.getSigner());
      await blockchainService.initialize(verificationData.contractAddress);

      // Verify document on blockchain
      const result = await blockchainService.verifyDocumentOnChain(verificationData.documentHash);

      setVerificationResult(result);

      if (onVerificationComplete) {
        onVerificationComplete(result);
      }

      if (result.isValid) {
        toast.success('✅ Document verified successfully!');
      } else {
        toast.warning('⚠️ Document verification failed');
      }

    } catch (error) {
      console.error('❌ QR verification error:', error);
      toast.error('❌ Failed to verify QR code: ' + error.message);

      setVerificationResult({
        isValid: false,
        errors: [error.message]
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Manual QR data input for testing
  const handleManualInput = async () => {
    if (!manualInput.trim()) {
      toast.error('❌ Please enter QR data');
      return;
    }

    await handleQRCodeDetected(manualInput.trim());
    setManualInput('');
  };

  // Clear results
  const clearResults = () => {
    setVerificationResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-full w-fit mx-auto mb-3 border border-[rgb(var(--color-primary)/0.3)]">
          <QrCodeIcon className="h-12 w-12 text-[rgb(var(--color-primary))]" />
        </div>
        <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
          QR Code Scanner
        </h3>
        <p className="text-[rgb(var(--text-secondary))]">
          Scan a document verification QR code to check authenticity
        </p>
      </div>

      {/* Status Alerts */}
      <AnimatePresence>
        {!hasCamera && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[rgb(var(--color-warning)/0.1)] border border-[rgb(var(--color-warning)/0.3)] rounded-lg p-4 mb-4"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-[rgb(var(--color-warning))] mr-2" />
              <span className="text-[rgb(var(--text-primary))]">
                Camera not available. Please ensure camera permissions are granted.
              </span>
            </div>
          </motion.div>
        )}

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[rgb(var(--color-error)/0.1)] border border-[rgb(var(--color-error)/0.3)] rounded-lg p-4 mb-4"
          >
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-[rgb(var(--color-error))] mr-2" />
              <span className="text-[rgb(var(--text-primary))]">
                Please connect your wallet to verify documents.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Controls */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              disabled={!hasCamera || !isConnected}
              variant="primary"
              icon={PlayIcon}
              className="flex-1 h-12"
            >
              Start Camera
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="danger"
              icon={StopIcon}
              className="flex-1 h-12"
            >
              Stop Scanning
            </Button>
          )}

          {verificationResult && (
            <Button
              onClick={clearResults}
              variant="secondary"
              size="sm"
              className="h-12"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Camera Feed */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black border border-[rgb(var(--border-primary))]"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-48 h-48 border-2 border-[rgb(var(--color-primary))] border-dashed rounded-lg flex items-center justify-center"
                >
                  <span className="text-[rgb(var(--color-primary))] font-medium bg-black/70 px-3 py-2 rounded-lg text-center">
                    Point camera at QR code
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Status */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <LoadingSpinner size="md" color="primary" text="Verifying document..." />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Results */}
        <AnimatePresence>
          {verificationResult && !isVerifying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl p-6 border-2 ${
                verificationResult.isValid
                  ? 'bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success)/0.3)]'
                  : 'bg-[rgb(var(--color-error)/0.1)] border-[rgb(var(--color-error)/0.3)]'
              }`}
            >
              <div className="flex items-center mb-4">
                {verificationResult.isValid ? (
                  <CheckCircleIcon className="h-6 w-6 text-[rgb(var(--color-success))] mr-3" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-[rgb(var(--color-error))] mr-3" />
                )}
                <span className={`font-semibold text-lg ${
                  verificationResult.isValid ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'
                }`}>
                  {verificationResult.isValid ? 'Document Verified ✅' : 'Verification Failed ❌'}
                </span>
              </div>

              {verificationResult.document && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-[rgb(var(--text-primary))]">Type:</span>
                    <div className="text-[rgb(var(--text-secondary))] mt-1 capitalize">
                      {verificationResult.document.documentType}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-[rgb(var(--text-primary))]">Recipient:</span>
                    <div className="text-[rgb(var(--text-secondary))] mt-1">
                      {verificationResult.document.recipientName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-[rgb(var(--text-primary))]">Issuer:</span>
                    <div className="text-[rgb(var(--text-secondary))] mt-1">
                      {verificationResult.document.issuerName}
                    </div>
                  </div>
                </div>
              )}

              {verificationResult.errors && verificationResult.errors.length > 0 && (
                <div className="mt-4 p-3 bg-[rgb(var(--color-error)/0.1)] border border-[rgb(var(--color-error)/0.3)] rounded-lg">
                  <div className="text-sm text-[rgb(var(--color-error))]">
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {verificationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Input for Testing */}
        <div className="mt-6 bg-[rgb(var(--surface-secondary))] rounded-xl p-4 border border-[rgb(var(--border-primary))]">
          <div className="flex items-center space-x-2 mb-3">
            <DocumentMagnifyingGlassIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            <h4 className="font-medium text-[rgb(var(--text-primary))]">Manual QR Data Input</h4>
            <span className="text-xs text-[rgb(var(--text-tertiary))] bg-[rgb(var(--surface-primary))] px-2 py-1 rounded">Testing</span>
          </div>
          <div className="space-y-3">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste QR code data or verification URL here..."
              className="input-field h-24 resize-none text-sm font-mono"
            />
            <Button
              onClick={handleManualInput}
              disabled={!manualInput.trim() || isVerifying}
              variant="secondary"
              size="sm"
              icon={DocumentMagnifyingGlassIcon}
              loading={isVerifying}
            >
              Verify QR Data
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QRCodeScanner;
