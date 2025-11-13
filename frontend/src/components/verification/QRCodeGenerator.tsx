import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Download,
  Share,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Import cn

// Types and Interfaces
interface QRCodeData {
  hash: string;
  metadata?: Record<string, any>;
  timestamp: number;
  type: string;
  version: string;
}

interface QRCodeGeneratorProps {
  hash: string;
  metadata?: Record<string, any>;
  className?: string;
}

interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  type: 'image/png' | 'image/jpeg';
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  hash, 
  metadata,
  className 
}) => {
  // State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true); // Start generating immediately
  const [error, setError] = useState<string | null>(null);

  // Generate QR code
  const generateQRCode = useCallback(async (): Promise<void> => {
    if (!hash) {
      const errorMsg = 'No hash provided';
      setError(errorMsg);
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const qrData: QRCodeData = {
        hash,
        metadata: metadata || {},
        timestamp: Date.now(),
        type: 'document-verification',
        version: '1.0'
      };

      // [MODIFIED] Get theme colors from CSS variables
      const rootStyles = getComputedStyle(document.documentElement);
      const fgColor = rootStyles.getPropertyValue('--foreground').trim() || 'oklch(0.21 0.006 285.87)';
      const bgColor = rootStyles.getPropertyValue('--background').trim() || 'oklch(1 0 0)';

      const qrOptions: QRCodeOptions = {
        width: 280,
        margin: 2,
        color: {
          dark: fgColor,  // Use foreground color
          light: bgColor, // Use background color
        },
        errorCorrectionLevel: 'M',
        type: 'image/png'
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions);
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      console.error('QR generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [hash, metadata]);

  // Generate QR code when hash changes
  useEffect(() => {
    if (hash) {
      generateQRCode();
    } else {
      setIsGenerating(false);
      setError('No hash provided');
      setQrCodeUrl('');
    }
  }, [hash, generateQRCode]);

  // Download QR code
  const downloadQRCode = useCallback((): void => {
    if (!qrCodeUrl) {
      toast.error('Download Failed', {
        description: 'No QR code to download',
      });
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `document-qr-${hash.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Downloaded', {
      description: 'QR code downloaded successfully',
    });
  }, [qrCodeUrl, hash]);

  // Share QR code
  const shareQRCode = useCallback(async (): Promise<void> => {
    if (!qrCodeUrl) {
      toast.error('Share Failed', {
        description: 'No QR code to share',
      });
      return;
    }

    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `document-qr-${hash.substring(0, 8)}.png`, { 
          type: 'image/png' 
        });

        await navigator.share({
          title: 'Document Verification QR Code',
          text: 'Scan this QR code to verify the document',
          files: [file]
        });

        toast.success('QR Shared', {
          description: 'QR code shared successfully',
        });
      } catch (error) {
        console.error('Share failed:', error);
        toast.error('Share Failed', {
          description: 'Could not share the QR code.',
        });
      }
    } else {
      toast.error('Share Not Supported', {
        description: 'Your browser does not support the Web Share API.',
      });
    }
  }, [qrCodeUrl, hash]);

  // If no hash provided
  if (!hash) {
    return (
      <Card className={className}>
        <CardContent className="text-center p-6 h-[300px] flex flex-col justify-center items-center">
          <QrCode className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hash provided
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span>Document QR Code</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Verification
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center min-h-[280px]">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-4"
                >
                  <p className="text-sm text-destructive">{error}</p>
                  <Button 
                    onClick={generateQRCode} 
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </motion.div>
              ) : qrCodeUrl ? (
                <motion.div
                  key="qr-code"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  {/* [MODIFIED] QR code is wrapped in bg-background */}
                  <div className="bg-background p-4 rounded-lg border">
                    <img 
                      src={qrCodeUrl} 
                      alt="Document QR Code"
                      className="w-64 h-64 shadow" // Removed border/rounded from img
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 ">
                    <Button 
                      onClick={downloadQRCode} 
                      size="sm"
                      className='text-accent-foreground'
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button 
                      onClick={shareQRCode} 
                      variant="outline" 
                      size="sm"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QRCodeGenerator;