import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Loader2,
  Clock,
  ShieldAlert,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import BlockchainService from '../../services/blockchainService';
import { useWeb3 } from '../../context/Web3Context';
import { DocumentMetadata, VerificationResult, BlockchainDocument, DOCUMENT_STATUS } from '../../types/document.types';
import HashDisplay from '../common/HashDisplay';
import { useDocumentStats } from '../../context/DocumentStatsContext';
import { keccak256, toUtf8Bytes } from 'ethers'; // <-- ADDED FOR HASHING

// --- Types ---
type VerificationMode = 'file' | 'hash';
type VerificationResultData = VerificationResult;

// Interface for URL parsing
interface VerificationData {
  documentHash: string;
  [key: string]: any;
}

interface ThirdPartyVerificationProps {
  className?: string;
}

const ThirdPartyVerification = ({ className }: ThirdPartyVerificationProps) => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResultData | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false); 
  const [documentHash, setDocumentHash] = useState<string>('');
  const [verificationMode, setVerificationMode] = useState<VerificationMode>('file');

  // Web3 Context
  const { provider, isConnected, connectWallet, signer } = useWeb3(); 
  const { refreshStats } = useDocumentStats(); 

  const [searchParams, setSearchParams] = useSearchParams();

  // Verify document by hash (Used by both tabs)
  const verifyDocumentByHash = useCallback(async (hashToVerify?: string): Promise<void> => {
    const hash = hashToVerify || documentHash.trim();
    if (!hash) {
      toast.error('Hash Required', { description: 'Please enter a document hash' });
      return;
    }
    if (!hash.startsWith('0x') || hash.length !== 66) {
      toast.error('Invalid Hash Format', { description: 'Please enter a valid 32-byte hash (0x...)' });
      return;
    }
    if (!isConnected || !provider || !signer) { 
      toast.error('Wallet Required', { description: 'Please connect your wallet first' });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const blockchainService = new BlockchainService(provider, signer); 
      await blockchainService.initialize();

      const result: VerificationResultData = await blockchainService.verifyDocumentOnChain(hash);
      
      setVerificationResult(result);

      const status = result.document?.getStatus();
      if (status === DOCUMENT_STATUS.VERIFIED) {
        toast.success('Document Verified', { description: 'Document is authentic and verified.' });
      } else if (status === DOCUMENT_STATUS.PENDING) {
        toast.warning('Document Pending', { description: 'Document found but awaits on-chain verification.' });
      } else {
        toast.error('Verification Failed', { description: result.errors?.[0] || 'Document is not valid or not found.' });
      }

    } catch (error: any) {
      console.error('❌ Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setVerificationResult(new VerificationResult({ isValid: false, errors: [errorMessage] }));
      toast.error('Verification Failed', { description: errorMessage });
    } finally {
      setIsVerifying(false);
    }
  }, [documentHash, isConnected, provider, signer]); 

  // Stable callback for URL-triggered verification
  const verifyHashFromUrl = useCallback(async (hashToVerify: string) => {
    if (!isConnected || !provider || !signer) { 
      toast.error('Wallet Required', { 
        description: 'Please connect your wallet to verify the hash from the URL.' 
      });
      setDocumentHash(hashToVerify);
      setVerificationMode('hash');
      return;
    }
    await verifyDocumentByHash(hashToVerify);
  }, [isConnected, provider, signer, verifyDocumentByHash]);

  // useEffect to read search params on load
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData: VerificationData = JSON.parse(decodeURIComponent(dataParam));
        if (decodedData.documentHash) {
          setDocumentHash(decodedData.documentHash);
          setVerificationMode('hash'); // Switch to the hash tab
          
          toast.info('Verification data loaded from URL. Verifying...', {
            description: `Hash: ${decodedData.documentHash.substring(0, 10)}...`
          });
          
          verifyHashFromUrl(decodedData.documentHash);

          searchParams.delete('data');
          setSearchParams(searchParams, { replace: true });
        }
      } catch (error) {
        console.error('Failed to parse URL data:', error);
        toast.error('Invalid Verification Link', {
          description: 'The data in the URL is corrupted or invalid.'
        });
      }
    }
  }, [searchParams, setSearchParams, verifyHashFromUrl]);

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

  // =================================================================
  // --- THIS IS THE CRITICAL CHANGE (STEP 3) ---
  // =================================================================

  // Read file content as a binary string (MUST MATCH ISSUANCE WORKFLOW)
  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(binary);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }, []);
  

  // Verify document by file (This is the new, working logic)
  const verifyDocumentByFile = useCallback(async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('File Required', { description: 'Please select a file first' });
      return;
    }
    if (!isConnected || !provider || !signer) { 
      toast.error('Wallet Required', { description: 'Please connect your wallet first' });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // 1. Read the file content as a binary string
      const fileContent = await readFileContent(selectedFile);

      // 2. Generate the file-only hash (must match blockchainService.createDocumentHash)
      const generatedHash = keccak256(toUtf8Bytes(fileContent));
      
      toast.info('File hash generated', {
        description: `Hash: ${generatedHash.substring(0, 10)}...`
      });

      // 3. Set the hash in the state (for the "Enter Hash" tab to see)
      setDocumentHash(generatedHash);
      
      // 4. Call the existing blockchain verification function with this file-only hash
      await verifyDocumentByHash(generatedHash);
      
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setVerificationResult(new VerificationResult({ isValid: false, errors: [errorMessage] }));
      toast.error('Verification Failed', { description: errorMessage });
      setIsVerifying(false); // Make sure to stop loading on error
    }
    // Note: setIsVerifying(false) is handled by the verifyDocumentByHash call
  }, [selectedFile, isConnected, provider, signer, readFileContent, verifyDocumentByHash]);

  // =================================================================
  // --- END OF CRITICAL CHANGE ---
  // =================================================================

  // Confirm verification (sends transaction)
  const handleConfirmVerification = useCallback(async (hash: string): Promise<void> => {
    if (!isConnected || !provider || !signer) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet to confirm verification.',
      });
      return;
    }
    
    setIsConfirming(true);
    toast.info('Submitting Verification', {
      description: 'Please confirm the transaction in your wallet...',
    });
    
    try {
      const blockchainService = new BlockchainService(provider, signer);
      await blockchainService.initialize();
      const result = await blockchainService.confirmVerification(hash);

      toast.success('Verification Confirmed!', {
        description: `Transaction: ${result.transactionHash.substring(0, 10)}...`,
      });
      
      // Refresh dashboard stats in background
      refreshStats();

      // Re-fetch the document details to show the new "verified" state
      setTimeout(() => {
        verifyDocumentByHash(hash);
      }, 1000); // Small delay for state propagation

    } catch (error: any) {
      console.error('❌ Confirmation error:', error);
      toast.error('Confirmation Failed', {
        description: error.message || 'The transaction failed.',
      });
    } finally {
      setIsConfirming(false);
    }
  }, [isConnected, provider, signer, verifyDocumentByHash, refreshStats]);


  // Format date for display
  const formatDate = useCallback((date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // [MODIFIED] Get status icon, color, and text using theme colors
  const getStatusConfig = useCallback((doc?: BlockchainDocument): { icon: React.ComponentType, color: string, text: string } => {
    const status = doc?.getStatus();
    
    switch (status) {
      case DOCUMENT_STATUS.VERIFIED:
        return { icon: CheckCircle, color: 'text-primary', text: 'Document Verified' };
      case DOCUMENT_STATUS.PENDING:
        return { icon: Clock, color: 'text-accent-foreground', text: 'Document Pending Verification' };
      case DOCUMENT_STATUS.REVOKED:
        return { icon: XCircle, color: 'text-destructive', text: 'Document Revoked' };
      case DOCUMENT_STATUS.EXPIRED:
        return { icon: AlertTriangle, color: 'text-destructive', text: 'Document Expired' };
      default:
        return { icon: XCircle, color: 'text-destructive', text: 'Verification Failed' };
    }
  }, []);

  const { icon: StatusIcon, color: statusColor, text: statusText } = getStatusConfig(verificationResult?.document);

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
              <BadgeCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            {/* [MODIFIED] Removed gradient text */}
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Third-Party Document Verification
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Verify documents directly from the blockchain without relying on centralized servers.
              Upload a document or enter its hash to check authenticity.
            </p>
          </motion.div>
        </div>
        
        {/* [MODIFIED] Wallet Connection Alert */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Wallet Connection Required</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      Connect your wallet to verify documents on the blockchain.
                    </span>
                    <Button onClick={connectWallet} variant="secondary" className="ml-4">
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
          <Card className="mb-0">
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
                  <FileText className="h-6 w-6 mx-auto mb-3" />
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
                  <Hash className="h-6 w-6 mx-auto mb-3" />
                  <div className="font-semibold text-lg mb-2">Enter Hash</div>
                  <div className="text-sm opacity-75">Verify using document hash</div>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* File/Hash Input Sections */}
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
                  {/* [MODIFIED] File Drop Zone (No longer needs JSON input) */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : selectedFile
                          ? "border-primary/50 bg-primary/10" // Use primary color for success
                          : "border-border hover:border-primary"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className={cn(
                      "h-16 w-16 mx-auto mb-4",
                      isDragActive || selectedFile ? "text-primary" : "text-muted-foreground"
                    )} />

                    {selectedFile ? (
                      <div>
                        <p className="text-lg font-medium text-primary mb-2">
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
                        disabled={isVerifying || !isConnected || isConfirming}
                        size="lg"
                        className="w-full h-14 text-accent"
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
                    <Label htmlFor="documentHash">Document Hash (bytes32)</Label>
                    <Input
                      type="text"
                      id="documentHash"
                      value={documentHash}
                      onChange={(e) => setDocumentHash(e.target.value)}
                      placeholder="Enter the document hash (e.g., 0x123...abc)"
                      className="font-mono"
                      maxLength={66} // 0x + 64 hex chars
                    />
                  </div>

                  <Button
                    onClick={() => verifyDocumentByHash()}
                    disabled={isVerifying || !isConnected || !documentHash.trim() || isConfirming}
                    size="lg"
                    className="w-full h-14 text-accent"
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

        {/* [MODIFIED] Verification Results (using theme colors) */}
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
                    <StatusIcon />
                    <span className={cn("ml-3 text-2xl font-bold", statusColor)}>
                      {statusText}
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
                  
                  {/* Pending Confirmation Section */}
                  {verificationResult.document?.getStatus() === DOCUMENT_STATUS.PENDING && (
                    <>
                      <Alert variant="destructive">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <h3 className="font-medium ">Action Required</h3>
                            <p className="text-sm">
                              This document exists on the blockchain but has not been formally verified.
                              If you are the verifier, you can confirm its authenticity to move it to a 'verified' state.
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => handleConfirmVerification(verificationResult.document!.documentHash)}
                        disabled={isConfirming || isVerifying || !isConnected}
                        className="w-full text-accent"
                      >
                        {isConfirming ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileCheck className="w-4 h-4 mr-2" />
                        )}
                        Confirm Verification On-Chain
                      </Button>
                    </>
                  )}

                  {/* Document Details */}
                  {verificationResult.document && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Document Information */}
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
                                // [MODIFIED] Use theme color for badge text
                                className={verificationResult.document.isActive ? "text-primary-foreground" : "text-muted-foreground"}
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
                      <Alert variant="default">
                        <ShieldAlert className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <span className="font-medium text-primary">
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