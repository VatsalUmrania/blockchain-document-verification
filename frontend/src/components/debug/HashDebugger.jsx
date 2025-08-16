// src/components/debug/HashDebugger.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  BugAntIcon, 
  DocumentTextIcon,
  ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { generateDocumentHash, verifyDocumentHash } from '../../services/hashService';

const HashDebugger = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [debugResult, setDebugResult] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleFileSelect = (fileNumber, event) => {
    const file = event.target.files[0];
    if (fileNumber === 1) {
      setFile1(file);
    } else {
      setFile2(file);
    }
  };

  const debugHash = async () => {
    if (!file1) {
      toast.error('Please select a file to debug');
      return;
    }

    setIsDebugging(true);
    try {
      // Generate hash with detailed info
      const hashResult = await generateDocumentHash(file1);
      
      // If expected hash is provided, verify it
      let verificationResult = null;
      if (expectedHash.trim()) {
        verificationResult = await verifyDocumentHash(file1, expectedHash.trim());
      }

      // Compare with second file if provided
      let comparisonResult = null;
      if (file2) {
        const hash2 = await generateDocumentHash(file2);
        comparisonResult = {
          identical: hashResult.hash === hash2.hash,
          file1Hash: hashResult.hash,
          file2Hash: hash2.hash,
          file1: hashResult.file,
          file2: hash2.file
        };
      }

      setDebugResult({
        hashGeneration: hashResult,
        verification: verificationResult,
        comparison: comparisonResult
      });

      toast.success('Debug analysis completed!');
    } catch (error) {
      console.error('Debug error:', error);
      toast.error(`Debug failed: ${error.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BugAntIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">Hash Debugger</h1>
          </div>
          <p className="text-gray-600">
            Troubleshoot hash mismatch issues and analyze document hashing
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Debug Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary File (to debug)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileSelect(1, e)}
                className="input-field"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              {file1 && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {file1.name} ({(file1.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comparison File (optional)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileSelect(2, e)}
                className="input-field"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              {file2 && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {file2.name} ({(file2.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Hash (for verification)
            </label>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Enter the expected hash value..."
              className="input-field font-mono text-sm"
            />
          </div>

          <div className="mt-6">
            <Button
              onClick={debugHash}
              loading={isDebugging}
              disabled={!file1}
              className="w-full"
            >
              🔍 Start Debug Analysis
            </Button>
          </div>
        </div>

        {debugResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Hash Generation Results */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Hash Generation Analysis
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">File Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Name:</strong> {debugResult.hashGeneration.file.name}</div>
                    <div><strong>Size:</strong> {debugResult.hashGeneration.file.size} bytes</div>
                    <div><strong>Type:</strong> {debugResult.hashGeneration.file.type}</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Generated Hashes</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-blue-700">File Content Only:</span>
                      <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                        {debugResult.hashGeneration.hash}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-700">File + Metadata:</span>
                      <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                        {debugResult.hashGeneration.fullHash}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Metadata Used in Hash</h4>
                  <pre className="text-xs bg-white p-2 rounded overflow-auto">
                    {JSON.stringify(debugResult.hashGeneration.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Verification Results */}
            {debugResult.verification && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                  Verification Analysis
                </h3>

                <div className={`p-4 rounded-lg border-2 ${
                  debugResult.verification.isValid 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {debugResult.verification.isValid ? (
                      <span className="text-green-600 font-bold">✅ MATCH FOUND</span>
                    ) : (
                      <span className="text-red-600 font-bold">❌ NO MATCH</span>
                    )}
                    {debugResult.verification.matchingStrategy && (
                      <span className="text-sm text-gray-600">
                        (Strategy: {debugResult.verification.matchingStrategy})
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Expected Hash:</span>
                      <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                        {debugResult.verification.expectedHash}
                      </code>
                    </div>

                    {debugResult.verification.strategies && (
                      <div>
                        <span className="text-sm font-medium">Tested Strategies:</span>
                        <div className="mt-2 space-y-2">
                          {debugResult.verification.strategies.map((strategy, index) => (
                            <div key={index} className="bg-white p-2 rounded">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{strategy.name}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  strategy.hash === debugResult.verification.expectedHash
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {strategy.hash === debugResult.verification.expectedHash ? 'MATCH' : 'NO MATCH'}
                                </span>
                              </div>
                              <code className="text-xs text-gray-600 break-all">
                                {strategy.hash}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* File Comparison Results */}
            {debugResult.comparison && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">File Comparison</h3>
                
                <div className={`p-4 rounded-lg border-2 ${
                  debugResult.comparison.identical
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="text-center mb-4">
                    {debugResult.comparison.identical ? (
                      <span className="text-green-600 font-bold">✅ FILES ARE IDENTICAL</span>
                    ) : (
                      <span className="text-orange-600 font-bold">⚠️ FILES ARE DIFFERENT</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">File 1</h4>
                      <div className="bg-white p-3 rounded text-sm">
                        <div><strong>Name:</strong> {debugResult.comparison.file1.name}</div>
                        <div><strong>Hash:</strong></div>
                        <code className="text-xs break-all">{debugResult.comparison.file1Hash}</code>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">File 2</h4>
                      <div className="bg-white p-3 rounded text-sm">
                        <div><strong>Name:</strong> {debugResult.comparison.file2.name}</div>
                        <div><strong>Hash:</strong></div>
                        <code className="text-xs break-all">{debugResult.comparison.file2Hash}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HashDebugger;
