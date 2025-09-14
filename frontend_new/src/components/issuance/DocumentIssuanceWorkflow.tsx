import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus,
  Building,
  User,
  Calendar,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  QrCode,
  Trophy,
  CreditCard,
  Scale,
  Heart,
  ClipboardList,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useWeb3 } from '../../context/Web3Context';
import BlockchainService from '../../services/blockchainService';
import { DocumentMetadata, DOCUMENT_TYPES, INSTITUTION_TYPES } from '../../types/document.types';
import QRCodeGenerator from '../qr/QRCodeGenerator';

// Types and Interfaces
interface Step {
  id: number;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface InstitutionTypeOption {
  value: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface DocumentTypeOption {
  value: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface IssuanceResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  documentHash?: string;
  metadata?: any;
  error?: string;
}

interface InstitutionInfo {
  name: string;
  registrationNumber: string;
  contactInfo: string;
  isVerified: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const DocumentIssuanceWorkflow: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata>(new DocumentMetadata());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [issuanceResult, setIssuanceResult] = useState<IssuanceResult | null>(null);
  const [institutionRegistered, setInstitutionRegistered] = useState<boolean>(false);
  const [institutionVerified, setInstitutionVerified] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [currentInstitutionAddress, setCurrentInstitutionAddress] = useState<string>('');
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [verificationAddress, setVerificationAddress] = useState<string>('');

  // Web3 Context
  const { provider, signer, account, isConnected, connectWallet } = useWeb3();

  // Institution type options with icons
  const institutionTypeOptions: InstitutionTypeOption[] = [
    { value: 'university', label: 'University', icon: GraduationCap },
    { value: 'college', label: 'College', icon: Building },
    { value: 'school', label: 'School', icon: Building },
    { value: 'government', label: 'Government', icon: Scale },
    { value: 'corporation', label: 'Corporation', icon: CreditCard },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'certification_body', label: 'Certification Body', icon: Trophy },
    { value: 'other', label: 'Other', icon: ClipboardList }
  ];

  // Document type options with icons
  const documentTypeOptions: DocumentTypeOption[] = [
    { value: 'certificate', label: 'Certificate', icon: Trophy },
    { value: 'degree', label: 'Degree', icon: GraduationCap },
    { value: 'diploma', label: 'Diploma', icon: GraduationCap },
    { value: 'license', label: 'License', icon: CreditCard },
    { value: 'transcript', label: 'Transcript', icon: FilePlus },
    { value: 'other', label: 'Other', icon: ClipboardList }
  ];

  // Workflow steps
  const steps: Step[] = [
    { id: 1, name: 'Institution Setup', icon: Building },
    { id: 2, name: 'Document Upload', icon: Upload },
    { id: 3, name: 'Metadata & Issue', icon: FilePlus },
    { id: 4, name: 'QR Code & Complete', icon: QrCode }
  ];

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      toast.success('Document Selected', {
        description: 'Document file selected successfully',
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

  // Check institution status on component mount
  useEffect(() => {
    const checkInstitutionStatus = async (): Promise<void> => {
      if (!isConnected || !signer) {
        setCheckingStatus(false);
        return;
      }

      try {
        const blockchainService = new BlockchainService(provider, signer);
        await blockchainService.initialize();

        const accountAddress = await signer.getAddress();
        setCurrentInstitutionAddress(accountAddress);

        // Check if institution is verified
        const isVerified = await blockchainService.isInstitutionVerified(accountAddress);

        setInstitutionVerified(isVerified);
        setInstitutionRegistered(true);

        // If verified, get institution info and populate metadata
        if (isVerified) {
          const institutionInfo = await blockchainService.getInstitutionInfo(accountAddress);
          if (institutionInfo) {
            setMetadata(prev => {
              const currentData = prev.toJSON ? prev.toJSON() : prev;
              const updatedData = {
                ...currentData,
                issuerName: institutionInfo.name,
                issuerRegistrationNumber: institutionInfo.registrationNumber,
                issuerContact: institutionInfo.contactInfo,
                issuerType: 'university'
              };
              return new DocumentMetadata(updatedData);
            });

            console.log('✅ Institution info loaded:', institutionInfo);
          }

          setCurrentStep(2);
          toast.success('Institution Verified', {
            description: 'Institution verified! You can now issue documents.',
          });
        } else {
          toast.info('Registration Required', {
            description: 'Institution needs to be registered and verified to issue documents.',
          });
        }

      } catch (error) {
        console.error('❌ Error checking institution status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkInstitutionStatus();
  }, [isConnected, signer, provider]);

  // Update metadata
  const updateMetadata = useCallback((field: string, value: any): void => {
    setMetadata(prev => {
      const currentData = prev.toJSON ? prev.toJSON() : prev;
      const updatedData = { ...currentData, [field]: value };
      return new DocumentMetadata(updatedData);
    });
  }, []);

  // Register institution
  const registerInstitution = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    if (!metadata.issuerName || !metadata.issuerRegistrationNumber) {
      toast.error('Missing Information', {
        description: 'Please fill in institution details',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const blockchainService = new BlockchainService(provider, signer);
      await blockchainService.initialize();

      const result = await blockchainService.registerInstitution(
        metadata.issuerName,
        metadata.issuerRegistrationNumber,
        metadata.issuerContact || ''
      );

      if (result.success) {
        setInstitutionRegistered(true);
        toast.success('Institution Registered', {
          description: 'Institution registered successfully!',
        });
        toast.info('Verification Pending', {
          description: 'Institution needs to be verified by contract owner before issuing documents',
        });
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('❌ Institution registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Registration Failed', {
        description: `Failed to register institution: ${errorMessage}`,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, metadata, provider, signer]);

  // Show verification modal
  const showVerificationInput = useCallback((): void => {
    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }
    setVerificationAddress(currentInstitutionAddress || '');
    setShowVerificationModal(true);
  }, [isConnected, currentInstitutionAddress]);

  // Verify institution
  const verifyInstitution = useCallback(async (): Promise<void> => {
    const institutionAddress = verificationAddress.trim();

    if (!institutionAddress) {
      toast.error('Address Required', {
        description: 'Institution address is required',
      });
      return;
    }

    if (!institutionAddress.startsWith('0x') || institutionAddress.length !== 42) {
      toast.error('Invalid Address', {
        description: 'Invalid Ethereum address format',
      });
      return;
    }

    console.log('🔍 Verifying institution address:', institutionAddress);
    setIsProcessing(true);
    setShowVerificationModal(false);

    try {
      const blockchainService = new BlockchainService(provider, signer);
      await blockchainService.initialize();

      const result = await blockchainService.verifyInstitution(institutionAddress);

      if (result.success) {
        toast.success('Institution Verified', {
          description: `Institution ${institutionAddress.slice(0, 6)}...${institutionAddress.slice(-4)} verified successfully!`,
        });

        const isVerified = await blockchainService.isInstitutionVerified(institutionAddress);
        console.log('✅ Verification confirmed:', isVerified);
      } else {
        toast.error('Verification Failed', {
          description: `Failed to verify institution: ${result.error}`,
        });
      }
    } catch (error) {
      console.error('❌ Institution verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Verification Error', {
        description: `Institution verification failed: ${errorMessage}`,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [verificationAddress, provider, signer]);

  // Read file content
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

  // Issue document on blockchain
  const issueDocument = useCallback(async (): Promise<void> => {
    console.log('🚀 Issue document button clicked');
    console.log('📄 Selected file:', selectedFile);
    console.log('🔗 Is connected:', isConnected);

    if (!selectedFile || !isConnected) {
      toast.error('Missing Requirements', {
        description: 'Please select a file and connect your wallet',
      });
      return;
    }

    // Validate metadata
    let validation: ValidationResult;
    if (typeof metadata.validate === 'function') {
      validation = metadata.validate();
    } else {
      const errors: string[] = [];
      if (!metadata.documentType) errors.push('Document type is required');
      if (!metadata.title) errors.push('Document title is required');
      if (!metadata.recipientName) errors.push('Recipient name is required');
      if (!metadata.issuerName) errors.push('Issuer name is required');
      if (!metadata.issuanceDate) errors.push('Issuance date is required');

      validation = {
        isValid: errors.length === 0,
        errors
      };
    }

    if (!validation.isValid) {
      toast.error('Validation Failed', {
        description: `Please fill in all required fields: ${validation.errors.join(', ')}`,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fileContent = await readFileContent(selectedFile);
      const blockchainService = new BlockchainService(provider, signer);
      await blockchainService.initialize();

      const metadataInstance = metadata.toJSON ? metadata : new DocumentMetadata(metadata);
      const documentHash = blockchainService.createDocumentHash(fileContent, metadataInstance);

      const result = await blockchainService.issueDocument(
        documentHash,
        metadataInstance,
        '',
        '0x'
      );

      if (result.success) {
        setIssuanceResult({
          ...result,
          documentHash,
          metadata: metadata.toJSON()
        });

        toast.success('Document Issued', {
          description: 'Document issued successfully on blockchain!',
        });
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('❌ Document issuance error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Issuance Failed', {
        description: `Failed to issue document: ${errorMessage}`,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, isConnected, metadata, readFileContent, provider, signer]);

  // Reset workflow
  const resetWorkflow = useCallback((): void => {
    setCurrentStep(1);
    setSelectedFile(null);
    setMetadata(new DocumentMetadata());
    setIssuanceResult(null);
    setInstitutionRegistered(false);
  }, []);

  // Copy address to clipboard
  const copyAddress = useCallback(async (address: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address Copied', {
        description: 'Address copied to clipboard!',
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy address to clipboard',
      });
    }
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%)
          `
        }}
      />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 border border-primary/30">
              <FilePlus className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Document Issuance Workflow
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Issue authentic documents on the blockchain for decentralized verification
            </p>
          </motion.div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <span>Please connect your wallet to issue documents on the blockchain.</span>
                <Button onClick={connectWallet} size="sm">
                  Connect Wallet
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground"
                  )}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      Step {step.id}
                    </div>
                    <div className={cn(
                      "text-xs",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.name}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Institution Setup */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <span>Institution Registration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Loading Status */}
                  {checkingStatus && (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Checking institution status...</p>
                    </div>
                  )}

                  {/* Institution Status */}
                  {!checkingStatus && institutionVerified && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <h3 className="text-green-600 font-medium">Institution Verified ✅</h3>
                          <p className="text-sm">Your institution is registered and verified. You can issue documents!</p>
                          <Button onClick={() => setCurrentStep(2)} className="mt-2">
                            Continue to Document Upload
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Registration Form */}
                  {!checkingStatus && !institutionVerified && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="institutionName">Institution Name *</Label>
                          <Input
                            id="institutionName"
                            type="text"
                            value={metadata.issuerName}
                            onChange={(e) => updateMetadata('issuerName', e.target.value)}
                            placeholder="e.g., University of Technology"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="institutionType">Institution Type</Label>
                          <Select
                            value={metadata.issuerType}
                            onValueChange={(value) => updateMetadata('issuerType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {institutionTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Registration Number *</Label>
                          <Input
                            id="registrationNumber"
                            type="text"
                            value={metadata.issuerRegistrationNumber}
                            onChange={(e) => updateMetadata('issuerRegistrationNumber', e.target.value)}
                            placeholder="Official registration number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact">Contact Information</Label>
                          <Input
                            id="contact"
                            type="text"
                            value={metadata.issuerContact}
                            onChange={(e) => updateMetadata('issuerContact', e.target.value)}
                            placeholder="Email or phone number"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="address">Institution Address</Label>
                          <Textarea
                            id="address"
                            value={metadata.issuerAddress}
                            onChange={(e) => updateMetadata('issuerAddress', e.target.value)}
                            rows={3}
                            placeholder="Physical address of the institution"
                          />
                        </div>
                      </div>

                      {/* Verification Info */}
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <h4 className="font-medium text-primary">Institution Verification Required</h4>
                            <p className="text-sm">
                              After registration, your institution must be verified by the contract owner before you can issue documents.
                            </p>
                            <div className="text-xs space-y-1 mt-3">
                              <p>• <strong>Contract Owner:</strong> 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
                              <p className="flex items-center">
                                • <strong>Your Institution Address:</strong>
                                <code className="font-mono text-primary ml-1 mr-2">
                                  {currentInstitutionAddress || 'Loading...'}
                                </code>
                                {currentInstitutionAddress && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyAddress(currentInstitutionAddress)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Copy
                                  </Button>
                                )}
                              </p>
                              <p>• Only the contract owner can verify institutions</p>
                              <p>• Switch to the owner account and click "Verify Institution"</p>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>

                      <div className="flex justify-between">
                        <Button
                          onClick={showVerificationInput}
                          disabled={isProcessing || !isConnected}
                          variant="outline"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Verify Institution (Owner Only)
                        </Button>

                        <Button
                          onClick={registerInstitution}
                          disabled={isProcessing || !isConnected}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Register Institution
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Document Upload */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <span>Upload Document</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Drop Zone */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : selectedFile
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-border hover:border-primary"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className={cn(
                      "h-12 w-12 mx-auto mb-4",
                      isDragActive ? "text-primary" : "text-muted-foreground"
                    )} />

                    {selectedFile ? (
                      <div>
                        <p className="text-lg font-medium text-green-600 mb-2">
                          File Selected: {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">
                          {isDragActive ? 'Drop the document here' : 'Drag & drop a document here'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to select a file (PDF, DOC, DOCX, Images)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedFile}
                    >
                      Next: Add Metadata
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Metadata & Issue */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FilePlus className="w-5 h-5 text-primary" />
                    </div>
                    <span>Document Metadata</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type *</Label>
                      <Select
                        value={metadata.documentType}
                        onValueChange={(value) => updateMetadata('documentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title *</Label>
                      <Input
                        id="title"
                        type="text"
                        value={metadata.title}
                        onChange={(e) => updateMetadata('title', e.target.value)}
                        placeholder="e.g., Bachelor of Science in Computer Science"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name *</Label>
                      <Input
                        id="recipientName"
                        type="text"
                        value={metadata.recipientName}
                        onChange={(e) => updateMetadata('recipientName', e.target.value)}
                        placeholder="Full name of the recipient"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientId">Recipient ID</Label>
                      <Input
                        id="recipientId"
                        type="text"
                        value={metadata.recipientId}
                        onChange={(e) => updateMetadata('recipientId', e.target.value)}
                        placeholder="Student ID, Employee ID, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issuanceDate">Issuance Date *</Label>
                      <Input
                        id="issuanceDate"
                        type="date"
                        value={metadata.issuanceDate ? new Date(metadata.issuanceDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateMetadata('issuanceDate', new Date(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                      <Input
                        id="expirationDate"
                        type="date"
                        value={metadata.expirationDate ? new Date(metadata.expirationDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateMetadata('expirationDate', e.target.value ? new Date(e.target.value) : null)}
                      />
                    </div>

                    {/* Academic Fields */}
                    {(metadata.documentType === 'degree' || metadata.documentType === 'diploma') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="program">Program/Course</Label>
                          <Input
                            id="program"
                            type="text"
                            value={metadata.program}
                            onChange={(e) => updateMetadata('program', e.target.value)}
                            placeholder="e.g., Computer Science"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            type="text"
                            value={metadata.major}
                            onChange={(e) => updateMetadata('major', e.target.value)}
                            placeholder="Primary field of study"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gpa">GPA</Label>
                          <Input
                            id="gpa"
                            type="text"
                            value={metadata.gpa}
                            onChange={(e) => updateMetadata('gpa', e.target.value)}
                            placeholder="e.g., 3.85"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="graduationDate">Graduation Date</Label>
                          <Input
                            id="graduationDate"
                            type="date"
                            value={metadata.graduationDate ? new Date(metadata.graduationDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateMetadata('graduationDate', e.target.value ? new Date(e.target.value) : null)}
                          />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={metadata.description}
                        onChange={(e) => updateMetadata('description', e.target.value)}
                        rows={3}
                        placeholder="Additional details about the document"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button onClick={() => setCurrentStep(2)} variant="outline">
                      Back
                    </Button>
                    <Button
                      onClick={issueDocument}
                      disabled={isProcessing || !isConnected}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Issue Document on Blockchain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: QR Code & Complete */}
          {currentStep === 4 && issuanceResult && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-green-600">
                        Document Issued Successfully!
                      </h2>
                      <p className="text-muted-foreground">
                        Your document has been recorded on the blockchain and is now verifiable by third parties.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-600">Transaction Hash:</span>
                        <div className="font-mono text-muted-foreground break-all">
                          {issuanceResult.transactionHash}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">Block Number:</span>
                        <div className="text-muted-foreground">{issuanceResult.blockNumber}</div>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">Document Hash:</span>
                        <div className="font-mono text-muted-foreground break-all">
                          {issuanceResult.documentHash}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">Gas Used:</span>
                        <div className="text-muted-foreground">{issuanceResult.gasUsed}</div>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* QR Code Generator */}
              <QRCodeGenerator
                documentHash={issuanceResult.documentHash || ''}
                transactionHash={issuanceResult.transactionHash}
                contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
                metadata={issuanceResult.metadata}
              />

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={resetWorkflow} className="h-12">
                      <FilePlus className="w-4 h-4 mr-2" />
                      Issue Another Document
                    </Button>

                    <Button
                      onClick={() => window.open('/verify', '_blank')}
                      variant="outline"
                      className="h-12"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Test Verification
                    </Button>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Important Notes</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Save the QR code and embed it in your document</li>
                          <li>• Share the verification URL with recipients</li>
                          <li>• Keep the transaction hash for your records</li>
                          <li>• Third parties can verify without accessing your servers</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Institution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Enter the wallet address of the institution you want to verify:
            </p>

            <div className="space-y-2">
              <Label htmlFor="verificationAddress">Institution Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="verificationAddress"
                  type="text"
                  value={verificationAddress}
                  onChange={(e) => setVerificationAddress(e.target.value)}
                  placeholder="0x1234567890123456789012345678901234567890"
                  className="font-mono"
                />
                {currentInstitutionAddress && (
                  <Button
                    onClick={() => setVerificationAddress(currentInstitutionAddress)}
                    variant="outline"
                    size="sm"
                  >
                    Use Current
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowVerificationModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={verifyInstitution}
              disabled={isProcessing || !verificationAddress.trim()}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Verify Institution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentIssuanceWorkflow;
