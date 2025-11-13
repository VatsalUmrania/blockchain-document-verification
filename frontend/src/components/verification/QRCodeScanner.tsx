import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Square,
  AlertTriangle,
  Info,
  Sparkles,
  Eye,
  Play,
  Loader2,
  Camera // [MODIFIED] Added Camera icon
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Types and Interfaces
interface QRScanData {
  hash: string;
  timestamp: number;
  type: string;
  metadata: {
    uploader: string;
    category: string;
    status: string;
    [key: string]: any;
  };
}

interface QRCodeScannerProps {
  onScan: (data: QRScanData) => void;
  onClose: () => void;
  isOpen?: boolean;
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
  onScan, 
  onClose,
  isOpen = true,
  className 
}) => {
  // State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  // Check camera permission
  const checkCameraPermission = useCallback(async (): Promise<void> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported by this browser');
        setHasPermission(false);
        return;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasPermission(videoDevices.length > 0);
    } catch (err) {
      console.error('Camera permission check error:', err);
      setError('Unable to access camera permissions');
      setHasPermission(false);
    }
  }, []);

  // Start scanning
  const startScanning = useCallback(async (): Promise<void> => {
    try {
      setIsScanning(true);
      setError(null);
      setScanProgress(0);
      
      const constraints: CameraConstraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      toast.success('Scanner Ready', {
        description: 'Point camera at QR code to scan',
      });
      
      // Simulate scanning progress
      progressIntervalRef.current = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      // Simulate scan result after 3 seconds
      setTimeout(() => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setScanProgress(100);
        
        const mockQRData: QRScanData = {
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
        stopScanning();
        toast.success('QR Code Scanned', {
          description: 'QR code scanned successfully',
        });
      }, 3000);

    } catch (error) {
      console.error('Scanner error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Camera access denied';
      setError(errorMessage);
      setIsScanning(false);
      setScanProgress(0);
      toast.error('Scanner Error', {
        description: errorMessage,
      });
    }
  }, [onScan]);

  // Stop scanning
  const stopScanning = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setIsScanning(false);
    setScanProgress(0);
  }, []);

  // Handle close
  const handleClose = useCallback((): void => {
    stopScanning();
    onClose();
  }, [stopScanning, onClose]);

  // Try again after error
  const tryAgain = useCallback((): void => {
    setError(null);
    setScanProgress(0);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("max-w-2xl", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-6"
        >
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">QR Code Scanner</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Scan document verification QR codes
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/30">
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Scanner Error</h4>
                  <Alert variant="destructive" className="max-w-md mx-auto mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  <div className="flex justify-center gap-3">
                    <Button onClick={tryAgain}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button onClick={handleClose} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : !isScanning ? (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className="w-40 h-40 border-2 border-dashed border-border hover:border-primary rounded-2xl mx-auto mb-6 flex items-center justify-center transition-colors duration-300 bg-muted">
                    <QrCode className="w-20 h-20 text-muted-foreground" />
                  </div>
                  <h4 className="text-2xl font-semibold mb-3">Ready to Scan</h4>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Click below to activate your camera and scan QR codes for document verification
                  </p>
                  <Button 
                    onClick={startScanning}
                    size="lg"
                    disabled={hasPermission === false}
                    className="h-14 px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {hasPermission === false ? 'Camera Not Available' : 'Start Camera Scanner'}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className="relative w-64 h-64 mx-auto mb-6">
                    <video
                      ref={videoRef}
                      className="w-full h-full rounded-2xl bg-black object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 border-4 border-primary rounded-2xl flex items-center justify-center overflow-hidden">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      >
                        <Eye className="w-12 h-12 text-primary" />
                      </motion.div>
                      
                      {/* [MODIFIED] Scanning line effect */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-1 bg-primary"
                        animate={{ y: [0, 256, 0] }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                      
                      {/* Corner brackets */}
                      <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary" />
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-semibold mb-2">Scanning...</h4>
                  <p className="text-primary mb-6 font-medium">
                    Point your camera at the QR code
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-sm mx-auto mb-8 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Scanning Progress</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} className="h-3" />
                  </div>
                  
                  <Button 
                    onClick={stopScanning} 
                    variant="destructive"
                    className="h-12 px-6"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Scanning
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Information Card */}
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Demo Scanner Information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This is a demonstration scanner. In production, integrate with a real QR scanning library 
                    like <code className="bg-muted px-1 py-0.5 rounded text-primary">react-qr-scanner</code> or{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-primary">qr-scanner</code> for actual camera functionality.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* [MODIFIED] Scanner Features (using theme colors) */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Camera Access</p>
                  <p className="text-xs text-muted-foreground">Real-time scanning</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <QrCode className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">QR Detection</p>
                  <p className="text-xs text-muted-foreground">Auto recognition</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;