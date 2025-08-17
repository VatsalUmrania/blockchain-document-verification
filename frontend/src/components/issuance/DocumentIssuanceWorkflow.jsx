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
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useWeb3 } from '../../context/Web3Context';
import BlockchainService from '../../services/blockchainService';
import { DocumentMetadata, DOCUMENT_TYPES, INSTITUTION_TYPES } from '../../types/DocumentTypes';
import QRCodeGenerator from '../qr/QRCodeGenerator';

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
        setInstitutionRegistered(true); // If verified, must be registered

        // If verified, get institution info and populate metadata
        if (isVerified) {
          const institutionInfo = await blockchainService.getInstitutionInfo(accountAddress);

          if (institutionInfo) {
            // Update metadata with institution information
            setMetadata(prev => {
              const currentData = prev.toJSON ? prev.toJSON() : prev;
              const updatedData = {
                ...currentData,
                issuerName: institutionInfo.name,
                issuerRegistrationNumber: institutionInfo.registrationNumber,
                issuerContact: institutionInfo.contactInfo,
                issuerType: 'university' // Default type, can be updated later
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
      // Create a new DocumentMetadata instance with updated values
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

  // Verify institution (only contract owner can do this)
  const verifyInstitution = async () => {
    const institutionAddress = verificationAddress.trim();

    // Basic validation
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

        // Check verification status
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
    console.log('📋 Metadata:', metadata);
    console.log('📋 Metadata JSON:', metadata.toJSON ? metadata.toJSON() : metadata);

    if (!selectedFile || !isConnected) {
      toast.error('❌ Please select a file and connect your wallet');
      return;
    }

    // Validate metadata
    let validation;
    if (typeof metadata.validate === 'function') {
      validation = metadata.validate();
    } else {
      // Fallback validation if metadata is not a DocumentMetadata instance
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

    console.log('✅ Validation result:', validation);

    if (!validation.isValid) {
      toast.error('❌ Please fill in all required fields: ' + validation.errors.join(', '));
      console.log('❌ Validation errors:', validation.errors);
      return;
    }

    setIsProcessing(true);

    try {
      // Read file content
      const fileContent = await readFileContent(selectedFile);

      // Initialize blockchain service
      const blockchainService = new BlockchainService(provider, signer);
      await blockchainService.initialize();

      // Ensure metadata is a DocumentMetadata instance
      const metadataInstance = metadata.toJSON ? metadata : new DocumentMetadata(metadata);

      // Create document hash
      const documentHash = blockchainService.createDocumentHash(fileContent, metadataInstance);

      // Issue document on blockchain
      const result = await blockchainService.issueDocument(
        documentHash,
        metadataInstance,
        '', // metadataURI - could be IPFS hash
        '0x' // issuerSignature - could be actual signature
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
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DocumentPlusIcon className="h-16 w-16 text-[#296CFF] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-[#E0E0E0] mb-2">
              Document Issuance Workflow
            </h1>
            <p className="text-xl text-[#B0B0B0] max-w-2xl mx-auto">
              Issue authentic documents on the blockchain for decentralized verification
            </p>
          </motion.div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2A2A2A] border border-[#444444] rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-[#E0E0E0]">
                Please connect your wallet to issue documents on the blockchain.
              </span>
              <button
                onClick={connectWallet}
                className="ml-auto bg-[#296CFF] text-white px-4 py-2 rounded-lg hover:bg-[#2979FF] transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${currentStep >= step.id
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                    Step {step.id}
                  </div>
                  <div className={`text-xs ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                    {step.name}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 mx-4" />
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
              className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-[#E0E0E0] mb-6">Institution Registration</h2>

              {/* Loading Status */}
              {checkingStatus && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#296CFF] mx-auto mb-4"></div>
                  <p className="text-[#B0B0B0]">Checking institution status...</p>
                </div>
              )}

              {/* Institution Status */}
              {!checkingStatus && institutionVerified && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
                    <div>
                      <h3 className="text-green-300 font-medium">Institution Verified ✅</h3>
                      <p className="text-green-200 text-sm">Your institution is registered and verified. You can issue documents!</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-[#296CFF] text-white rounded-lg hover:bg-[#2979FF] transition-colors"
                    >
                      Continue to Document Upload
                    </button>
                  </div>
                </div>
              )}

              {/* Registration Form - only show if not verified */}
              {!checkingStatus && !institutionVerified && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Institution Name *
                      </label>
                      <input
                        type="text"
                        value={metadata.issuerName}
                        onChange={(e) => updateMetadata('issuerName', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="e.g., University of Technology"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Institution Type
                      </label>
                      <select
                        value={metadata.issuerType}
                        onChange={(e) => updateMetadata('issuerType', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                      >
                        <option value="">Select type</option>
                        {Object.entries(INSTITUTION_TYPES).map(([key, value]) => (
                          <option key={key} value={value}>
                            {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        value={metadata.issuerRegistrationNumber}
                        onChange={(e) => updateMetadata('issuerRegistrationNumber', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="Official registration number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Contact Information
                      </label>
                      <input
                        type="text"
                        value={metadata.issuerContact}
                        onChange={(e) => updateMetadata('issuerContact', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="Email or phone number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Institution Address
                      </label>
                      <textarea
                        value={metadata.issuerAddress}
                        onChange={(e) => updateMetadata('issuerAddress', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="Physical address of the institution"
                      />
                    </div>
                  </div>

                  {/* Verification Info */}
                  <div className="mt-6 bg-[#2A2A2A] border border-[#444444] rounded-lg p-4">
                    <h4 className="font-medium text-[#296CFF] mb-2">Institution Verification Required</h4>
                    <p className="text-sm text-[#B0B0B0] mb-3">
                      After registration, your institution must be verified by the contract owner before you can issue documents.
                    </p>
                    <div className="text-xs text-[#888888] space-y-1">
                      <p>• <strong>Contract Owner:</strong> 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
                      <p>• <strong>Your Institution Address:</strong>
                        <span className="font-mono text-[#296CFF] ml-1">{currentInstitutionAddress || 'Loading...'}</span>
                        {currentInstitutionAddress && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(currentInstitutionAddress);
                              toast.success('📋 Address copied to clipboard!');
                            }}
                            className="ml-2 text-[#296CFF] hover:text-[#2979FF] text-xs"
                            title="Copy address"
                          >
                            📋
                          </button>
                        )}
                      </p>
                      <p>• Only the contract owner can verify institutions</p>
                      <p>• Switch to the owner account and click "Verify Institution"</p>
                      <p>• The verification button will ask for the institution address to verify</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={showVerificationInput}
                      disabled={isProcessing || !isConnected}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify Institution (Owner Only)'
                      )}
                    </button>

                    <button
                      onClick={registerInstitution}
                      disabled={isProcessing || !isConnected}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Registering...
                        </div>
                      ) : (
                        'Register Institution'
                      )}
                    </button>
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
              className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-[#E0E0E0] mb-6">Upload Document</h2>

              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
                  ? 'border-purple-500 bg-purple-50'
                  : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />

                {selectedFile ? (
                  <div>
                    <p className="text-lg font-medium text-green-700 mb-2">
                      File Selected: {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {isDragActive ? 'Drop the document here' : 'Drag & drop a document here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to select a file (PDF, DOC, DOCX, Images)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedFile}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next: Add Metadata
                </button>
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
              className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-[#E0E0E0] mb-6">Document Metadata</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Document Type *
                  </label>
                  <select
                    value={metadata.documentType}
                    onChange={(e) => updateMetadata('documentType', e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                  >
                    <option value="">Select document type</option>
                    {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => updateMetadata('title', e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={metadata.recipientName}
                    onChange={(e) => updateMetadata('recipientName', e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                    placeholder="Full name of the recipient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Recipient ID
                  </label>
                  <input
                    type="text"
                    value={metadata.recipientId}
                    onChange={(e) => updateMetadata('recipientId', e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                    placeholder="Student ID, Employee ID, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Issuance Date *
                  </label>
                  <input
                    type="date"
                    value={metadata.issuanceDate ? new Date(metadata.issuanceDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateMetadata('issuanceDate', new Date(e.target.value))}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={metadata.expirationDate ? new Date(metadata.expirationDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateMetadata('expirationDate', e.target.value ? new Date(e.target.value) : null)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                  />
                </div>

                {/* Academic Fields */}
                {(metadata.documentType === 'degree' || metadata.documentType === 'diploma') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Program/Course
                      </label>
                      <input
                        type="text"
                        value={metadata.program}
                        onChange={(e) => updateMetadata('program', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Major
                      </label>
                      <input
                        type="text"
                        value={metadata.major}
                        onChange={(e) => updateMetadata('major', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="Primary field of study"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        GPA
                      </label>
                      <input
                        type="text"
                        value={metadata.gpa}
                        onChange={(e) => updateMetadata('gpa', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                        placeholder="e.g., 3.85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                        Graduation Date
                      </label>
                      <input
                        type="date"
                        value={metadata.graduationDate ? new Date(metadata.graduationDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateMetadata('graduationDate', e.target.value ? new Date(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
                    Description
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => updateMetadata('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
                    placeholder="Additional details about the document"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={issueDocument}
                  disabled={isProcessing || !isConnected}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Issuing Document...
                    </div>
                  ) : (
                    'Issue Document on Blockchain'
                  )}
                </button>
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
              <div className="bg-[#1A2E1A] border border-[#2D5A2D] rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
                  <div>
                    <h2 className="text-2xl font-semibold text-green-300">
                      Document Issued Successfully!
                    </h2>
                    <p className="text-green-200">
                      Your document has been recorded on the blockchain and is now verifiable by third parties.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-300">Transaction Hash:</span>
                    <div className="font-mono text-green-200 break-all">
                      {issuanceResult.transactionHash}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-green-300">Block Number:</span>
                    <div className="text-green-200">{issuanceResult.blockNumber}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-300">Document Hash:</span>
                    <div className="font-mono text-green-200 break-all">
                      {issuanceResult.documentHash}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-green-300">Gas Used:</span>
                    <div className="text-green-200">{issuanceResult.gasUsed}</div>
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
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4">Next Steps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={resetWorkflow}
                    className="flex items-center justify-center px-6 py-3 bg-[#296CFF] text-white rounded-lg hover:bg-[#2979FF] transition-colors"
                  >
                    <DocumentPlusIcon className="h-5 w-5 mr-2" />
                    Issue Another Document
                  </button>

                  <button
                    onClick={() => window.open('/verify', '_blank')}
                    className="flex items-center justify-center px-6 py-3 bg-[#2A2A2A] border border-[#444444] text-[#E0E0E0] rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Test Verification
                  </button>
                </div>

                <div className="mt-6 bg-[#2A2A2A] border border-[#444444] rounded-lg p-4">
                  <h4 className="font-medium text-[#296CFF] mb-2">Important Notes</h4>
                  <ul className="text-sm text-[#B0B0B0] space-y-1">
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
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-[#E0E0E0] mb-4">Verify Institution</h3>
            <p className="text-[#B0B0B0] text-sm mb-4">
              Enter the wallet address of the institution you want to verify:
            </p>

            <div className="relative mb-4">
              <input
                type="text"
                value={verificationAddress}
                onChange={(e) => setVerificationAddress(e.target.value)}
                placeholder="0x1234567890123456789012345678901234567890"
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#444444] rounded-lg text-[#E0E0E0] placeholder-[#888888] focus:ring-2 focus:ring-[#296CFF] focus:border-[#296CFF] focus:outline-none"
              />
              {currentInstitutionAddress && (
                <button
                  onClick={() => setVerificationAddress(currentInstitutionAddress)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-[#296CFF] text-white px-2 py-1 rounded hover:bg-[#2979FF] transition-colors"
                >
                  Use Current
                </button>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 bg-[#2A2A2A] border border-[#444444] text-[#E0E0E0] rounded-lg hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyInstitution}
                disabled={isProcessing || !verificationAddress.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Verifying...' : 'Verify Institution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentIssuanceWorkflow;
