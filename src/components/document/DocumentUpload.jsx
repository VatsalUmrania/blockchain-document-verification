import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { generateDocumentHash } from '../../services/hashService';
import { useWeb3 } from '../../context/Web3Context';

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [metadata, setMetadata] = useState({
    description: '',
    category: 'general',
    tags: ''
  });

  const { isConnected, account, connectWallet } = useWeb3();

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    // Handle rejected files
    if (fileRejections.length > 0) {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`File ${file.name} has invalid type. Only PDF, DOC, DOCX, and images are allowed.`);
          } else {
            toast.error(`Error with file ${file.name}: ${error.message}`);
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
        uploaded: false
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${acceptedFiles.length} file(s) selected successfully`);
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
      'image/gif': ['.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const uploadDocuments = async () => {
    // Check wallet connection first
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      const connected = await connectWallet();
      if (!connected) return;
    }

    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);

    try {
      for (const fileObj of files) {
        if (fileObj.uploaded) continue;

        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        try {
          // Generate hash with enhanced error handling
          const hashResult = await generateDocumentHash(fileObj.file, {
            ...metadata,
            uploader: account,
            timestamp: Date.now()
          });

          // Simulate blockchain upload with progress
          for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(prev => ({ ...prev, [fileObj.id]: i }));
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Update file with hash
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, hash: hashResult.hash, uploaded: true, metadata: hashResult.metadata }
              : f
          ));

          toast.success(`${fileObj.name} uploaded successfully!`);
        } catch (fileError) {
          console.error(`Error uploading ${fileObj.name}:`, fileError);
          toast.error(`Failed to upload ${fileObj.name}: ${fileError.message}`);
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileObj.id];
            return newProgress;
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    toast.info('File removed');
  };

  const clearAll = () => {
    setFiles([]);
    setUploadProgress({});
    toast.info('All files cleared');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Upload Area */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Documents</h2>
          
          {/* Connection Status */}
          {!isConnected && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Please connect your wallet to upload documents to the blockchain.
              </p>
            </div>
          )}
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, and Images (Max 10MB each)
                </p>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="input-field h-20 resize-none"
                placeholder="Enter document description..."
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
                <option value="general">General</option>
                <option value="legal">Legal</option>
                <option value="financial">Financial</option>
                <option value="medical">Medical</option>
                <option value="educational">Educational</option>
              </select>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selected Files ({files.length})</h3>
              <div className="space-x-2">
                <Button onClick={clearAll} variant="outline" size="sm">
                  Clear All
                </Button>
                <Button 
                  onClick={uploadDocuments} 
                  loading={uploading}
                  disabled={!isConnected}
                >
                  {!isConnected ? 'Connect Wallet First' : 'Upload to Blockchain'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {files.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">{fileObj.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fileObj.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileObj.hash && (
                        <p className="text-xs text-green-600 font-mono">
                          Hash: {fileObj.hash.substring(0, 16)}...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {uploadProgress[fileObj.id] !== undefined && (
                      <div className="w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileObj.id]}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {uploadProgress[fileObj.id]}%
                        </p>
                      </div>
                    )}

                    {fileObj.uploaded && (
                      <span className="text-green-500 text-sm font-medium">✓ Uploaded</span>
                    )}

                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
