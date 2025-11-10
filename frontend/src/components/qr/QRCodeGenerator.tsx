import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Share,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import HashDisplay from '../common/HashDisplay';
import { cn } from '@/lib/utils'; // Import cn

// Types and Interfaces
interface VerificationMetadata {
  documentType?: string;
  issuer?: string;
  recipient?: string;
  issuanceDate?: number | string | Date;
  issuerName?: string;
  recipientName?: string;
  [key: string]: any;
}

interface VerificationData {
  documentHash: string;
  transactionHash?: string;
  contractAddress: string;
  timestamp: number;
  version: string;
  network: string;
  metadata: VerificationMetadata;
}

interface QRGenerationResult {
  qrCodeDataURL: string;
  verificationURL: string;
  verificationData: VerificationData;
}

interface QRCodeGeneratorProps {
  documentHash: string;
  transactionHash?: string;
  contractAddress: string;
  metadata?: VerificationMetadata;
  onQRGenerated?: (result: QRGenerationResult) => void;
  className?: string;
}

interface QRCodeOptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  type: 'image/png' | 'image/jpeg';
  quality: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  width: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  documentHash,
  transactionHash,
  contractAddress,
  metadata = {},
  onQRGenerated,
  className
}) => {
  // State
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [verificationURL, setVerificationURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate verification URL and QR code
  const generateQRCode = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create verification data object
      const verificationData: VerificationData = {
        documentHash,
        transactionHash: transactionHash || '',
        contractAddress,
        timestamp: Date.now(),
        version: '1.0',
        network: 'ethereum',
        metadata: {
          documentType: metadata.documentType || 'document',
          issuer: metadata.issuerName || 'Unknown',
          recipient: metadata.recipientName || 'Unknown',
          issuanceDate: metadata.issuanceDate || Date.now()
        }
      };

      // Create verification URL
      const baseURL = window.location.origin;
      const verifyURL = `${baseURL}/third-party-verify?data=${encodeURIComponent(JSON.stringify(verificationData))}`;

      setVerificationURL(verifyURL);

      // [FIXED] Use standard hex colors. The 'qrcode' library cannot parse oklch().
      // Black and white is the most scannable and works on any theme.
      const fgColor = '#000000'; // Black
      const bgColor = '#FFFFFF'; // White

      // Generate QR code with theme-aware colors
      const qrOptions: QRCodeOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        width: 280
      };

      const qrDataURL = await QRCode.toDataURL(verifyURL, qrOptions);
      setQrCodeDataURL(qrDataURL);

      if (onQRGenerated) {
        onQRGenerated({
          qrCodeDataURL: qrDataURL,
          verificationURL: verifyURL,
          verificationData
        });
      }

      // console.log('QR Code generated successfully');
      toast.success('QR Code Generated', {
        description: 'Verification QR code created successfully',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setError(errorMessage);
      toast.error('QR Generation Failed', {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [documentHash, transactionHash, contractAddress, metadata, onQRGenerated]);
  
  // [MODIFIED] Generate QR code effect with cleaner dependencies
  useEffect(() => {
    if (documentHash && contractAddress) {
      generateQRCode();
    }
  }, [generateQRCode, documentHash, contractAddress]);


  // Copy verification URL to clipboard
  const copyToClipboard = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(verificationURL);
      setCopied(true);
      toast.success('URL Copied', {
        description: 'Verification URL copied to clipboard',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Copy Failed', {
        description: 'Failed to copy URL to clipboard',
      });
    }
  }, [verificationURL]);

  // Download QR code as image
  const downloadQRCode = useCallback((): void => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `document-verification-qr-${documentHash?.substring(0, 8)}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('QR Downloaded', {
      description: 'QR Code downloaded successfully',
    });
  }, [qrCodeDataURL, documentHash]);

  // Download verification data as JSON
  const downloadVerificationData = useCallback((): void => {
    const verificationData = {
      documentHash,
      transactionHash,
      contractAddress,
      verificationURL,
      timestamp: Date.now(),
      metadata
    };

    const dataStr = JSON.stringify(verificationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.download = `verification-data-${documentHash?.substring(0, 8)}.json`;
    link.href = URL.createObjectURL(dataBlob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast.success('Data Downloaded', {
      description: 'Verification data downloaded successfully',
    });
  }, [documentHash, transactionHash, contractAddress, verificationURL, metadata]);

  // Share QR code (if Web Share API is available)
  const shareQRCode = useCallback(async (): Promise<void> => {
    if (navigator.share && qrCodeDataURL) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeDataURL);
        const blob = await response.blob();
        
        const file = new File([blob], `qr-code-${documentHash?.substring(0, 8)}.png`, {
          type: 'image/png'
        });

        await navigator.share({
          title: 'Document Verification QR Code',
          text: 'Scan this QR code to verify document authenticity',
          url: verificationURL,
          files: [file]
        });

        toast.success('QR Shared', {
          description: 'QR Code shared successfully',
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      // Fallback to copying URL
      copyToClipboard();
    }
  }, [qrCodeDataURL, documentHash, verificationURL, copyToClipboard]);

  // Open verification URL in new tab
  const openVerificationURL = useCallback((): void => {
    if (verificationURL) {
      window.open(verificationURL, '_blank');
    }
  }, [verificationURL]);

  // Validation check
  if (!documentHash || !contractAddress) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Document hash and contract address are required to generate QR code
        </AlertDescription>
      </Alert>
    );
  }

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
          <CardTitle className="text-xl">Document Verification QR Code</CardTitle>
          <p className="text-muted-foreground">
            Scan this QR code to verify the document authenticity
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="flex flex-col items-center space-y-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating QR Code...</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Failed to generate QR code</p>
                    <p className="text-sm mt-1">{error}</p>
                  </AlertDescription>
                </Alert>
                <Button onClick={generateQRCode} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Generation
                </Button>
              </motion.div>
            ) : qrCodeDataURL ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    // The 'bg-background' will be white in light mode and dark in dark mode
                    className="bg-background p-4 rounded-xl border-2 shadow-lg"
                  >
                    <img
                      src={qrCodeDataURL}
                      alt="Document Verification QR Code"
                      className="w-72 h-72 rounded-lg"
                    />
                  </motion.div>
                </div>

                {/* Verification URL */}
                <div className="space-y-2">
                  <Label htmlFor="verificationUrl">Verification URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="verificationUrl"
                      type="text"
                      value={verificationURL}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant={copied ? "default" : "outline"}
                      size="sm"
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={openVerificationURL}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    onClick={downloadQRCode}
                    variant="default"
                    className="h-12"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>

                  <Button
                    onClick={shareQRCode}
                    variant="outline"
                    className="h-12"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share QR
                  </Button>

                  <Button
                    onClick={downloadVerificationData}
                    variant="outline"
                    className="h-12"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                </div>

                <Separator />

                {/* Document Information */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Info className="w-5 h-5 text-primary" />
                      <span>Document Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Document Hash</Label>
                        <HashDisplay 
                          hash={documentHash} 
                          variant="compact" 
                          showLabel={false}
                          size="sm"
                          className="mt-1"
                        />
                      </div>

                      {transactionHash && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Transaction Hash</Label>
                          <HashDisplay 
                            hash={transactionHash} 
                            variant="compact" 
                            showLabel={false}
                            size="sm"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Contract Address</Label>
                        <HashDisplay 
                          hash={contractAddress} 
                          variant="compact" 
                          showLabel={false}
                          size="sm"
                          className="mt-1"
                        />
                      </div>

                      {metadata.documentType && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Document Type</Label>
                          <Badge variant="secondary" className="mt-1 capitalize">
                            {metadata.documentType}
                          </Badge>
                        </div>
                      )}

                      {metadata.issuerName && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Issuer</Label>
                          <p className="text-foreground mt-1">{metadata.issuerName}</p>
                        </div>
                      )}

                      {metadata.recipientName && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Recipient</Label>
                          <p className="text-foreground mt-1">{metadata.recipientName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Instructions */}
                <Alert className="border-primary/20 bg-primary/5">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary">How to Use</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start space-x-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Embed this QR code in your document</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Third parties can scan it to verify authenticity</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Verification works without accessing your servers</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-primary font-bold">•</span>
                          <span>All data is verified directly from the blockchain</span>
                        </li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="space-y-4">
                  <Skeleton className="w-72 h-72 mx-auto rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QRCodeGenerator;