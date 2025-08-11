// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import { MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';
// import Button from '../common/Button';
// import QRCodeScanner from './QRCodeScanner';
// import VerificationResult from './VerificationResult';
// import { verifyDocumentHash } from '../../services/hashService';

// const VerificationPortal = () => {
//   const [verificationMethod, setVerificationMethod] = useState('hash');
//   const [hashInput, setHashInput] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [verificationResult, setVerificationResult] = useState(null);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [showScanner, setShowScanner] = useState(false);

//   const handleHashVerification = async () => {
//     if (!hashInput.trim()) {
//       toast.error('Please enter a document hash');
//       return;
//     }

//     if (!selectedFile) {
//       toast.error('Please select a file to verify');
//       return;
//     }

//     setIsVerifying(true);
//     try {
//       const result = await verifyDocumentHash(selectedFile, hashInput.trim());
//       setVerificationResult(result);
      
//       if (result.isValid) {
//         toast.success('Document verification successful!');
//       } else {
//         toast.error('Document verification failed!');
//       }
//     } catch (error) {
//       console.error('Verification error:', error);
//       toast.error('Error during verification process');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) { // 10MB limit
//         toast.error('File size must be less than 10MB');
//         return;
//       }
//       setSelectedFile(file);
//       toast.info(`File selected: ${file.name}`);
//     }
//   };

//   const handleQRScan = (result) => {
//     if (result) {
//       setHashInput(result);
//       setShowScanner(false);
//       toast.success('QR code scanned successfully!');
//     }
//   };

//   const clearVerification = () => {
//     setHashInput('');
//     setSelectedFile(null);
//     setVerificationResult(null);
//     toast.info('Verification form cleared');
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="space-y-6"
//       >
//         {/* Header */}
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-800 mb-2">Document Verification</h2>
//           <p className="text-gray-600">Verify document authenticity using blockchain technology</p>
//         </div>

//         {/* Verification Method Selection */}
//         <div className="card">
//           <h3 className="text-lg font-semibold mb-4">Choose Verification Method</h3>
//           <div className="flex space-x-4">
//             <button
//               onClick={() => setVerificationMethod('hash')}
//               className={`flex-1 p-4 border rounded-lg transition-colors ${
//                 verificationMethod === 'hash'
//                   ? 'border-primary-500 bg-primary-50 text-primary-700'
//                   : 'border-gray-300 hover:border-gray-400'
//               }`}
//             >
//               <MagnifyingGlassIcon className="w-6 h-6 mx-auto mb-2" />
//               <div className="text-sm font-medium">Hash Verification</div>
//             </button>
//             <button
//               onClick={() => setVerificationMethod('qr')}
//               className={`flex-1 p-4 border rounded-lg transition-colors ${
//                 verificationMethod === 'qr'
//                   ? 'border-primary-500 bg-primary-50 text-primary-700'
//                   : 'border-gray-300 hover:border-gray-400'
//               }`}
//             >
//               <QrCodeIcon className="w-6 h-6 mx-auto mb-2" />
//               <div className="text-sm font-medium">QR Code Scan</div>
//             </button>
//           </div>
//         </div>

//         {/* Verification Form */}
//         <div className="card">
//           <h3 className="text-lg font-semibold mb-4">Verification Details</h3>
          
//           {/* Hash Input */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Document Hash
//               </label>
//               <div className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={hashInput}
//                   onChange={(e) => setHashInput(e.target.value)}
//                   placeholder="Enter document hash..."
//                   className="input-field flex-1 font-mono text-sm"
//                 />
//                 <Button
//                   onClick={() => setShowScanner(true)}
//                   variant="outline"
//                   className="flex items-center space-x-2"
//                 >
//                   <QrCodeIcon className="w-4 h-4" />
//                   <span>Scan QR</span>
//                 </Button>
//               </div>
//             </div>

//             {/* File Upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Document to Verify
//               </label>
//               <input
//                 type="file"
//                 onChange={handleFileSelect}
//                 accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
//                 className="input-field"
//               />
//               {selectedFile && (
//                 <p className="text-sm text-green-600 mt-2">
//                   ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
//                 </p>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex space-x-3">
//               <Button
//                 onClick={handleHashVerification}
//                 loading={isVerifying}
//                 disabled={!hashInput.trim() || !selectedFile}
//                 className="flex-1"
//               >
//                 Verify Document
//               </Button>
//               <Button
//                 onClick={clearVerification}
//                 variant="outline"
//                 disabled={isVerifying}
//               >
//                 Clear
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* QR Scanner Modal */}
//         {showScanner && (
//           <QRCodeScanner
//             onScan={handleQRScan}
//             onClose={() => setShowScanner(false)}
//           />
//         )}

//         {/* Verification Result */}
//         {verificationResult && (
//           <VerificationResult result={verificationResult} />
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default VerificationPortal;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  MagnifyingGlassIcon, 
  QrCodeIcon, 
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import QRCodeScanner from './QRCodeScanner';
import VerificationResult from './VerificationResult';
import { verifyDocumentHash } from '../../services/hashService';

const VerificationPortal = () => {
  const [verificationMethod, setVerificationMethod] = useState('hash');
  const [hashInput, setHashInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState([]);

  const handleHashVerification = async () => {
    if (!hashInput.trim()) {
      toast.error('📝 Please enter a document hash');
      return;
    }

    if (!selectedFile) {
      toast.error('📁 Please select a file to verify');
      return;
    }

    setIsVerifying(true);
    
    // Add to history
    const verificationAttempt = {
      id: Date.now(),
      fileName: selectedFile.name,
      expectedHash: hashInput.trim(),
      timestamp: new Date().toISOString(),
      status: 'processing'
    };
    
    setVerificationHistory(prev => [verificationAttempt, ...prev.slice(0, 4)]);

    try {
      console.log(' Starting verification...');
      console.log('Selected file:', selectedFile.name, selectedFile.size, selectedFile.type);
      console.log('Expected hash:', hashInput.trim());
      
      toast.info('Analyzing document and generating hash...');
      
      const result = await verifyDocumentHash(selectedFile, hashInput.trim());
      
      console.log('Verification result:', result);
      setVerificationResult(result);
      
      // Update history
      setVerificationHistory(prev => prev.map(item => 
        item.id === verificationAttempt.id 
          ? { ...item, status: result.isValid ? 'success' : 'failed', result }
          : item
      ));
      
      if (result.isValid) {
        toast.success(`✅ Document verification successful! ${result.matchingStrategy ? `(Strategy: ${result.matchingStrategy})` : ''}`);
      } else {
        toast.error('❌ Document verification failed! The hash does not match.');
        console.log('🐛 Debug info:', result.debugInfo);
        console.log('🔬 All strategies tested:', result.strategies);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(`❌ Error during verification: ${error.message}`);
      
      // Update history with error
      setVerificationHistory(prev => prev.map(item => 
        item.id === verificationAttempt.id 
          ? { ...item, status: 'error', error: error.message }
          : item
      ));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('📏 File size must be less than 10MB');
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('📄 File type not supported. Please use PDF, DOC, DOCX, or image files.');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`📁 File selected: ${file.name}`);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleQRScan = (result) => {
    if (result) {
      setHashInput(result);
      setShowScanner(false);
      setVerificationMethod('hash');
      toast.success('📱 QR code scanned successfully!');
    }
  };

  const clearVerification = () => {
    setHashInput('');
    setSelectedFile(null);
    setVerificationResult(null);
    document.getElementById('file-input').value = '';
    toast.info('🧹 Verification form cleared');
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.length > 10) { // Basic validation for hash length
        setHashInput(text.trim());
        toast.success('📋 Hash pasted from clipboard');
      } else {
        toast.error('📋 Clipboard does not contain a valid hash');
      }
    } catch (error) {
      toast.error('📋 Failed to read from clipboard');
    }
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
            <div className="p-3 bg-blue-100 rounded-full">
              <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3"> Document Verification</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify document authenticity using blockchain-powered cryptographic hash verification. 
            Ensure your documents haven't been tampered with.
          </p>
        </div>

        {/* Verification Method Selection */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Choose Verification Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMethod('hash')}
              className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                verificationMethod === 'hash'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Hash Verification</h3>
              <p className="text-gray-600 text-sm">
                Enter the document hash manually and upload the file for verification
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setVerificationMethod('qr')}
              className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                verificationMethod === 'qr'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <QrCodeIcon className="w-10 h-10 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">QR Code Verification</h3>
              <p className="text-gray-600 text-sm">
                Scan QR code to automatically extract hash and verify document
              </p>
            </motion.button>
          </div>
        </div>

        {/* Verification Form */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Verification Details</h2>
          
          <div className="space-y-6">
            {/* Hash Input Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                📝 Document Hash
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter or paste the document hash (SHA-256)..."
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={pasteFromClipboard}
                    variant="outline"
                    size="sm"
                    className="px-4"
                  >
                    📋 Paste
                  </Button>
                  <Button
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    <span>Scan QR</span>
                  </Button>
                </div>
                
                {hashInput && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Hash Length: {hashInput.length} characters</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        hashInput.length === 64 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {hashInput.length === 64 ? '✓ Valid SHA-256 length' : '⚠ Expected 64 chars'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                📄 Document to Verify
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="pointer-events-none">
                  {selectedFile ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-3"
                    >
                      <DocumentTextIcon className="w-16 h-16 mx-auto text-green-500" />
                      <div>
                        <p className="text-lg font-semibold text-green-800">{selectedFile.name}</p>
                        <p className="text-green-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                        </p>
                      </div>
                    </motion.div>
                  ) : dragActive ? (
                    <div className="space-y-3">
                      <CloudArrowUpIcon className="w-16 h-16 mx-auto text-blue-500" />
                      <p className="text-lg font-semibold text-blue-600">Drop your file here! 🎯</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CloudArrowUpIcon className="w-16 h-16 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700">
                          Drag & drop your document here
                        </p>
                        <p className="text-gray-500">
                          or click to browse files
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Supports PDF, DOC, DOCX, and Images (Max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleHashVerification}
                loading={isVerifying}
                disabled={!hashInput.trim() || !selectedFile}
                className="flex-1 min-w-[200px] h-12 text-lg font-semibold"
              >
                {isVerifying ? ' Verifying...' : ' Verify Document'}
              </Button>
              
              <Button
                onClick={clearVerification}
                variant="outline"
                disabled={isVerifying}
                className="h-12 px-6"
              >
                🧹 Clear
              </Button>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Verification Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ensure you have the exact same file that was originally uploaded</li>
                    <li>• Hash comparison is case-sensitive and must match exactly</li>
                    <li>• Any modification to the file will result in a different hash</li>
                    <li>• Use QR code scanner for quick hash input from certificates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              📊 Recent Verification Attempts
            </h3>
            <div className="space-y-3">
              {verificationHistory.map((attempt) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    attempt.status === 'success' 
                      ? 'border-l-green-500 bg-green-50'
                      : attempt.status === 'failed'
                        ? 'border-l-red-500 bg-red-50'
                        : attempt.status === 'error'
                          ? 'border-l-orange-500 bg-orange-50'
                          : 'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{attempt.fileName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attempt.status === 'success' 
                          ? 'bg-green-100 text-green-800'
                          : attempt.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : attempt.status === 'error'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}>
                        {attempt.status === 'success' ? '✅ Verified' : 
                         attempt.status === 'failed' ? '❌ Failed' :
                         attempt.status === 'error' ? '⚠️ Error' : '⏳ Processing'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {verificationResult && !verificationResult.isValid && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <BugAntIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-800">🐛 Debug Information</h3>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-orange-700">Expected Hash:</span>
                  <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                    {verificationResult.expectedHash}
                  </code>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-orange-700">Generated Hash:</span>
                  <code className="block bg-white p-2 rounded font-mono text-xs mt-1 break-all">
                    {verificationResult.generatedHash}
                  </code>
                </div>
                
                {verificationResult.debugInfo && (
                  <div>
                    <span className="text-sm font-medium text-orange-700">Debug Details:</span>
                    <pre className="bg-white p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify(verificationResult.debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Troubleshooting:</strong> If verification failed, try the Hash Debugger 
                  in the main navigation to analyze the issue in detail.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRCodeScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Verification Result */}
        {verificationResult && (
          <VerificationResult result={verificationResult} />
        )}

        {/* Warning Alert for Hash Mismatch */}
        {verificationResult && !verificationResult.isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ⚠️ Verification Failed
                </h3>
                <p className="text-red-700 mb-3">
                  The document hash does not match the expected value. This could indicate:
                </p>
                <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                  <li>The document has been modified since it was originally uploaded</li>
                  <li>You're verifying a different version of the document</li>
                  <li>The hash was copied incorrectly</li>
                  <li>The file was corrupted during transfer</li>
                </ul>
                <div className="mt-4 p-3 bg-white border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Recommendation:</strong> Double-check that you have the correct document 
                    and hash. If you continue to experience issues, use the Hash Debugger tool 
                    for detailed analysis.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerificationPortal;
