import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentPlusIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  QrCodeIcon,
  TrophyIcon,
  IdentificationIcon,
  CreditCardIcon,
  ScaleIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useWeb3 } from '../../context/Web3Context';
import BlockchainService from '../../services/blockchainService';
import { DocumentMetadata, DOCUMENT_TYPES, INSTITUTION_TYPES } from '../../types/DocumentTypes';
import QRCodeGenerator from '../qr/QRCodeGenerator';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const DocumentIssuanceWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState(new DocumentMetadata());
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuanceResult, setIssuanceResult] = useState(null);
  const [institutionRegistered, setInstitutionRegistered] = useState(false);
  const [institutionVerified, setInstitutionVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentInstitutionAddress, setCurrentInstitutionAddress] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAddress, setVerificationAddress] = useState('');

  const { provider, signer, account, isConnected, connectWallet } = useWeb3();

  // Institution type options with icons
  const institutionTypeOptions = [
    { value: 'university', label: 'University', icon: AcademicCapIcon },
    { value: 'college', label: 'College', icon: BuildingOfficeIcon },
    { value: 'school', label: 'School', icon: BuildingOfficeIcon },
    { value: 'government', label: 'Government', icon: ScaleIcon },
    { value: 'corporation', label: 'Corporation', icon: CreditCardIcon },
    { value: 'healthcare', label: 'Healthcare', icon: HeartIcon },
    { value: 'certification_body', label: 'Certification Body', icon: TrophyIcon },
    { value: 'other', label: 'Other', icon: ClipboardDocumentListIcon }
  ];

  // Document type options with icons
  const documentTypeOptions = [
    { value: 'certificate', label: 'Certificate', icon: TrophyIcon },
    { value: 'degree', label: 'Degree', icon: AcademicCapIcon },
    { value: 'diploma', label: 'Diploma', icon: AcademicCapIcon },
    { value: 'license', label: 'License', icon: IdentificationIcon },
    { value: 'transcript', label: 'Transcript', icon: DocumentPlusIcon },
    { value: 'other', label: 'Other', icon: ClipboardDocumentListIcon }
  ];

  // File drop handler
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      toast.success('📄 Document file selected successfully');
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

  // Check institution status on component mount
  useEffect(() => {
    const checkInstitutionStatus = async () => {
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
          toast.success('✅ Institution verified! You can now issue documents.');
        } else {
          toast.info('ℹ️ Institution needs to be registered and verified to issue documents.');
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
  const updateMetadata = (field, value) => {
    setMetadata(prev => {
      const currentData = prev.toJSON ? prev.toJSON() : prev;
      const updatedData = { ...currentData, [field]: value };
      return new DocumentMetadata(updatedData);
    });
  };

  // Register institution
  const registerInstitution = async () => {
    if (!isConnected) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    if (!metadata.issuerName || !metadata.issuerRegistrationNumber) {
      toast.error('❌ Please fill in institution details');
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
        toast.success('🏛️ Institution registered successfully!');
        toast.info('ℹ️ Institution needs to be verified by contract owner before issuing documents');
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('❌ Institution registration error:', error);
      toast.error('❌ Failed to register institution: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show verification modal
  const showVerificationInput = () => {
    if (!isConnected) {
      toast.error('❌ Please connect your wallet first');
      return;
    }
    setVerificationAddress(currentInstitutionAddress || '');
    setShowVerificationModal(true);
  };

  // Verify institution
  const verifyInstitution = async () => {
    const institutionAddress = verificationAddress.trim();

    if (!institutionAddress) {
      toast.error('❌ Institution address is required');
      return;
    }

    if (!institutionAddress.startsWith('0x') || institutionAddress.length !== 42) {
      toast.error('❌ Invalid Ethereum address format');
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
        toast.success(`🎉 Institution ${institutionAddress.slice(0, 6)}...${institutionAddress.slice(-4)} verified successfully!`);

        const isVerified = await blockchainService.isInstitutionVerified(institutionAddress);
        console.log('✅ Verification confirmed:', isVerified);
      } else {
        toast.error('❌ Failed to verify institution: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Institution verification error:', error);
      toast.error('❌ Institution verification failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Issue document on blockchain
  const issueDocument = async () => {
    console.log('🚀 Issue document button clicked');
    console.log('📄 Selected file:', selectedFile);
    console.log('🔗 Is connected:', isConnected);

    if (!selectedFile || !isConnected) {
      toast.error('❌ Please select a file and connect your wallet');
      return;
    }

    // Validate metadata
    let validation;
    if (typeof metadata.validate === 'function') {
      validation = metadata.validate();
    } else {
      const errors = [];
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
      toast.error('❌ Please fill in all required fields: ' + validation.errors.join(', '));
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

        toast.success('🎉 Document issued successfully on blockchain!');
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('❌ Document issuance error:', error);
      toast.error('❌ Failed to issue document: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Read file content
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
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
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setMetadata(new DocumentMetadata());
    setIssuanceResult(null);
    setInstitutionRegistered(false);
  };

  const steps = [
    { id: 1, name: 'Institution Setup', icon: BuildingOfficeIcon },
    { id: 2, name: 'Document Upload', icon: CloudArrowUpIcon },
    { id: 3, name: 'Metadata & Issue', icon: DocumentPlusIcon },
    { id: 4, name: 'QR Code & Complete', icon: QrCodeIcon }
  ];

  return (
    <div className="min-h-screen py-8">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(var(--color-primary), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(var(--color-success), 0.1) 0%, transparent 50%)
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
            <div className="p-4 bg-[rgb(var(--color-primary)/0.1)] rounded-2xl w-fit mx-auto mb-4 border border-[rgb(var(--color-primary)/0.3)]">
              <DocumentPlusIcon className="h-16 w-16 text-[rgb(var(--color-primary))]" />
            </div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                background: `rgb(var(--color-primary))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Document Issuance Workflow
            </h1>
            <p className="text-xl text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">
              Issue authentic documents on the blockchain for decentralized verification
            </p>
          </motion.div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgb(var(--color-warning)/0.1)] border border-[rgb(var(--color-warning)/0.3)] rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-[rgb(var(--color-warning))] mr-2" />
                <span className="text-[rgb(var(--text-primary))]">
                  Please connect your wallet to issue documents on the blockchain.
                </span>
              </div>
              <Button
                onClick={connectWallet}
                variant="primary"
                size="sm"
              >
                Connect Wallet
              </Button>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))] text-white'
                    : 'bg-[rgb(var(--surface-primary))] border-[rgb(var(--border-primary))] text-[rgb(var(--text-quaternary))]'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--text-quaternary))]'
                  }`}>
                    Step {step.id}
                  </div>
                  <div className={`text-xs ${
                    currentStep >= step.id ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-quaternary))]'
                  }`}>
                    {step.name}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRightIcon className="h-5 w-5 text-[rgb(var(--text-quaternary))] mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

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
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <h2 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Institution Registration</h2>
              </div>

              {/* Loading Status */}
              {checkingStatus && (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" color="primary" text="Checking institution status..." />
                </div>
              )}

              {/* Institution Status */}
              {!checkingStatus && institutionVerified && (
                <div className="bg-[rgb(var(--color-success)/0.1)] border border-[rgb(var(--color-success)/0.3)] rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-[rgb(var(--color-success))] mr-3" />
                    <div>
                      <h3 className="text-[rgb(var(--color-success))] font-medium">Institution Verified ✅</h3>
                      <p className="text-[rgb(var(--text-secondary))] text-sm">Your institution is registered and verified. You can issue documents!</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="primary"
                    >
                      Continue to Document Upload
                    </Button>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              {!checkingStatus && !institutionVerified && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Institution Name *
                      </label>
                      <input
                        type="text"
                        value={metadata.issuerName}
                        onChange={(e) => updateMetadata('issuerName', e.target.value)}
                        className="input-field"
                        placeholder="e.g., University of Technology"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Institution Type
                      </label>
                      <select
                        value={metadata.issuerType}
                        onChange={(e) => updateMetadata('issuerType', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select type</option>
                        {institutionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        value={metadata.issuerRegistrationNumber}
                        onChange={(e) => updateMetadata('issuerRegistrationNumber', e.target.value)}
                        className="input-field"
                        placeholder="Official registration number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Contact Information
                      </label>
                      <input
                        type="text"
                        value={metadata.issuerContact}
                        onChange={(e) => updateMetadata('issuerContact', e.target.value)}
                        className="input-field"
                        placeholder="Email or phone number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Institution Address
                      </label>
                      <textarea
                        value={metadata.issuerAddress}
                        onChange={(e) => updateMetadata('issuerAddress', e.target.value)}
                        rows={3}
                        className="input-field"
                        placeholder="Physical address of the institution"
                      />
                    </div>
                  </div>

                  {/* Verification Info */}
                  <div className="mt-6 bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
                    <h4 className="font-medium text-[rgb(var(--color-primary))] mb-2">Institution Verification Required</h4>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-3">
                      After registration, your institution must be verified by the contract owner before you can issue documents.
                    </p>
                    <div className="text-xs text-[rgb(var(--text-tertiary))] space-y-1">
                      <p>• <strong>Contract Owner:</strong> 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
                      <p>• <strong>Your Institution Address:</strong>
                        <span className="font-mono text-[rgb(var(--color-primary))] ml-1">{currentInstitutionAddress || 'Loading...'}</span>
                        {currentInstitutionAddress && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(currentInstitutionAddress);
                              toast.success('📋 Address copied to clipboard!');
                            }}
                            className="ml-2 text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] text-xs"
                            title="Copy address"
                          >
                            📋
                          </button>
                        )}
                      </p>
                      <p>• Only the contract owner can verify institutions</p>
                      <p>• Switch to the owner account and click "Verify Institution"</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button
                      onClick={showVerificationInput}
                      disabled={isProcessing || !isConnected}
                      variant="success"
                      loading={isProcessing}
                    >
                      Verify Institution (Owner Only)
                    </Button>

                    <Button
                      onClick={registerInstitution}
                      disabled={isProcessing || !isConnected}
                      variant="primary"
                      loading={isProcessing}
                    >
                      Register Institution
                    </Button>
                  </div>
                </>
              )}
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
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                  <CloudArrowUpIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <h2 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Upload Document</h2>
              </div>

              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)]'
                    : selectedFile
                      ? 'border-[rgb(var(--color-success))] bg-[rgb(var(--color-success)/0.1)]'
                      : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))]'
                }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className={`h-12 w-12 mx-auto mb-4 ${
                  isDragActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--text-quaternary))]'
                }`} />

                {selectedFile ? (
                  <div>
                    <p className="text-lg font-medium text-[rgb(var(--color-success))] mb-2">
                      File Selected: {selectedFile.name}
                    </p>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">
                      {isDragActive ? 'Drop the document here' : 'Drag & drop a document here'}
                    </p>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      or click to select a file (PDF, DOC, DOCX, Images)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="secondary"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedFile}
                  variant="primary"
                >
                  Next: Add Metadata
                </Button>
              </div>
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
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                  <DocumentPlusIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <h2 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Document Metadata</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Document Type *
                  </label>
                  <select
                    value={metadata.documentType}
                    onChange={(e) => updateMetadata('documentType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select document type</option>
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => updateMetadata('title', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={metadata.recipientName}
                    onChange={(e) => updateMetadata('recipientName', e.target.value)}
                    className="input-field"
                    placeholder="Full name of the recipient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Recipient ID
                  </label>
                  <input
                    type="text"
                    value={metadata.recipientId}
                    onChange={(e) => updateMetadata('recipientId', e.target.value)}
                    className="input-field"
                    placeholder="Student ID, Employee ID, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Issuance Date *
                  </label>
                  <input
                    type="date"
                    value={metadata.issuanceDate ? new Date(metadata.issuanceDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateMetadata('issuanceDate', new Date(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={metadata.expirationDate ? new Date(metadata.expirationDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateMetadata('expirationDate', e.target.value ? new Date(e.target.value) : null)}
                    className="input-field"
                  />
                </div>

                {/* Academic Fields */}
                {(metadata.documentType === 'degree' || metadata.documentType === 'diploma') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Program/Course
                      </label>
                      <input
                        type="text"
                        value={metadata.program}
                        onChange={(e) => updateMetadata('program', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Major
                      </label>
                      <input
                        type="text"
                        value={metadata.major}
                        onChange={(e) => updateMetadata('major', e.target.value)}
                        className="input-field"
                        placeholder="Primary field of study"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={metadata.gpa}
                        onChange={(e) => updateMetadata('gpa', e.target.value)}
                        className="input-field"
                        placeholder="e.g., 3.85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Graduation Date
                      </label>
                      <input
                        type="date"
                        value={metadata.graduationDate ? new Date(metadata.graduationDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateMetadata('graduationDate', e.target.value ? new Date(e.target.value) : null)}
                        className="input-field"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Description
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => updateMetadata('description', e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Additional details about the document"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="secondary"
                >
                  Back
                </Button>
                <Button
                  onClick={issueDocument}
                  disabled={isProcessing || !isConnected}
                  variant="primary"
                  loading={isProcessing}
                >
                  Issue Document on Blockchain
                </Button>
              </div>
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
              <div className="bg-[rgb(var(--color-success)/0.1)] border border-[rgb(var(--color-success)/0.3)] rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-[rgb(var(--color-success))] mr-3" />
                  <div>
                    <h2 className="text-2xl font-semibold text-[rgb(var(--color-success))]">
                      Document Issued Successfully!
                    </h2>
                    <p className="text-[rgb(var(--text-secondary))]">
                      Your document has been recorded on the blockchain and is now verifiable by third parties.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-[rgb(var(--color-success))]">Transaction Hash:</span>
                    <div className="font-mono text-[rgb(var(--text-secondary))] break-all">
                      {issuanceResult.transactionHash}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-[rgb(var(--color-success))]">Block Number:</span>
                    <div className="text-[rgb(var(--text-secondary))]">{issuanceResult.blockNumber}</div>
                  </div>
                  <div>
                    <span className="font-medium text-[rgb(var(--color-success))]">Document Hash:</span>
                    <div className="font-mono text-[rgb(var(--text-secondary))] break-all">
                      {issuanceResult.documentHash}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-[rgb(var(--color-success))]">Gas Used:</span>
                    <div className="text-[rgb(var(--text-secondary))]">{issuanceResult.gasUsed}</div>
                  </div>
                </div>
              </div>

              {/* QR Code Generator */}
              <QRCodeGenerator
                documentHash={issuanceResult.documentHash}
                transactionHash={issuanceResult.transactionHash}
                contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
                metadata={issuanceResult.metadata}
              />

              {/* Action Buttons */}
              <div className="card">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Next Steps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={resetWorkflow}
                    variant="primary"
                    icon={DocumentPlusIcon}
                    className="h-12"
                  >
                    Issue Another Document
                  </Button>

                  <Button
                    onClick={() => window.open('/verify', '_blank')}
                    variant="secondary"
                    icon={QrCodeIcon}
                    className="h-12"
                  >
                    Test Verification
                  </Button>
                </div>

                <div className="mt-6 bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] rounded-lg p-4">
                  <h4 className="font-medium text-[rgb(var(--color-primary))] mb-2">Important Notes</h4>
                  <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-1">
                    <li>• Save the QR code and embed it in your document</li>
                    <li>• Share the verification URL with recipients</li>
                    <li>• Keep the transaction hash for your records</li>
                    <li>• Third parties can verify without accessing your servers</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Verify Institution</h3>
              <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">
                Enter the wallet address of the institution you want to verify:
              </p>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={verificationAddress}
                  onChange={(e) => setVerificationAddress(e.target.value)}
                  placeholder="0x1234567890123456789012345678901234567890"
                  className="input-field pr-20"
                />
                {currentInstitutionAddress && (
                  <button
                    onClick={() => setVerificationAddress(currentInstitutionAddress)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-[rgb(var(--color-primary))] text-white px-2 py-1 rounded hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
                  >
                    Use Current
                  </button>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowVerificationModal(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={verifyInstitution}
                  disabled={isProcessing || !verificationAddress.trim()}
                  variant="success"
                  loading={isProcessing}
                >
                  Verify Institution
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentIssuanceWorkflow;
