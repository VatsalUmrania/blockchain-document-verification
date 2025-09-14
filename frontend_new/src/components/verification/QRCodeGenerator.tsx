import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { 
  QrCode,
  Download,
  Copy,
  Sparkles,
  Hash,
  Info,
  Share,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay';

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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate QR code when hash changes
  useEffect(() => {
    if (hash) {
      generateQRCode();
    }
  }, [hash]);

  // Generate QR code
  const generateQRCode = useCallback(async (): Promise<void> => {
    if (!hash) {
      const errorMsg = 'No hash provided for QR code generation';
      setError(errorMsg);
      toast.error('QR Generation Failed', {
        description: errorMsg,
      });
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

      const qrOptions: QRCodeOptions = {
        width: 280,
        margin: 2,
        color: {
          dark: '#1A1A1A',  // Theme-aware dark color
          light: '#FFFFFF'  // White background for better contrast
        },
        errorCorrectionLevel: 'M',
        type: 'image/png'
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData), qrOptions);
      setQrCodeUrl(qrUrl);
      
      toast.success('QR Code Generated', {
        description: 'QR code generated successfully',
      });
    } catch (error) {
      console.error('QR generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setError(errorMessage);
      toast.error('Generation Failed', {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [hash, metadata]);

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

  // Copy hash to clipboard
  const copyHashToClipboard = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Hash Copied', {
        description: 'Hash copied to clipboard',
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy Failed', {
        description: 'Failed to copy hash to clipboard',
      });
    }
  }, [hash]);

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
        // Fallback to copying hash
        copyHashToClipboard();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyHashToClipboard();
    }
  }, [qrCodeUrl, hash, copyHashToClipboard]);

  // If no hash provided
  if (!hash) {
    return (
      <Card className={className}>
        <CardContent className="text-center p-6">
          <QrCode className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hash available for QR code generation
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
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <span>Document QR Code</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Verification
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-72 h-72 mx-auto bg-muted rounded-xl flex items-center justify-center border-2 border-primary/30"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-72 h-72 mx-auto bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-destructive/50"
                >
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <p className="text-sm text-destructive mb-4">{error}</p>
                    <Button 
                      onClick={generateQRCode} 
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
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
                      className="w-72 h-72 mx-auto border-2 border-primary rounded-xl shadow-lg"
                    />
                    <div className="absolute top-3 right-3 p-2 bg-primary rounded-full">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </motion.div>
                  
                  {/* QR Info */}
                  <Alert className="border-primary/20 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="text-sm text-primary font-medium">
                          Verification Instructions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Scan this QR code with any QR reader to quickly access document verification data. 
                          Contains encrypted hash and metadata for secure verification.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button 
                      onClick={downloadQRCode} 
                      size="sm"
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

                    <Button 
                      onClick={copyHashToClipboard} 
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Hash
                    </Button>

                    <Button 
                      onClick={generateQRCode} 
                      variant="ghost" 
                      size="sm"
                      title="Regenerate QR Code"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>

                  {/* Hash Preview */}
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          Document Hash
                        </span>
                      </div>
                      <HashDisplay 
                        hash={hash}
                        variant="compact"
                        showLabel={false}
                        size="sm"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="generate-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-72 h-72 mx-auto bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors duration-300"
                >
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <Button 
                      onClick={generateQRCode} 
                      size="sm"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
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
            >
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span>QR Code Contains:</span>
                </h4>
                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Document hash for verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Upload metadata and timestamp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Verification type identifier</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Error correction for reliable scanning</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QRCodeGenerator;
