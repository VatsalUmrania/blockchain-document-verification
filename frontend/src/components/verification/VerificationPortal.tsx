import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  QrCode, 
  FileText,
  Upload,
  AlertCircle,
  Info,
  Bug,
  Shield,
  Clipboard,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  Sparkles,
  Hash,
  File,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import QRCodeScanner from './QRCodeScanner';
import VerificationResult from './VerificationResult';
import { verifyDocumentHash, normalizeHash, validateHashFormat } from '../../services/hashService';
import { useWeb3 } from '../../context/Web3Context';
import DocumentService from '../../services/DocumentService';
import { useDocumentStats } from '../../context/DocumentStatsContext';

// Types and Interfaces
type VerificationMethod = 'hash' | 'qr';
type VerificationStatus = 'processing' | 'success' | 'failed' | 'error';

interface VerificationAttempt {
  id: number;
  fileName: string;
  expectedHash: string;
  originalHash: string;
  timestamp: string;
  status: VerificationStatus;
  result?: VerificationResultData;
  error?: string;
}

interface VerificationResultData {
  isValid: boolean;
  expectedHash: string;
  generatedHash: string;
  matchingStrategy?: string;
  blockchainVerification?: any;
  documentStatus?: any;
  hasBlockchainRecord?: boolean;
  blockchainStatus?: string;
  transactionHash?: string | null;
  foundInStorage?: boolean;
  currentStatus?: string;
  statusUpdated?: boolean;
  debugInfo?: any;
}

interface HashValidation {
  isValid: boolean;
  length: number;
  normalized: string;
  hadPrefix: boolean;
  displayLength: number;
  status: 'valid' | 'invalid';
}

interface QRScanResult {
  hash: string;
  [key: string]: any;
}

const VerificationPortal: React.FC = () => {
  // State
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('hash');
  const [hashInput, setHashInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResultData | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationAttempt[]>([]);

  // Context
  const { isConnected, provider, signer } = useWeb3();
  const { refreshStats } = useDocumentStats();

  // Handle hash verification
  const handleHashVerification = useCallback(async (): Promise<void> => {
    if (!hashInput.trim()) {
      toast.error('Hash Required', {
        description: 'Please enter a document hash',
      });
      return;
    }

    const hashValidation = validateHashFormat(hashInput);
    if (!hashValidation.isValid) {
      toast.error('Invalid Hash Format', {
        description: `Expected 64 hexadecimal characters, got ${hashValidation.length}`,
      });
      return;
    }

    if (!selectedFile) {
      toast.error('File Required', {
        description: 'Please select a file to verify',
      });
      return;
    }

    setIsVerifying(true);
    
    const normalizedHash = normalizeHash(hashInput.trim());
    const verificationAttempt: VerificationAttempt = {
      id: Date.now(),
      fileName: selectedFile.name,
      expectedHash: normalizedHash,
      originalHash: hashInput.trim(),
      timestamp: new Date().toISOString(),
      status: 'processing'
    };
    
    setVerificationHistory(prev => [verificationAttempt, ...prev.slice(0, 4)]);

    try {
      console.log('🔍 Starting comprehensive verification...');
      console.log('📁 Selected file:', selectedFile.name, selectedFile.size, selectedFile.type);
      console.log('📝 Normalized expected hash:', normalizedHash);
      
      toast.info('Analyzing Document', {
        description: 'Analyzing document and checking verification status...',
      });
      
      // Step 1: Hash-based verification
      const hashResult = await verifyDocumentHash(selectedFile, normalizedHash);
      console.log('🔢 Hash verification result:', hashResult);
      
      // Step 2: Check DocumentService for existing documents
      let documentService: DocumentService | null = null;
      let documentStatus: any = null;
      let blockchainResult: any = null;
      
      if (isConnected && provider && signer) {
        try {
          documentService = new DocumentService();
          
          // Check if this hash exists in our storage
          documentStatus = documentService.getDocumentStatus(normalizedHash);
          console.log('📋 Document status check:', documentStatus);
          
          // Try blockchain verification
          const fileContent = await readFileContent(selectedFile);
          blockchainResult = await documentService.verifyDocument(fileContent, selectedFile.name);
          console.log('🔗 Blockchain verification result:', blockchainResult);
          
        } catch (error) {
          console.log('⚠️ DocumentService verification error:', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      // Step 3: Combine all verification results
      const combinedResult: VerificationResultData = {
        ...hashResult,
        blockchainVerification: blockchainResult,
        documentStatus: documentStatus,
        hasBlockchainRecord: blockchainResult?.isValid || false,
        blockchainStatus: blockchainResult?.status || 'not_found',
        transactionHash: blockchainResult?.transactionHash || null,
        foundInStorage: documentStatus?.exists || false,
        currentStatus: documentStatus?.status || 'not_found',
        isValid: hashResult.isValid
      };
      
      console.log('✅ Combined verification result:', combinedResult);
      setVerificationResult(combinedResult);
      
      // Step 4: Document status update
      if (combinedResult.isValid && isConnected) {
        try {
          console.log('🔄 Starting verification update...');
          console.log('🔍 Looking for hash:', normalizedHash);
          
          // Get current documents from localStorage
          const docs = JSON.parse(localStorage.getItem('docverify_documents') || '{}');
          console.log('📋 Total documents in storage:', Object.keys(docs).length);
          
          let foundDocument: any = null;
          let foundKey: string | null = null;
          
          // Search strategy 1: Direct hash match
          if (docs[normalizedHash]) {
            foundDocument = docs[normalizedHash];
            foundKey = normalizedHash;
            console.log('✅ Found by direct hash match');
          }
          
          // Search strategy 2: Normalize all stored hashes
          if (!foundDocument) {
            for (const [storedHash, doc] of Object.entries(docs)) {
              const normalizedStored = normalizeHash(storedHash);
              if (normalizedStored === normalizedHash) {
                foundDocument = doc;
                foundKey = storedHash;
                console.log('✅ Found after normalizing stored hash');
                break;
              }
            }
          }
          
          // Search strategy 3: By file name (fallback)
          if (!foundDocument && selectedFile) {
            for (const [storedHash, doc] of Object.entries(docs)) {
              if ((doc as any).fileName === selectedFile.name) {
                foundDocument = doc;
                foundKey = storedHash;
                console.log('✅ Found by filename match');
                break;
              }
            }
          }
          
          if (foundDocument && foundKey) {
            console.log('📄 Document found:', foundDocument.fileName);
            console.log('📄 Current status:', foundDocument.status);
            
            if (foundDocument.status === 'pending') {
              console.log('🔄 Updating to verified...');
              
              // Update the document
              docs[foundKey] = {
                ...foundDocument,
                status: 'verified',
                verifiedAt: Date.now(),
                lastUpdated: Date.now(),
                verificationData: {
                  verifiedBy: 'verification_portal',
                  verifiedAt: Date.now(),
                  method: combinedResult.matchingStrategy || 'hash_comparison',
                  fileVerified: selectedFile.name
                }
              };
              
              // Save to localStorage
              localStorage.setItem('docverify_documents', JSON.stringify(docs));
              console.log('✅ Document status saved to localStorage');
              
              // Verify the save worked
              const verification = JSON.parse(localStorage.getItem('docverify_documents') || '{}');
              console.log('🔍 Verification check:', verification[foundKey]?.status);
              
              if (verification[foundKey]?.status === 'verified') {
                console.log('✅ Status update confirmed in storage');
                
                // Dispatch events to ensure stats refresh
                ['documentStatsChanged', 'storage'].forEach(eventType => {
                  window.dispatchEvent(new CustomEvent(eventType, {
                    detail: { action: 'verify', hash: foundKey, timestamp: Date.now() }
                  }));
                });
                
                // Force refresh stats
                setTimeout(async () => {
                  console.log('🔄 Calling refreshStats after delay...');
                  await refreshStats();
                  console.log('✅ refreshStats completed');
                }, 300);
                
                // Update result
                combinedResult.statusUpdated = true;
                combinedResult.foundInStorage = true;
                combinedResult.currentStatus = 'verified';
                
                toast.success('Document Verified', {
                  description: 'Document verified and status updated successfully!',
                });
                
              } else {
                console.error('❌ Status update verification failed');
                toast.error('Update Failed', {
                  description: 'Status update failed - please refresh and try again',
                });
              }
              
            } else {
              console.log(`ℹ️ Document already has status: ${foundDocument.status}`);
              toast.info('Already Verified', {
                description: `Document already ${foundDocument.status}`,
              });
            }
          } else {
            console.log('❌ Document not found in storage');
            console.log('💡 This document may not have been uploaded through this app');
            
            // Still show success for hash verification even if not in storage
            if (combinedResult.isValid) {
              toast.success('Hash Verified', {
                description: 'Document hash verified successfully!',
              });
              toast.info('Not Found in Records', {
                description: 'Document not found in your uploaded documents - may not have been uploaded through this app',
              });
            }
          }
          
        } catch (error) {
          console.error('❌ Error during status update:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error('Update Error', {
            description: `Error updating document status: ${errorMessage}`,
          });
        }
      } else {
        console.log('⚠️ Status update skipped - conditions not met');
        console.log('   - isValid:', combinedResult.isValid);
        console.log('   - isConnected:', isConnected);
        
        // Still show hash verification result
        if (combinedResult.isValid) {
          toast.success('Hash Verified', {
            description: 'Document hash verified successfully!',
          });
          if (!isConnected) {
            toast.info('Wallet Required', {
              description: 'Connect wallet to check against your uploaded documents',
            });
          }
        }
      }
      
      // Update history
      setVerificationHistory(prev => prev.map(item => 
        item.id === verificationAttempt.id 
          ? { ...item, status: combinedResult.isValid ? 'success' : 'failed', result: combinedResult }
          : item
      ));
      
      // Enhanced success/failure messages
      if (combinedResult.isValid) {
        let successMessage = '✅ Document verification successful!';
        
        if (combinedResult.foundInStorage) {
          successMessage += ` Found in your records (${combinedResult.currentStatus})`;
        }
        if (combinedResult.hasBlockchainRecord) {
          successMessage += ` 🔗 Blockchain status: ${blockchainResult.status}`;
        }
        
        // Only show if no previous toast was shown
        if (!combinedResult.statusUpdated && !combinedResult.foundInStorage) {
          toast.success('Verification Complete', {
            description: successMessage,
          });
        }
      } else {
        let errorMessage = '❌ Document verification failed!';
        
        if (hashValidation.hadPrefix) {
          errorMessage += ' Note: Hash was normalized from 0x format.';
        }
        
        toast.error('Verification Failed', {
          description: errorMessage,
        });
        console.log('🐛 Verification debug info:', combinedResult.debugInfo);
      }
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      toast.error('Verification Error', {
        description: `Error during verification: ${errorMessage}`,
      });
      
      setVerificationHistory(prev => prev.map(item => 
        item.id === verificationAttempt.id 
          ? { ...item, status: 'error', error: errorMessage }
          : item
      ));
    } finally {
      setIsVerifying(false);
    }
  }, [hashInput, selectedFile, isConnected, provider, signer, refreshStats]);

  // Helper function to read file content
  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file.slice(0, 1024));
    });
  }, []);

  // Handle file select
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File Too Large', {
          description: 'File size must be less than 10MB',
        });
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported File Type', {
          description: 'Please use PDF, DOC, DOCX, images, or text files.',
        });
        return;
      }
      
      setSelectedFile(file);
      toast.success('File Selected', {
        description: `File selected: ${file.name}`,
      });
    }
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const mockEvent = {
        target: { files: [file] }
      };
      handleFileSelect(mockEvent as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileSelect]);

  // Handle QR scan
  const handleQRScan = useCallback((result: QRScanResult): void => {
    if (result && result.hash) {
      setHashInput(result.hash);
      setShowScanner(false);
      setVerificationMethod('hash');
      toast.success('QR Scanned', {
        description: 'QR code scanned successfully!',
      });
    }
  }, []);

  // Clear verification
  const clearVerification = useCallback((): void => {
    setHashInput('');
    setSelectedFile(null);
    setVerificationResult(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast.info('Form Cleared', {
      description: 'Verification form cleared',
    });
  }, []);

  // Paste from clipboard
  const pasteFromClipboard = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.length > 10) {
        setHashInput(text.trim());
        toast.success('Hash Pasted', {
          description: 'Hash pasted from clipboard',
        });
      } else {
        toast.error('Invalid Clipboard Content', {
          description: 'Clipboard does not contain a valid hash',
        });
      }
    } catch (error) {
      toast.error('Clipboard Error', {
        description: 'Failed to read from clipboard',
      });
    }
  }, []);

  // Get hash validation
  const getHashValidation = useCallback((): HashValidation | null => {
    if (!hashInput) return null;
    
    const validation = validateHashFormat(hashInput);
    return {
      ...validation,
      displayLength: validation.normalized.length,
      status: validation.isValid ? 'valid' : 'invalid'
    };
  }, [hashInput]);

  const hashValidation = getHashValidation();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-muted rounded-full border">
              <Shield className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">
            Document Verification Portal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify document authenticity and update verification status. Successfully verified documents will be marked as verified in your records.
          </p>
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Enhanced Verification Available</p>
                      <p className="text-sm mt-1 flex items-center space-x-2">
                        <Wallet className="w-4 h-4" />
                        <span>Connect your wallet to check against your uploaded documents and enable automatic status updates.</span>
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary" />
              <span>Choose Verification Method</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVerificationMethod('hash')}
                className={cn(
                  "p-6 border-2 rounded-xl transition-all duration-300",
                  verificationMethod === 'hash'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-xl border mx-auto mb-4">
                  <Search className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Hash Verification</h3>
                <p className="text-muted-foreground text-sm">
                  Enter the document hash and upload the file for comprehensive verification and status updates
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVerificationMethod('qr')}
                className={cn(
                  "p-6 border-2 rounded-xl transition-all duration-300",
                  verificationMethod === 'qr'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-xl border mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">QR Code Verification</h3>
                <p className="text-muted-foreground text-sm">
                  Scan QR code to automatically extract hash and verify document with status updates
                </p>
              </motion.button>
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Verification Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hash Input Section */}
            <div>
              <Label className="flex items-center space-x-2 text-lg font-semibold mb-3">
                <Hash className="w-5 h-5 text-purple-600" />
                <span>Document Hash</span>
              </Label>
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter or paste the document hash (64 character SHA-256)..."
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={pasteFromClipboard}
                    variant="outline"
                    size="sm"
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Paste
                  </Button>
                  <Button
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    size="sm"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR
                  </Button>
                </div>
                
                {/* Hash Validation Display */}
                {hashValidation && (
                  <Alert className={hashValidation.status === 'valid' ? '' : 'border-destructive'}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Hash Length: {hashValidation.displayLength} characters</span>
                          <Badge 
                            variant={hashValidation.status === 'valid' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            <div className="flex items-center space-x-1">
                              {hashValidation.status === 'valid' ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Valid SHA-256</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  <span>Invalid (expected 64)</span>
                                </>
                              )}
                            </div>
                          </Badge>
                        </div>
                        
                        {hashValidation.hadPrefix && (
                          <div className="flex items-center space-x-2 text-xs p-2 bg-primary/10 rounded border border-primary/30">
                            <Info className="w-4 h-4 text-primary" />
                            <span className="text-primary">
                              Hash contains '0x' prefix - will be normalized for comparison
                            </span>
                          </div>
                        )}
                        
                        {hashValidation.status === 'invalid' && (
                          <p className="text-xs text-destructive mt-2 p-2 bg-destructive/10 rounded border border-destructive/30">
                            Please enter a valid 64-character SHA-256 hash (with or without 0x prefix)
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <Label className="flex items-center space-x-2 text-lg font-semibold mb-3">
                <File className="w-5 h-5 text-primary" />
                <span>Document to Verify</span>
              </Label>
              
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
                  dragActive 
                    ? "border-primary bg-primary/10 scale-105" 
                    : selectedFile
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="pointer-events-none">
                  {selectedFile ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto border border-green-200 dark:border-green-800">
                        <FileText className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-600">{selectedFile.name}</p>
                        <div className="flex items-center justify-center space-x-2 text-muted-foreground mt-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{selectedFile.type || 'Unknown'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : dragActive ? (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 mx-auto text-primary" />
                      <p className="text-lg font-semibold text-primary">Drop your file here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-semibold mb-2">
                          Drag & drop your document here
                        </p>
                        <p className="text-muted-foreground mb-2">
                          or click to browse files
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, DOC, DOCX, Images, and Text files (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t">
              <Button
                onClick={handleHashVerification}
                disabled={!hashInput.trim() || !selectedFile || (hashValidation && hashValidation.status === 'invalid') || isVerifying}
                size="lg"
                className="flex-1 min-w-[200px] h-12"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Verify & Update Status
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearVerification}
                variant="outline"
                disabled={isVerifying}
                className="h-12 px-6"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Enhanced Tips */}
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Verification & Status Updates</span>
                  </h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Successfully verified documents will automatically update from "pending" to "verified"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Hash className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Hash comparison is case-insensitive with automatic normalization</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Search className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Multiple verification strategies ensure maximum accuracy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <BarChart3 className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Document status updates are reflected immediately in your Dashboard</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Wallet className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Connect wallet to enable automatic status management</span>
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* QR Scanner Modal */}
        <AnimatePresence>
          {showScanner && (
            <QRCodeScanner
              onScan={handleQRScan}
              onClose={() => setShowScanner(false)}
            />
          )}
        </AnimatePresence>

        {/* Verification Result */}
        <AnimatePresence>
          {verificationResult && (
            <VerificationResult result={verificationResult} />
          )}
        </AnimatePresence>

        {/* Verification History */}
        <AnimatePresence>
          {verificationHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span>Recent Verification Attempts</span>
                    <Badge variant="secondary" className="text-xs">
                      {verificationHistory.length} attempts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verificationHistory.map((attempt) => (
                      <motion.div
                        key={`${attempt.id}-${attempt.timestamp}-${Math.random().toString(36).substr(2, 9)}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-4 rounded-xl border-l-4",
                          attempt.status === 'success' 
                            ? "border-l-green-500 bg-green-50 dark:bg-green-900/20"
                            : attempt.status === 'failed'
                              ? "border-l-red-500 bg-red-50 dark:bg-red-900/20"
                              : attempt.status === 'error'
                                ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                                : "border-l-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <File className="w-4 h-4" />
                              <p className="font-medium">{attempt.fileName}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {new Date(attempt.timestamp).toLocaleString()}
                            </p>
                            {attempt.result?.statusUpdated && (
                              <div className="flex items-center space-x-1 text-xs">
                                <Sparkles className="w-3 h-3 text-green-600" />
                                <span className="text-green-600">Status updated to verified in records</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                attempt.status === 'success' ? 'default' : 
                                attempt.status === 'failed' ? 'destructive' :
                                attempt.status === 'error' ? 'secondary' : 
                                'outline'
                              }
                              className="text-xs"
                            >
                              <div className="flex items-center space-x-1">
                                {attempt.status === 'success' && <CheckCircle className="w-3 h-3" />}
                                {attempt.status === 'failed' && <XCircle className="w-3 h-3" />}
                                {attempt.status === 'error' && <AlertCircle className="w-3 h-3" />}
                                {attempt.status === 'processing' && <Clock className="w-3 h-3" />}
                                <span>
                                  {attempt.status === 'success' ? 'Verified' : 
                                   attempt.status === 'failed' ? 'Failed' :
                                   attempt.status === 'error' ? 'Error' : 'Processing'}
                                </span>
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Information for Failed Verifications */}
        <AnimatePresence>
          {verificationResult && !verificationResult.isValid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="w-5 h-5 text-yellow-600" />
                    <span>Debug Information</span>
                    <Badge variant="outline" className="text-xs">
                      Debugging
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <Bug className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-600">Expected Hash:</span>
                          </div>
                          <code className="block bg-muted p-3 rounded-lg font-mono text-xs break-all border">
                            {verificationResult.expectedHash}
                          </code>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-600">Generated Hash:</span>
                          </div>
                          <code className="block bg-muted p-3 rounded-lg font-mono text-xs break-all border">
                            {verificationResult.generatedHash}
                          </code>
                        </div>
                        
                        {verificationResult.debugInfo && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Bug className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-semibold text-yellow-600">Debug Details:</span>
                            </div>
                            <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto border">
                              {JSON.stringify(verificationResult.debugInfo, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VerificationPortal;