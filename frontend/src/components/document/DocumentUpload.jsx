import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon,
  TrashIcon,
  FolderIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CubeIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowPathIcon,
  InboxStackIcon,
  TrophyIcon,
  IdentificationIcon,
  CreditCardIcon,
  ScaleIcon,
  HeartIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import HashDisplay from '../common/HashDisplay';
import QRCodeGenerator from '../verification/QRCodeGenerator';
import { generateDocumentHash } from '../../services/hashService';
import { useWeb3 } from '../../context/Web3Context';
import DocumentService from '../../services/DocumentService';
import { useDocumentStats } from '../../context/DocumentStatsContext';

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [metadata, setMetadata] = useState({
    description: '',
    category: 'document',
    tags: '',
    isPrivate: false,
    expirationDate: ''
  });
  const [showQRCode, setShowQRCode] = useState({});

  const { isConnected, account, provider, signer } = useWeb3();
  const { refreshStats } = useDocumentStats();

  // Category options with icons
  const categoryOptions = [
    { value: 'document', label: 'Document', icon: DocumentIcon },
    { value: 'certificate', label: 'Certificate', icon: TrophyIcon },
    { value: 'contract', label: 'Contract', icon: DocumentTextIcon },
    { value: 'identity', label: 'Identity', icon: IdentificationIcon },
    { value: 'financial', label: 'Financial', icon: CreditCardIcon },
    { value: 'legal', label: 'Legal', icon: ScaleIcon },
    { value: 'medical', label: 'Medical', icon: HeartIcon },
    { value: 'other', label: 'Other', icon: ClipboardDocumentListIcon }
  ];

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error(`📏 File "${file.name}" is too large. Maximum size is 10MB.`);
              break;
            case 'file-invalid-type':
              toast.error(`📄 File "${file.name}" has invalid type. Only PDF, DOC, DOCX, and images are allowed.`);
              break;
            case 'too-many-files':
              toast.error('📚 Too many files selected. Please select fewer files.');
              break;
            default:
              toast.error(`❌ Error with file "${file.name}": ${error.message}`);
          }
        });
      });
    }

    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
        hash: null,
        uploaded: false,
        uploadError: null,
        metadata: null
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`📁 ${acceptedFiles.length} file(s) selected successfully`, {
        icon: '📁'
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 10,
    multiple: true
  });

  const uploadDocuments = async () => {
    if (!isConnected) {
      toast.error('🔐 Please connect your wallet first');
      return;
    }

    if (files.length === 0) {
      toast.error('📁 Please select files to upload');
      return;
    }

    const pendingFiles = files.filter(f => !f.uploaded);
    if (pendingFiles.length === 0) {
      toast.info('✅ All files are already uploaded');
      return;
    }

    setUploading(true);
    toast.info(`🔄 Processing ${pendingFiles.length} document(s)...`, {
      icon: '🔄'
    });

    try {
      const documentService = new DocumentService(provider, signer);

      for (const fileObj of pendingFiles) {
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        try {
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 20 }));
          
          const hashResult = await generateDocumentHash(fileObj.file, {
            ...metadata,
            uploader: account,
            timestamp: Date.now()
          });

          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 60 }));

          const fileContent = await readFileContent(fileObj.file);
          await documentService.storeDocumentAsPending(fileContent, fileObj.name, {
            ...metadata,
            uploader: account,
            fileSize: fileObj.size,
            fileType: fileObj.type
          });

          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { 
                  ...f, 
                  hash: hashResult.hash, 
                  uploaded: true, 
                  metadata: {
                    ...hashResult.metadata,
                    status: 'pending'
                  },
                  uploadError: null,
                  uploadedAt: Date.now()
                }
              : f
          ));

          toast.success(`✅ "${fileObj.name}" uploaded as pending verification`, {
            icon: '✅'
          });

        } catch (fileError) {
          console.error(`Error processing ${fileObj.name}:`, fileError);
          
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, uploadError: fileError.message }
              : f
          ));
          
          toast.error(`❌ Failed to process "${fileObj.name}"`);
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileObj.id];
            return newProgress;
          });
        }
      }

      const successCount = files.filter(f => f.uploaded).length;
      if (successCount > 0) {
        toast.success(`🎉 Upload complete! ${successCount} document(s) ready for verification.`, {
          icon: '🎉'
        });
        toast.info('📊 Check your Dashboard to see the updated statistics!');
        
        // Refresh Dashboard stats immediately after upload
        refreshStats();
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('❌ Failed to process documents');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file.slice(0, 1024));
    });
  };

  const removeFile = (fileId) => {
    const fileName = files.find(f => f.id === fileId)?.name;
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setShowQRCode(prev => {
      const newQR = { ...prev };
      delete newQR[fileId];
      return newQR;
    });
    toast.info(`🗑️ "${fileName}" removed from upload queue`);
  };

  const clearAll = () => {
    const fileCount = files.length;
    setFiles([]);
    setUploadProgress({});
    setShowQRCode({});
    toast.info(`🧹 Cleared ${fileCount} file(s) from upload queue`);
  };

  const toggleQRCode = (fileId) => {
    setShowQRCode(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const getFileIcon = (file) => {
    if (file.uploaded) return <CheckCircleIcon className="w-8 h-8 text-[rgb(var(--color-success))]" />;
    if (file.uploadError) return <XCircleIcon className="w-8 h-8 text-[rgb(var(--color-error))]" />;
    
    // File type icons
    if (file.type?.includes('pdf')) return <DocumentTextIcon className="w-8 h-8 text-[rgb(var(--color-error))]" />;
    if (file.type?.includes('image')) return <CubeIcon className="w-8 h-8 text-[rgb(var(--color-success))]" />;
    if (file.type?.includes('word') || file.type?.includes('document')) return <DocumentIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />;
    return <FolderIcon className="w-8 h-8 text-[rgb(139,92,246)]" />;
  };

  const getFileStatus = (file) => {
    if (file.uploaded) return { color: 'text-[rgb(var(--color-success))]', text: 'Uploaded (Pending Verification)' };
    if (file.uploadError) return { color: 'text-[rgb(var(--color-error))]', text: `Upload Failed: ${file.uploadError}` };
    return { color: 'text-[rgb(var(--text-secondary))]', text: 'Ready to Upload' };
  };

  const getCurrentCategoryIcon = () => {
    const category = categoryOptions.find(cat => cat.value === metadata.category);
    return category ? category.icon : DocumentIcon;
  };

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
            <div className="p-3 bg-[rgb(var(--color-primary)/0.2)] rounded-full border border-[rgb(var(--color-primary)/0.3)]">
              <CloudArrowUpIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
            </div>
          </div>
          <h1 
            className="text-4xl font-bold mb-3"
            style={{
              background: `rgb(var(--color-primary))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Upload Documents
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-lg max-w-2xl mx-auto">
            Upload your documents securely to MongoDB with cryptographic hashing. Documents will be ready for verification once processed.
          </p>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--color-error)/0.1)] border-l-4 border-[rgb(var(--color-error))] p-4 rounded-lg"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-[rgb(var(--color-error))] mr-3" />
              <div>
                <p className="text-[rgb(var(--color-error))] font-semibold">
                  Wallet Connection Required
                </p>
                <p className="text-[rgb(var(--text-secondary))] text-sm mt-1">
                  Please connect your MetaMask wallet to upload and track documents in MongoDB.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Connected Account Info */}
        {isConnected && account && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--color-success)/0.1)] border-l-4 border-[rgb(var(--color-success))] p-4 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-[rgb(var(--color-success))] mr-3" />
              <div>
                <p className="text-[rgb(var(--color-success))] font-semibold">
                  Wallet Connected
                </p>
                <p className="text-[rgb(var(--text-secondary))] text-sm mt-1 flex items-center space-x-2">
                  <WalletIcon className="w-4 h-4" />
                  <span>Connected to:</span>
                  <span className="blockchain-address">{account}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <CloudArrowUpIcon className="w-6 h-6 text-[rgb(var(--color-primary))]" />
            </div>
            <h2 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Document Upload</h2>
          </div>
          
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)] scale-105' 
                : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary)/0.05)]'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ 
                y: isDragActive ? -5 : 0,
                scale: isDragActive ? 1.05 : 1 
              }}
              transition={{ duration: 0.2 }}
            >
              <CloudArrowUpIcon className={`mx-auto h-16 w-16 mb-4 ${
                isDragActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--text-quaternary))]'
              }`} />
              
              {isDragActive ? (
                <div>
                  <p className="text-xl font-semibold text-[rgb(var(--color-primary))] mb-2">
                    Drop your files here!
                  </p>
                  <p className="text-[rgb(var(--color-primary))]">
                    Release to add them to the upload queue
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="text-[rgb(var(--text-secondary))] mb-6">
                    Supports PDF, DOC, DOCX, Images, and Text files • Max 10MB per file • Up to 10 files
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300">
                    <FolderIcon className="w-5 h-5" />
                    <span>Choose Files</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Metadata Form */}
          <div className="mt-8 bg-[rgb(var(--surface-secondary))] rounded-xl p-6 border border-[rgb(var(--border-primary))]">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-[rgba(139,92,246,0.1)] rounded-lg">
                <TagIcon className="w-5 h-5 text-[rgb(139,92,246)]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Document Metadata</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Description
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field h-24 resize-none"
                  placeholder="Brief description of the document..."
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">
                  {React.createElement(getCurrentCategoryIcon(), { className: "w-4 h-4" })}
                  <span>Category</span>
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                  className="input-field"
                  placeholder="important, confidential, archive..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={metadata.isPrivate}
                  onChange={(e) => setMetadata(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="w-4 h-4 text-[rgb(var(--color-primary))] bg-[rgb(var(--surface-primary))] border-[rgb(var(--border-primary))] rounded focus:ring-[rgb(var(--color-primary))]"
                />
                <span className="flex items-center text-sm font-medium text-[rgb(var(--text-primary))] space-x-1">
                  <LockClosedIcon className="w-4 h-4" />
                  <span>Mark as private</span>
                </span>
              </label>
              
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <label className="text-sm font-medium text-[rgb(var(--text-primary))]">Expiration date:</label>
                <input
                  type="date"
                  value={metadata.expirationDate}
                  onChange={(e) => setMetadata(prev => ({ ...prev, expirationDate: e.target.value }))}
                  className="input-field w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                    Upload Queue ({files.length} files)
                  </h3>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={clearAll} 
                    variant="ghost" 
                    size="sm" 
                    icon={TrashIcon}
                    className="text-[rgb(var(--color-error))] hover:text-[rgb(var(--color-error))]"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={uploadDocuments} 
                    loading={uploading}
                    disabled={!isConnected || files.every(f => f.uploaded)}
                    variant="primary"
                    className="min-w-[200px] h-12"
                  >
                    {!isConnected ? (
                      <>
                        <LockClosedIcon className="w-5 h-5 mr-2" />
                        Connect Wallet First
                      </>
                    ) : uploading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <InboxStackIcon className="w-5 h-5 mr-2" />
                        Process {files.filter(f => !f.uploaded).length} Document{files.filter(f => !f.uploaded).length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {files.map((fileObj, index) => {
                  const status = getFileStatus(fileObj);
                  return (
                    <motion.div
                      key={fileObj.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-[rgb(var(--surface-secondary))] border-2 rounded-xl p-6 shadow-sm transition-all duration-300 ${
                        fileObj.uploaded 
                          ? 'border-[rgb(var(--color-success)/0.3)] bg-[rgb(var(--color-success)/0.05)]' 
                          : fileObj.uploadError
                            ? 'border-[rgb(var(--color-error)/0.3)] bg-[rgb(var(--color-error)/0.05)]'
                            : 'border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.3)]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 p-2 bg-[rgb(var(--surface-primary))] rounded-lg border border-[rgb(var(--border-primary))]">
                            {getFileIcon(fileObj)}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-[rgb(var(--text-primary))] truncate">
                                {fileObj.name}
                              </h4>
                              <span className={`text-sm font-medium ${status.color} px-2 py-1 rounded border ${
                                fileObj.uploaded ? 'bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success)/0.3)]' :
                                fileObj.uploadError ? 'bg-[rgb(var(--color-error)/0.1)] border-[rgb(var(--color-error)/0.3)]' :
                                'bg-[rgb(var(--surface-primary))] border-[rgb(var(--border-primary))]'
                              }`}>
                                {status.text}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-[rgb(var(--text-secondary))] mb-3">
                              <div className="flex items-center space-x-1">
                                <ChartBarIcon className="w-3 h-3" />
                                <span>{(fileObj.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                              <span>{fileObj.type || 'Unknown'}</span>
                              {fileObj.uploadedAt && (
                                <span>{new Date(fileObj.uploadedAt).toLocaleString()}</span>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {uploadProgress[fileObj.id] !== undefined && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm text-[rgb(var(--text-primary))] mb-2">
                                  <span>Processing document...</span>
                                  <span>{uploadProgress[fileObj.id]}%</span>
                                </div>
                                <div className="w-full bg-[rgb(var(--surface-primary))] rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress[fileObj.id]}%` }}
                                    className="h-3 rounded-full transition-all duration-300"
                                    style={{
                                      background: `linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-success)))`
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Hash Display */}
                            {fileObj.hash && (
                              <div className="mt-4">
                                <HashDisplay 
                                  hash={fileObj.hash}
                                  label="Document Hash (Ready for Verification)"
                                  variant="card"
                                  size="sm"
                                />
                                <div className="mt-3 p-3 bg-[rgb(var(--color-primary)/0.1)] border border-[rgb(var(--color-primary)/0.3)] rounded-lg">
                                  <div className="flex items-start space-x-2">
                                    <InformationCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-[rgb(var(--color-primary))]">
                                      Use this hash in the Verification Portal to verify document authenticity
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* QR Code */}
                            <AnimatePresence>
                              {fileObj.hash && showQRCode[fileObj.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4"
                                >
                                  <QRCodeGenerator 
                                    hash={fileObj.hash} 
                                    metadata={fileObj.metadata}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3 ml-4">
                          {fileObj.hash && (
                            <Button
                              onClick={() => toggleQRCode(fileObj.id)}
                              variant="secondary"
                              size="sm"
                              icon={showQRCode[fileObj.id] ? EyeSlashIcon : EyeIcon}
                            >
                              {showQRCode[fileObj.id] ? 'Hide QR' : 'Show QR'}
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => removeFile(fileObj.id)}
                            variant="danger"
                            size="sm"
                            disabled={uploading}
                            icon={TrashIcon}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Upload Summary */}
              <div className="mt-6 bg-[rgb(var(--surface-secondary))] rounded-xl p-6 border border-[rgb(var(--border-primary))]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="p-4 bg-[rgb(var(--color-primary)/0.1)] rounded-lg border border-[rgb(var(--color-primary)/0.3)]">
                    <div className="text-2xl font-bold text-[rgb(var(--color-primary))] mb-2">{files.length}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                      <DocumentIcon className="w-3 h-3" />
                      <span>Total Files</span>
                    </div>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-success)/0.1)] rounded-lg border border-[rgb(var(--color-success)/0.3)]">
                    <div className="text-2xl font-bold text-[rgb(var(--color-success))] mb-2">
                      {files.filter(f => f.uploaded).length}
                    </div>
                    <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      <span>Processed</span>
                    </div>
                  </div>
                  <div className="p-4 bg-[rgb(var(--color-warning)/0.1)] rounded-lg border border-[rgb(var(--color-warning)/0.3)]">
                    <div className="text-2xl font-bold text-[rgb(var(--color-warning))] mb-2">
                      {files.filter(f => !f.uploaded && !f.uploadError).length}
                    </div>
                    <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>Pending</span>
                    </div>
                  </div>
                  <div className="p-4 bg-[rgba(139,92,246,0.1)] rounded-lg border border-[rgba(139,92,246,0.3)]">
                    <div className="text-2xl font-bold text-[rgb(139,92,246)] mb-2">
                      {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                      <ChartBarIcon className="w-3 h-3" />
                      <span>Total Size</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
