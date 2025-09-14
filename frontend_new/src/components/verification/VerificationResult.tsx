import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Copy,
  Shield,
  Calendar,
  User,
  Info,
  Link,
  AlertTriangle,
  Download,
  Share,
  Clipboard,
  Hash,
  BarChart3,
  FileText,
  Sparkles,
  Beaker,
  Box
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay';

// Types and Interfaces
interface VerificationMetadata {
  name?: string;
  size?: number;
  type?: string;
  timestamp?: number | string;
  uploader?: string;
  description?: string;
  [key: string]: any;
}

interface BlockchainVerification {
  isValid?: boolean;
  status?: string;
  transactionHash?: string;
  [key: string]: any;
}

interface VerificationResultData {
  isValid: boolean;
  generatedHash: string;
  expectedHash: string;
  matchingStrategy?: string;
  blockchainVerification?: BlockchainVerification;
  hasBlockchainRecord?: boolean;
  blockchainStatus?: string;
  transactionHash?: string | null;
  statusUpdated?: boolean;
  foundInStorage?: boolean;
  currentStatus?: string;
  metadata?: VerificationMetadata;
  debugInfo?: any;
}

interface VerificationResultProps {
  result: VerificationResultData;
  className?: string;
}

interface StatusColors {
  primary: string;
  bg: string;
  border: string;
  icon: string;
}

interface CertificateData {
  verificationResult: boolean;
  timestamp: string;
  generatedHash: string;
  expectedHash: string;
  metadata?: VerificationMetadata;
  blockchainVerification?: BlockchainVerification | null;
  blockchainStatus?: string;
  transactionHash?: string | null;
  statusUpdated?: boolean;
  foundInStorage?: boolean;
  currentStatus?: string;
  certificateId: string;
  verificationDetails: {
    algorithm: string;
    blockchainNetwork: string;
    verifiedBy: string;
    hasBlockchainRecord?: boolean;
    verificationMethod?: string;
  };
}

interface ShareData {
  title: string;
  text: string;
  url: string;
}

const VerificationResult: React.FC<VerificationResultProps> = ({ result, className }) => {
  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to Clipboard', {
        description: 'Text copied successfully',
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy Failed', {
        description: 'Failed to copy to clipboard',
      });
    }
  }, []);

  // Download certificate
  const downloadCertificate = useCallback((): void => {
    const certificateData: CertificateData = {
      verificationResult: result.isValid,
      timestamp: new Date().toISOString(),
      generatedHash: result.generatedHash,
      expectedHash: result.expectedHash,
      metadata: result.metadata,
      blockchainVerification: result.blockchainVerification || null,
      blockchainStatus: result.blockchainStatus || 'not_found',
      transactionHash: result.transactionHash || null,
      statusUpdated: result.statusUpdated || false,
      foundInStorage: result.foundInStorage || false,
      currentStatus: result.currentStatus || 'not_found',
      certificateId: `CERT-${Date.now()}`,
      verificationDetails: {
        algorithm: 'SHA-256',
        blockchainNetwork: 'Ethereum',
        verifiedBy: 'DocVerify System',
        hasBlockchainRecord: result.hasBlockchainRecord || false,
        verificationMethod: result.matchingStrategy || 'hash_comparison'
      }
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-certificate-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Certificate Downloaded', {
      description: 'Verification certificate downloaded successfully',
    });
  }, [result]);

  // Share verification result
  const shareVerificationResult = useCallback(async (): Promise<void> => {
    const shareData: ShareData = {
      title: 'Document Verification Result - DocVerify',
      text: `Document verification ${result.isValid ? 'successful' : 'failed'} - MongoDB & Blockchain Security`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Result Shared', {
          description: 'Verification result shared successfully',
        });
      } catch (error) {
        console.error('Share failed:', error);
        copyToClipboard(window.location.href);
      }
    } else {
      copyToClipboard(window.location.href);
    }
  }, [result.isValid, copyToClipboard]);

  // Get verification status colors
  const getVerificationStatusColors = useCallback((): StatusColors => {
    if (result.isValid) {
      if (result.hasBlockchainRecord) {
        return {
          primary: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400'
        };
      } else if (result.statusUpdated) {
        return {
          primary: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          icon: 'text-primary'
        };
      } else {
        return {
          primary: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600 dark:text-purple-400'
        };
      }
    }
    return {
      primary: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400'
    };
  }, [result]);

  const statusColors = getVerificationStatusColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={className}
    >
      <Card className={cn(
        "border-l-4",
        result.isValid 
          ? result.hasBlockchainRecord
            ? "border-l-green-500" 
            : result.statusUpdated
              ? "border-l-primary"
              : "border-l-purple-500"
          : "border-l-red-500"
      )}>
        <CardContent className="p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border-2",
                statusColors.bg,
                statusColors.border
              )}>
                {result.isValid ? (
                  <CheckCircle className={cn("w-10 h-10", statusColors.icon)} />
                ) : (
                  <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={cn("text-2xl font-bold mb-2", statusColors.primary)}>
                {result.isValid 
                  ? result.hasBlockchainRecord 
                    ? '🔗 Blockchain Verification Successful' 
                    : result.statusUpdated
                      ? '✨ Verification Complete - Status Updated'
                      : '✅ Hash Verification Successful'
                  : '❌ Verification Failed'}
              </h3>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {result.isValid 
                  ? result.hasBlockchainRecord
                    ? 'The document is authentic and has been verified against blockchain records. Document integrity confirmed with cryptographic proof.'
                    : result.statusUpdated
                      ? 'Document hash verified and status successfully updated in your records from "pending" to "verified".'
                      : 'The document hash matches the expected value. Document integrity has been verified using cryptographic comparison.'
                  : 'The document hash does not match the expected value. This could indicate the document has been modified or corrupted.'
                }
              </p>

              {/* Verification Badges */}
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge 
                  variant={result.isValid ? "default" : "destructive"}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {result.isValid ? 'VERIFIED' : 'VERIFICATION FAILED'}
                </Badge>
                
                {result.hasBlockchainRecord && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
                    <Link className="w-4 h-4 mr-2" />
                    BLOCKCHAIN CONFIRMED
                  </Badge>
                )}
                
                {result.statusUpdated && (
                  <Badge className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400">
                    <Sparkles className="w-4 h-4 mr-2" />
                    STATUS UPDATED
                  </Badge>
                )}
                
                {result.foundInStorage && (
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                    <Box className="w-3 h-3 mr-1" />
                    Found in Records
                  </Badge>
                )}
                
                {result.matchingStrategy && (
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                    <Beaker className="w-3 h-3 mr-1" />
                    Strategy: {result.matchingStrategy}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Status Update Notification */}
          <AnimatePresence>
            {result.statusUpdated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <h4 className="font-semibold text-green-600 mb-1">Document Status Updated Successfully!</h4>
                    <p className="text-sm">
                      Your document has been automatically updated from "pending" to "verified" status. 
                      Check your Dashboard to see the updated statistics.
                    </p>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Storage Status */}
          <AnimatePresence>
            {result.foundInStorage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Box className="w-5 h-5 mr-2" />
                      Storage Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                        <p className={cn(
                          "font-semibold",
                          result.currentStatus === 'verified' ? 'text-green-600 dark:text-green-400' :
                          result.currentStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-muted-foreground'
                        )}>
                          {result.currentStatus === 'verified' ? '✅ Verified' :
                           result.currentStatus === 'pending' ? '⏳ Pending' : 
                           '📭 Not Found'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Storage:</span>
                        <p className="text-primary font-medium">📚 Database Records</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blockchain Status Section */}
          <AnimatePresence>
            {result.blockchainVerification && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Link className="w-5 h-5 mr-2 text-primary" />
                      Blockchain Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <p className={cn(
                          "font-semibold text-lg",
                          result.blockchainStatus === 'verified' ? 'text-green-600 dark:text-green-400' :
                          result.blockchainStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-muted-foreground'
                        )}>
                          {result.blockchainStatus === 'verified' ? '✅ Verified on Blockchain' :
                           result.blockchainStatus === 'pending' ? '⏳ Pending Blockchain Confirmation' : 
                           '📭 Not Found on Blockchain'}
                        </p>
                      </div>
                      {result.transactionHash && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Transaction:</span>
                          <div className="mt-2">
                            <HashDisplay 
                              hash={result.transactionHash}
                              variant="compact"
                              showLabel={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hash Comparison Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Copy className="w-6 h-6 text-purple-600" />
              <h4 className="text-xl font-semibold">Hash Comparison Analysis</h4>
            </div>

            {/* Generated Hash */}
            <div>
              <HashDisplay 
                hash={result.generatedHash}
                label="Generated Hash (From Uploaded Document)"
                variant="card"
              />
            </div>

            {/* Expected Hash */}
            <div>
              <HashDisplay 
                hash={result.expectedHash}
                label="Expected Hash (From Verification Request)"
                variant="card"
              />
            </div>

            {/* Visual Hash Comparison */}
            <Card className="border-2 border-dashed">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="mb-6">
                    <h5 className="text-xl font-semibold mb-3">Hash Comparison Result</h5>
                    {result.isValid ? (
                      <div className={cn("flex items-center justify-center", statusColors.primary)}>
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center mr-4 border",
                          statusColors.bg,
                          statusColors.border
                        )}>
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">MATCH CONFIRMED</div>
                          <div className="text-sm text-muted-foreground">Cryptographic hashes are identical</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-red-600 dark:text-red-400">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4 border border-red-200 dark:border-red-800">
                          <XCircle className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">NO MATCH</div>
                          <div className="text-sm text-muted-foreground">Cryptographic hashes are different</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hash Length Comparison */}
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="font-medium">Generated:</span>
                        </div>
                        <p className="text-primary font-mono text-lg">{result.generatedHash?.length || 0} chars</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Expected:</span>
                        </div>
                        <p className="text-green-600 font-mono text-lg">{result.expectedHash?.length || 0} chars</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Metadata Section */}
          <AnimatePresence>
            {result.metadata && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-6 h-6 text-green-600" />
                  <h4 className="text-xl font-semibold">Document Information</h4>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-muted-foreground">Document Name</span>
                          </div>
                          <p className="font-medium">{result.metadata.name}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-muted-foreground">File Size</span>
                          </div>
                          <p>{result.metadata.size ? (result.metadata.size / 1024 / 1024).toFixed(2) : 'N/A'} MB</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Box className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-semibold text-muted-foreground">File Type</span>
                          </div>
                          <p>{result.metadata.type}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 text-yellow-600 mt-1" />
                          <div>
                            <span className="text-sm font-semibold text-muted-foreground">Upload Timestamp</span>
                            <p>
                              {result.metadata.timestamp ? new Date(result.metadata.timestamp).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {result.metadata.uploader && (
                          <div className="flex items-start space-x-2">
                            <User className="w-4 h-4 text-primary mt-1" />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-semibold text-muted-foreground">Uploaded By</span>
                              <div className="mt-2">
                                <HashDisplay 
                                  hash={result.metadata.uploader}
                                  variant="compact"
                                  showLabel={false}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {result.metadata.description && (
                          <div>
                            <span className="text-sm font-semibold text-muted-foreground">Description</span>
                            <p className="mt-1">{result.metadata.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verification Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="w-5 h-5 text-purple-600" />
                <span>Verification Technical Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="text-center p-4">
                    <Hash className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium text-muted-foreground block">Algorithm Used</span>
                    <p className="text-primary font-semibold">SHA-256</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-muted-foreground block">Verification Time</span>
                    <p className="text-green-600 font-semibold">{new Date().toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <Link className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-muted-foreground block">Network</span>
                    <p className="text-purple-600 font-semibold">
                      {result.hasBlockchainRecord ? 'Ethereum Blockchain' : 'Hash Verification'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Separator />
          <div className="flex flex-wrap gap-4">
            <Button onClick={downloadCertificate} className="h-12">
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
            
            <Button onClick={shareVerificationResult} variant="outline" className="h-12">
              <Share className="w-4 h-4 mr-2" />
              Share Result
            </Button>
            
            <Button 
              onClick={() => copyToClipboard(result.generatedHash)} 
              variant="outline"
              className="h-12"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Copy Hash
            </Button>
          </div>

          {/* Enhanced Information Footer */}
          <Alert className="border-primary/20 bg-primary/5">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Security & Verification Information</h4>
                  <p className="text-sm leading-relaxed">
                    This verification result is based on cryptographic hash comparison 
                    {result.hasBlockchainRecord ? ' with blockchain confirmation' : ''}
                    {result.statusUpdated ? ' and includes automatic status updates to your records' : ''}. 
                    {result.isValid 
                      ? ' The document integrity has been successfully validated using SHA-256 cryptographic hashing.'
                      : ' If verification failed, ensure you have the correct document and hash.'
                    }
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center space-x-2">
                    <Box className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Certificate ID: CERT-{Date.now()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary font-medium">Powered by DocVerify System</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Warning for Hash-Only Verification */}
          <AnimatePresence>
            {result.isValid && !result.hasBlockchainRecord && !result.statusUpdated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Alert className="border-l-4 border-l-yellow-500 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <h4 className="font-semibold text-yellow-600 mb-2">Hash-Only Verification</h4>
                    <p className="text-sm leading-relaxed">
                      This document was verified using hash comparison only. For enhanced security and automatic status management, 
                      consider uploading documents through the DocVerify platform for full integration and blockchain verification capabilities.
                    </p>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationResult;
