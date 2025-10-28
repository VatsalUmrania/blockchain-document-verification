import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Building,
  Calendar,
  User,
  FileText,
  Shield,
  Hash,
  Wallet,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import BlockchainService from '../../services/blockchainService';
import { useWeb3 } from '../../context/Web3Context';
import { DocumentMetadata, VerificationResult, BlockchainDocument } from '../../types/document.types';
import HashDisplay from '../common/HashDisplay';

// Types and Interfaces
type VerificationMode = 'file' | 'hash';

interface Document {
  documentType: string;
  title?: string;
  recipientName: string;
  recipientId?: string;
  issuanceDate: string | Date;
  expirationDate?: string | Date | null;
  issuerName: string;
  issuer: string;
  isActive: boolean;
  [key: string]: any;
}

interface VerificationResultData {
  isValid: boolean;
  document?: Document;
  errors?: string[];
  warnings?: string[];
  blockchainConfirmed?: boolean;
  transactionHash?: string;
  blockNumber?: number;
}

interface ThirdPartyVerificationProps {
  className?: string;
}

const ThirdPartyVerification: React.FC<ThirdPartyVerificationProps> = ({ className }) => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResultData | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [documentHash, setDocumentHash] = useState<string>('');
  const [verificationMode, setVerificationMode] = useState<VerificationMode>('file');

  // Web3 Context
  const { provider, isConnected, connectWallet } = useWeb3();

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setVerificationResult(null);
      toast.info('File Selected', {
        description: 'File selected. Click "Verify Document" to start verification.',
      });
    }
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Read file content
  const readFileContent = useCallback((file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Convert ArrayBuffer to string for hashing
  const arrayBufferToString = useCallback((buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  }, []);

  // Convert BlockchainDocument to Document interface
  const convertBlockchainDocumentToDocument = (blockchainDoc: BlockchainDocument): Document => {
    return {
      documentType: blockchainDoc.documentType,
      title: blockchainDoc.title,
      recipientName: blockchainDoc.recipientName,
      recipientId: blockchainDoc.recipientId,
      issuanceDate: blockchainDoc.issuanceDate,
      expirationDate: blockchainDoc.expirationDate,
      issuerName: blockchainDoc.issuerName,
      issuer: blockchainDoc.issuer,
      isActive: blockchainDoc.isActive
    };
  };

  // Verify document by file
  const verifyDocumentByFile = useCallback(async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('File Required', {
        description: 'Please select a file first',
      });
      return;
    }

    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const fileBuffer = await readFileContent(selectedFile);
      const fileContent = arrayBufferToString(fileBuffer);

      const basicMetadata = new DocumentMetadata({
        documentType: 'unknown',
        title: selectedFile.name,
        recipientName: 'unknown'
      });

      if (!provider) {
        throw new Error('Blockchain provider not available');
      }

      const blockchainService = new BlockchainService(provider, await provider.getSigner());
      await blockchainService.initialize();

      const calculatedHash = blockchainService.createDocumentHash(fileContent, basicMetadata);
      console.log('🔍 Calculated document hash:', calculatedHash);

      const result: VerificationResult = await blockchainService.verifyDocumentOnChain(calculatedHash);
      
      // Convert the result to match VerificationResultData interface
      const convertedResult: VerificationResultData = {
        isValid: result.isValid,
        document: result.document ? convertBlockchainDocumentToDocument(result.document) : undefined,
        errors: result.errors,
        warnings: result.warnings,
        blockchainConfirmed: result.blockchainConfirmed,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber
      };
      
      setVerificationResult(convertedResult);

      if (result.isValid) {
        toast.success('Document Verified', {
          description: 'Document verified successfully',
        });
      } else {
        toast.warning('Verification Failed', {
          description: 'Document verification failed or document not found',
        });
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';

      const errorResult: VerificationResultData = {
        isValid: false,
        errors: [errorMessage]
      };

      setVerificationResult(errorResult);
      toast.error('Verification Failed', {
        description: errorMessage,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [selectedFile, isConnected, provider, readFileContent, arrayBufferToString]);

  // Verify document by hash
  const verifyDocumentByHash = useCallback(async (): Promise<void> => {
    if (!documentHash.trim()) {
      toast.error('Hash Required', {
        description: 'Please enter a document hash',
      });
      return;
    }

    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      if (!provider) {
        throw new Error('Blockchain provider not available');
      }

      const blockchainService = new BlockchainService(provider, await provider.getSigner());
      await blockchainService.initialize();

      const result: VerificationResult = await blockchainService.verifyDocumentOnChain(documentHash.trim());
      
      // Convert the result to match VerificationResultData interface
      const convertedResult: VerificationResultData = {
        isValid: result.isValid,
        document: result.document ? convertBlockchainDocumentToDocument(result.document) : undefined,
        errors: result.errors,
        warnings: result.warnings,
        blockchainConfirmed: result.blockchainConfirmed,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber
      };
      
      setVerificationResult(convertedResult);

      if (result.isValid) {
        toast.success('Document Verified', {
          description: 'Document verified successfully',
        });
      } else {
        toast.warning('Verification Failed', {
          description: 'Document verification failed or document not found',
        });
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';

      const errorResult: VerificationResultData = {
        isValid: false,
        errors: [errorMessage]
      };

      setVerificationResult(errorResult);
      toast.error('Verification Failed', {
        description: errorMessage,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [documentHash, isConnected, provider]);

  // Format date for display
  const formatDate = useCallback((date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Get status color
  const getStatusColor = useCallback((isValid: boolean): string => {
    return isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((isValid: boolean): React.ReactNode => {
    return isValid ? (
      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
    ) : (
      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
    );
  }, []);

  return (
    <div className={cn("min-h-screen py-8", className)}>      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-4 bg-muted rounded-2xl w-fit mx-auto mb-4 border">
              <Shield className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Third-Party Document Verification
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Verify documents directly from the blockchain without relying on centralized servers.
              Upload a document or enter its hash to check authenticity.
            </p>
          </motion.div>
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Wallet Connection Required</span>
                      <p className="text-sm mt-1">
                        Connect your wallet to verify documents on the blockchain.
                      </p>
                    </div>
                    <Button onClick={connectWallet} className="ml-4">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Verification Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVerificationMode('file')}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-center",
                    verificationMode === 'file'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileText className="h-12 w-12 mx-auto mb-3" />
                  <div className="font-semibold text-lg mb-2">Upload Document</div>
                  <div className="text-sm opacity-75">Verify by uploading the document file</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVerificationMode('hash')}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-center",
                    verificationMode === 'hash'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Hash className="h-12 w-12 mx-auto mb-3" />
                  <div className="font-semibold text-lg mb-2">Enter Hash</div>
                  <div className="text-sm opacity-75">Verify using document hash</div>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Upload Section */}
        <AnimatePresence mode="wait">
          {verificationMode === 'file' && (
            <motion.div
              key="file-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Upload Document</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Drop Zone */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : selectedFile
                          ? "border-muted-foreground bg-muted"
                          : "border-border hover:border-primary"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className={cn(
                      "h-16 w-16 mx-auto mb-4",
                      isDragActive ? "text-primary" : "text-muted-foreground"
                    )} />

                    {selectedFile ? (
                      <div>
                        <p className="text-lg font-medium mb-2">
                          File Selected: {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl font-medium mb-2">
                          {isDragActive ? 'Drop the file here' : 'Drag & drop a document here'}
                        </p>
                        <p className="text-muted-foreground mb-6">
                          or click to select a file (PDF, DOC, DOCX, Images)
                        </p>
                        <div className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors duration-300">
                          <Upload className="w-5 h-5" />
                          <span>Choose File</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verify Button */}
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Button
                        onClick={verifyDocumentByFile}
                        disabled={isVerifying || !isConnected}
                        size="lg"
                        className="w-full h-14"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verifying Document...
                          </>
                        ) : (
                          <>
                            <Eye className="w-5 h-5 mr-2" />
                            Verify Document
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Hash Input Section */}
          {verificationMode === 'hash' && (
            <motion.div
              key="hash-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="w-5 h-5 text-primary" />
                    <span>Enter Document Hash</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentHash">Document Hash (SHA-256)</Label>
                    <Input
                      type="text"
                      id="documentHash"
                      value={documentHash}
                      onChange={(e) => setDocumentHash(e.target.value)}
                      placeholder="Enter the document hash (e.g., 0x1234...)"
                      className="font-mono"
                    />
                  </div>

                  <Button
                    onClick={verifyDocumentByHash}
                    disabled={isVerifying || !isConnected || !documentHash.trim()}
                    size="lg"
                    className="w-full h-14"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying Document...
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 mr-2" />
                        Verify Document
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Results */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getStatusIcon(verificationResult.isValid)}
                    <span className={cn("ml-3", getStatusColor(verificationResult.isValid))}>
                      {verificationResult.isValid ? 'Document Verified ✅' : 'Verification Failed ❌'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Error Messages */}
                  {verificationResult.errors && verificationResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <h3 className="font-medium">Verification Errors:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {verificationResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Warning Messages */}
                  {verificationResult.warnings && verificationResult.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <h3 className="font-medium">Warnings:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {verificationResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Document Details */}
                  {verificationResult.document && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          Document Information
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-start">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Document Type</div>
                              <Badge variant="secondary" className="capitalize">
                                {verificationResult.document.documentType}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Recipient</div>
                              <div className="text-foreground">{verificationResult.document.recipientName}</div>
                              {verificationResult.document.recipientId && (
                                <div className="text-sm text-muted-foreground">ID: {verificationResult.document.recipientId}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Issuance Date</div>
                              <div className="text-foreground">{formatDate(verificationResult.document.issuanceDate)}</div>
                            </div>
                          </div>

                          {verificationResult.document.expirationDate && (
                            <div className="flex items-start">
                              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-muted-foreground">Expiration Date</div>
                                <div className="text-foreground">{formatDate(verificationResult.document.expirationDate)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Issuer Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          Issuer Information
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-start">
                            <Building className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Institution</div>
                              <div className="text-foreground">{verificationResult.document.issuerName}</div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Issuer Address</div>
                              <HashDisplay 
                                hash={verificationResult.document.issuer}
                                variant="compact"
                                showLabel={false}
                                size="sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Status</div>
                              <Badge 
                                variant={verificationResult.document.isActive ? "default" : "secondary"}
                                className={verificationResult.document.isActive ? "text-green-600" : "text-muted-foreground"}
                              >
                                {verificationResult.document.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blockchain Confirmation */}
                  {verificationResult.blockchainConfirmed && (
                    <>
                      <Separator />
                      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <Shield className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <span className="font-medium text-green-600">
                              Verified on Blockchain
                            </span>
                            <p className="text-sm">
                              This document has been verified directly from the blockchain and is authentic.
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThirdPartyVerification;