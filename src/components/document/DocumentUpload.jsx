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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import HashDisplay from '../common/HashDisplay';
import QRCodeGenerator from '../verification/QRCodeGenerator';
import { generateDocumentHash } from '../../services/hashService';
import { useWeb3 } from '../../context/Web3Context';

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [metadata, setMetadata] = useState({
    description: '',
    category: 'general',
    tags: '',
    isPrivate: false,
    expirationDate: ''
  });
  const [showQRCode, setShowQRCode] = useState({});

  const { isConnected, account, connectWallet, isDevelopmentMode } = useWeb3();

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    // Handle rejected files with detailed error messages
    if (fileRejections.length > 0) {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error(`❌ File "${file.name}" is too large. Maximum size is 10MB.`);
              break;
            case 'file-invalid-type':
              toast.error(`❌ File "${file.name}" has invalid type. Only PDF, DOC, DOCX, and images are allowed.`);
              break;
            case 'too-many-files':
              toast.error('❌ Too many files selected. Please select fewer files.');
              break;
            default:
              toast.error(`❌ Error with file "${file.name}": ${error.message}`);
          }
        });
      });
    }

    // Handle accepted files
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
      toast.success(`✅ ${acceptedFiles.length} file(s) selected successfully`);
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
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    multiple: true
  });

  const uploadDocuments = async () => {
    // Check wallet connection first
    if (!isConnected) {
      toast.error('🔐 Please connect your wallet first');
      const connected = await connectWallet();
      if (!connected) return;
    }

    if (files.length === 0) {
      toast.error('📁 Please select files to upload');
      return;
    }

    const pendingFiles = files.filter(f => !f.uploaded);
    if (pendingFiles.length === 0) {
      toast.info('ℹ️ All files are already uploaded');
      return;
    }

    setUploading(true);
    toast.info(`🚀 Starting upload of ${pendingFiles.length} document(s)...`);

    try {
      for (const fileObj of pendingFiles) {
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        try {
          // Step 1: Generate hash
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 10 }));
          
          const hashResult = await generateDocumentHash(fileObj.file, {
            ...metadata,
            uploader: account,
            timestamp: Date.now(),
            developmentMode: isDevelopmentMode,
            category: metadata.category,
            tags: metadata.tags.split(',').map(t => t.trim()).filter(Boolean)
          });

          // Step 2: Simulate blockchain transaction
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 30 }));
          await new Promise(resolve => setTimeout(resolve, 500));

          // Step 3: Upload to IPFS (simulated)
          for (let i = 40; i <= 80; i += 10) {
            setUploadProgress(prev => ({ ...prev, [fileObj.id]: i }));
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          // Step 4: Finalize blockchain record
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 90 }));
          await new Promise(resolve => setTimeout(resolve, 300));

          // Step 5: Complete
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

          // Update file with hash and metadata
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { 
                  ...f, 
                  hash: hashResult.hash, 
                  uploaded: true, 
                  metadata: hashResult.metadata,
                  uploadError: null,
                  uploadedAt: Date.now()
                }
              : f
          ));

          const mode = isDevelopmentMode ? ' (Development Mode)' : '';
          toast.success(`✅ "${fileObj.name}" uploaded successfully${mode}!`);

        } catch (fileError) {
          console.error(`Error uploading ${fileObj.name}:`, fileError);
          
          // Update file with error
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, uploadError: fileError.message }
              : f
          ));
          
          toast.error(`❌ Failed to upload "${fileObj.name}": ${fileError.message}`);
          
          // Clear progress for failed file
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileObj.id];
            return newProgress;
          });
        }
      }

      const successCount = files.filter(f => f.uploaded).length;
      if (successCount > 0) {
        toast.success(`🎉 Upload complete! ${successCount} document(s) successfully stored on blockchain.`);
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('❌ Failed to upload documents');
    } finally {
      setUploading(false);
      // Clear all progress after a delay
      setTimeout(() => setUploadProgress({}), 2000);
    }
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

  const retryUpload = async (fileId) => {
    const fileObj = files.find(f => f.id === fileId);
    if (!fileObj) return;

    // Reset file status
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, uploaded: false, uploadError: null, hash: null }
        : f
    ));

    toast.info(`🔄 Retrying upload for "${fileObj.name}"...`);
    await uploadDocuments();
  };

  const toggleQRCode = (fileId) => {
    setShowQRCode(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const getFileIcon = (file) => {
    if (file.uploaded) return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
    if (file.uploadError) return <XCircleIcon className="w-8 h-8 text-red-500" />;
    return <DocumentIcon className="w-8 h-8 text-blue-500" />;
  };

  const getFileStatus = (file) => {
    if (file.uploaded) return { color: 'text-green-600', text: '✅ Uploaded Successfully' };
    if (file.uploadError) return { color: 'text-red-600', text: `❌ Upload Failed: ${file.uploadError}` };
    return { color: 'text-gray-600', text: '⏳ Pending Upload' };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📤 Upload Documents</h1>
          <p className="text-gray-600">
            Securely store your documents on the blockchain with cryptographic verification
          </p>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <p className="text-yellow-800 font-medium">
                  ⚠️ Wallet Connection Required
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please connect your wallet to upload documents to the blockchain.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Development Mode Alert */}
        {isDevelopmentMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <p className="text-blue-800 font-medium">
                  🔧 Development Mode Active
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Blockchain features are simulated. Install MetaMask for production use.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <CloudArrowUpIcon className="w-7 h-7 mr-3 text-blue-500" />
            Document Upload
          </h2>
          
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              
              {isDragActive ? (
                <div>
                  <p className="text-xl font-medium text-blue-600 mb-2">
                    Drop your files here! 🎯
                  </p>
                  <p className="text-blue-500">
                    Release to add them to the upload queue
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-medium text-gray-700 mb-2">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="text-gray-500 mb-4">
                    Supports PDF, DOC, DOCX, and Images • Max 10MB per file • Up to 10 files
                  </p>
                  <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    Choose Files
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Metadata Form */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Document Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="general">📄 General</option>
                  <option value="legal">⚖️ Legal</option>
                  <option value="financial">💰 Financial</option>
                  <option value="medical">🏥 Medical</option>
                  <option value="educational">🎓 Educational</option>
                  <option value="contract">📋 Contract</option>
                  <option value="certificate">🏆 Certificate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            
            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={metadata.isPrivate}
                  onChange={(e) => setMetadata(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">🔒 Mark as private</span>
              </label>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">📅 Expiration date:</label>
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
                <h3 className="text-xl font-semibold text-gray-800">
                  📁 Upload Queue ({files.length} files)
                </h3>
                <div className="flex space-x-3">
                  <Button onClick={clearAll} variant="outline" size="sm">
                    🧹 Clear All
                  </Button>
                  <Button 
                    onClick={uploadDocuments} 
                    loading={uploading}
                    disabled={!isConnected || files.every(f => f.uploaded)}
                    className="min-w-[200px]"
                  >
                    {!isConnected 
                      ? '🔐 Connect Wallet First' 
                      : uploading 
                        ? '⏳ Uploading...' 
                        : `🚀 Upload ${files.filter(f => !f.uploaded).length} Documents`
                    }
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
                      className={`bg-white border-2 rounded-xl p-6 shadow-sm transition-all duration-200 ${
                        fileObj.uploaded 
                          ? 'border-green-200 bg-green-50' 
                          : fileObj.uploadError
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {getFileIcon(fileObj)}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-800 truncate">
                                {fileObj.name}
                              </h4>
                              <span className={`text-sm font-medium ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span>📏 {(fileObj.size / 1024 / 1024).toFixed(2)} MB</span>
                              <span>📄 {fileObj.type}</span>
                              {fileObj.uploadedAt && (
                                <span>📅 {new Date(fileObj.uploadedAt).toLocaleString()}</span>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {uploadProgress[fileObj.id] !== undefined && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>Uploading to blockchain...</span>
                                  <span>{uploadProgress[fileObj.id]}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress[fileObj.id]}%` }}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Hash Display */}
                            {fileObj.hash && (
                              <div className="mt-4">
                                <HashDisplay 
                                  hash={fileObj.hash}
                                  label="Document Hash"
                                  variant="card"
                                />
                              </div>
                            )}

                            {/* QR Code */}
                            {fileObj.hash && showQRCode[fileObj.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4"
                              >
                                <QRCodeGenerator 
                                  hash={fileObj.hash} 
                                  metadata={fileObj.metadata}
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          {fileObj.hash && (
                            <Button
                              onClick={() => toggleQRCode(fileObj.id)}
                              variant="outline"
                              size="sm"
                            >
                              {showQRCode[fileObj.id] ? '🙈 Hide QR' : '📱 Show QR'}
                            </Button>
                          )}
                          
                          {fileObj.uploadError && (
                            <Button
                              onClick={() => retryUpload(fileObj.id)}
                              variant="outline"
                              size="sm"
                              disabled={uploading}
                            >
                              🔄 Retry
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => removeFile(fileObj.id)}
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Upload Summary */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                    <div className="text-sm text-gray-600">Total Files</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {files.filter(f => f.uploaded).length}
                    </div>
                    <div className="text-sm text-gray-600">Uploaded</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {files.filter(f => !f.uploaded && !f.uploadError).length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <div className="text-sm text-gray-600">Total Size</div>
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
