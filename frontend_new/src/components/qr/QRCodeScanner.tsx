import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Square,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Loader2,
  Video,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import BlockchainService from '../../services/blockchainService';
import { useWeb3 } from '../../context/Web3Context';
import { VerificationResult } from '../../types/document.types';
// Note: You'll need to install jsqr for QR code detection
// npm install jsqr @types/jsqr
import jsQR from 'jsqr';

// Types and Interfaces
interface VerificationData {
  documentHash: string;
  transactionHash?: string;
  contractAddress: string;
  timestamp: number;
  version: string;
  network: string;
  metadata: {
    documentType: string;
    issuer: string;
    recipient: string;
    issuanceDate: number | string;
  };
}

interface QRCodeScannerProps {
  onVerificationComplete?: (result: VerificationResult) => void;
  className?: string;
}

interface CameraConstraints {
  video: {
    facingMode: string;
    width: { ideal: number };
    height: { ideal: number };
  };
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ 
  onVerificationComplete,
  className 
}) => {
  // State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web3 Context
  const { provider, isConnected } = useWeb3();

  // Check camera availability on mount
  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopScanning();
    };
  }, []);

  // Check camera availability
  const checkCameraAvailability = useCallback(async (): Promise<void> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);
      setCameraError(null);
    } catch (error) {
      console.error('Error checking camera availability:', error);
      setHasCamera(false);
      setCameraError('Unable to access camera devices');
    }
  }, []);

  // Start camera and scanning
  const startScanning = useCallback(async (): Promise<void> => {
    if (!hasCamera) {
      toast.error('Camera Unavailable', {
        description: 'No camera available on this device',
      });
      return;
    }

    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    try {
      setCameraError(null);
      const constraints: CameraConstraints = {
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();

        // Start scanning for QR codes
        scanIntervalRef.current = setInterval(scanForQRCode, 1000);
      }

      toast.success('Camera Started', {
        description: 'Point camera at a QR code to scan',
      });
    } catch (error) {
      console.error('Error starting camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
      setCameraError(errorMessage);
      toast.error('Camera Error', {
        description: errorMessage,
      });
    }
  }, [hasCamera, isConnected]);

  // Stop camera and scanning
  const stopScanning = useCallback((): void => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    setIsScanning(false);
    setCameraError(null);
  }, [stream]);

  // Scan for QR codes in video feed
  const scanForQRCode = useCallback(async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Use jsQR to decode QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        await handleQRCodeDetected(code.data);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    }
  }, [isScanning]);

  // Handle detected QR code
  const handleQRCodeDetected = useCallback(async (qrData: string): Promise<void> => {
    stopScanning();
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Parse QR code data
      let verificationData: VerificationData;

      if (qrData.startsWith('http')) {
        // Extract data from URL
        const url = new URL(qrData);
        const dataParam = url.searchParams.get('data');
        if (dataParam) {
          verificationData = JSON.parse(decodeURIComponent(dataParam));
        } else {
          throw new Error('Invalid QR code format - no verification data found');
        }
      } else {
        // Direct JSON data
        verificationData = JSON.parse(qrData);
      }

      // Validate verification data
      if (!verificationData.documentHash || !verificationData.contractAddress) {
        throw new Error('Invalid verification data - missing required fields');
      }

      // Initialize blockchain service
      if (!provider) {
        throw new Error('Blockchain provider not available');
      }

      const blockchainService = new BlockchainService(provider, await provider.getSigner());
      await blockchainService.initialize(verificationData.contractAddress);

      // Verify document on blockchain
      const result = await blockchainService.verifyDocumentOnChain(verificationData.documentHash);

      setVerificationResult(result);

      if (onVerificationComplete) {
        onVerificationComplete(result);
      }

      if (result.isValid) {
        toast.success('Document Verified', {
          description: 'Document verification successful!',
        });
      } else {
        toast.warning('Verification Failed', {
          description: 'Document verification failed',
        });
      }

    } catch (error) {
      console.error('QR verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown verification error';
      
      const failedResult: VerificationResult = new VerificationResult({
        isValid: false,
        errors: [errorMessage]
      });

      setVerificationResult(failedResult);
      
      toast.error('Verification Error', {
        description: errorMessage,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [stopScanning, provider, onVerificationComplete]);

  // Manual QR data input for testing
  const handleManualInput = useCallback(async (): Promise<void> => {
    if (!manualInput.trim()) {
      toast.error('Input Required', {
        description: 'Please enter QR data to verify',
      });
      return;
    }

    await handleQRCodeDetected(manualInput.trim());
    setManualInput('');
  }, [manualInput, handleQRCodeDetected]);

  // Clear results
  const clearResults = useCallback((): void => {
    setVerificationResult(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card>
        <CardHeader className="text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3 border border-primary/30">
            <QrCode className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-xl">QR Code Scanner</CardTitle>
          <p className="text-muted-foreground">
            Scan a document verification QR code to check authenticity
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Alerts */}
          <div className="space-y-4">
            {!hasCamera && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Camera not available. Please ensure camera permissions are granted and try refreshing the page.
                </AlertDescription>
              </Alert>
            )}

            {!isConnected && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your wallet to verify documents on the blockchain.
                </AlertDescription>
              </Alert>
            )}

            {cameraError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Camera Error: {cameraError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Camera Controls */}
          <div className="space-y-4">
            <div className="flex gap-4">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  disabled={!hasCamera || !isConnected}
                  className="flex-1 h-12"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex-1 h-12"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              )}

              {verificationResult && (
                <Button
                  onClick={clearResults}
                  variant="outline"
                  className="h-12"
                >
                  Clear Results
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
                    className="w-full rounded-lg bg-black border"
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
                      className="w-48 h-48 border-2 border-primary border-dashed rounded-lg flex items-center justify-center"
                    >
                      <div className="text-primary font-medium bg-black/70 px-3 py-2 rounded-lg text-center text-sm">
                        Point camera at QR code
                      </div>
                    </motion.div>
                  </div>

                  {/* Camera Status */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="default" className="bg-green-600">
                      <Video className="w-3 h-3 mr-1" />
                      Scanning
                    </Badge>
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
                  className="flex flex-col items-center justify-center py-8 space-y-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Verifying document on blockchain...</p>
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
                >
                  <Alert 
                    variant={verificationResult.isValid ? "default" : "destructive"}
                    className={cn(
                      "border-2",
                      verificationResult.isValid 
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" 
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    )}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <span className={cn(
                            "font-semibold text-lg",
                            verificationResult.isValid ? "text-green-600" : "text-red-600"
                          )}>
                            {verificationResult.isValid ? 'Document Verified ✅' : 'Verification Failed ❌'}
                          </span>
                        </div>

                        {verificationResult.document && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                              <Badge variant="secondary" className="mt-1 capitalize">
                                {verificationResult.document.documentType}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Recipient</Label>
                              <p className="text-foreground mt-1">{verificationResult.document.recipientName}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Issuer</Label>
                              <p className="text-foreground mt-1">{verificationResult.document.issuerName}</p>
                            </div>
                          </div>
                        )}

                        {verificationResult.errors && verificationResult.errors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-2">
                                <strong>Verification Errors:</strong>
                                <ul className="list-disc list-inside space-y-1">
                                  {verificationResult.errors.map((error, index) => (
                                    <li key={index} className="text-sm">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator />

            {/* Manual Input for Testing */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Search className="w-5 h-5 text-primary" />
                  <span>Manual QR Data Input</span>
                  <Badge variant="outline" className="text-xs">Testing</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manualInput">QR Code Data or Verification URL</Label>
                  <Textarea
                    id="manualInput"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste QR code data or verification URL here..."
                    className="min-h-24 resize-none font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={handleManualInput}
                  disabled={!manualInput.trim() || isVerifying}
                  variant="outline"
                  className="w-full"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Verify QR Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QRCodeScanner;
