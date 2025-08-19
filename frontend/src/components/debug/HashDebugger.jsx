// // src/components/debug/HashDebugger.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import { 
//   BugAntIcon, 
//   DocumentTextIcon,
//   ClipboardDocumentCheckIcon,
//   BeakerIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClipboardIcon
// } from '@heroicons/react/24/outline';
// import Button from '../common/Button';
// import { generateDocumentHash, verifyDocumentHash } from '../../services/hashService';

// const HashDebugger = () => {
//   const [file1, setFile1] = useState(null);
//   const [file2, setFile2] = useState(null);
//   const [expectedHash, setExpectedHash] = useState('');
//   const [debugResult, setDebugResult] = useState(null);
//   const [isDebugging, setIsDebugging] = useState(false);

//   const handleFileSelect = (fileNumber, event) => {
//     const file = event.target.files[0];
//     if (fileNumber === 1) {
//       setFile1(file);
//     } else {
//       setFile2(file);
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text).then(() => {
//       toast.success('📋 Hash copied to clipboard!', {
//         icon: '📋'
//       });
//     }).catch(() => {
//       toast.error('❌ Failed to copy hash');
//     });
//   };

//   const debugHash = async () => {
//     if (!file1) {
//       toast.error('❌ Please select a file to debug');
//       return;
//     }

//     setIsDebugging(true);
//     try {
//       // Generate hash with detailed info
//       const hashResult = await generateDocumentHash(file1);
      
//       // If expected hash is provided, verify it
//       let verificationResult = null;
//       if (expectedHash.trim()) {
//         verificationResult = await verifyDocumentHash(file1, expectedHash.trim());
//       }

//       // Compare with second file if provided
//       let comparisonResult = null;
//       if (file2) {
//         const hash2 = await generateDocumentHash(file2);
//         comparisonResult = {
//           identical: hashResult.hash === hash2.hash,
//           file1Hash: hashResult.hash,
//           file2Hash: hash2.hash,
//           file1: hashResult.file,
//           file2: hash2.file
//         };
//       }

//       setDebugResult({
//         hashGeneration: hashResult,
//         verification: verificationResult,
//         comparison: comparisonResult
//       });

//       toast.success('🔍 Debug analysis completed!', {
//         icon: '🔬'
//       });
//     } catch (error) {
//       console.error('Debug error:', error);
//       toast.error(`❌ Debug failed: ${error.message}`);
//     } finally {
//       setIsDebugging(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="space-y-8"
//       >
//         {/* Header */}
//         <div className="text-center">
//           <div className="flex items-center justify-center space-x-3 mb-4">
//             <div className="p-3 bg-[#FF4C4C]/20 rounded-full border border-[#FF4C4C]/30">
//               <BugAntIcon className="w-8 h-8 text-[#FF4C4C]" />
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF4C4C] to-[#FF6B6B] bg-clip-text text-transparent mb-3">
//             Hash Debugger
//           </h1>
//           <p className="text-[#CCCCCC] text-lg max-w-2xl mx-auto">
//             Advanced troubleshooting tool for hash mismatch issues and document hashing analysis
//           </p>
//         </div>

//         {/* Configuration Card */}
//         <div className="card">
//           <div className="flex items-center space-x-2 mb-6">
//             <BeakerIcon className="w-5 h-5 text-[#296CFF]" />
//             <h2 className="text-xl font-semibold text-white">Debug Configuration</h2>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Primary File */}
//             <div>
//               <label className="block text-sm font-semibold text-white mb-3">
//                 📄 Primary File (to debug)
//               </label>
//               <input
//                 type="file"
//                 onChange={(e) => handleFileSelect(1, e)}
//                 className="input-field"
//                 accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
//               />
//               {file1 && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="mt-3 p-3 bg-[#00C853]/10 border border-[#00C853]/30 rounded-lg"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <CheckCircleIcon className="w-4 h-4 text-[#00C853]" />
//                     <span className="text-sm text-[#00C853] font-medium">
//                       {file1.name} ({(file1.size / 1024 / 1024).toFixed(2)} MB)
//                     </span>
//                   </div>
//                 </motion.div>
//               )}
//             </div>

//             {/* Comparison File */}
//             <div>
//               <label className="block text-sm font-semibold text-white mb-3">
//                 🔄 Comparison File (optional)
//               </label>
//               <input
//                 type="file"
//                 onChange={(e) => handleFileSelect(2, e)}
//                 className="input-field"
//                 accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
//               />
//               {file2 && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="mt-3 p-3 bg-[#296CFF]/10 border border-[#296CFF]/30 rounded-lg"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <CheckCircleIcon className="w-4 h-4 text-[#296CFF]" />
//                     <span className="text-sm text-[#296CFF] font-medium">
//                       {file2.name} ({(file2.size / 1024 / 1024).toFixed(2)} MB)
//                     </span>
//                   </div>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           {/* Expected Hash Input */}
//           <div className="mt-6">
//             <label className="block text-sm font-semibold text-white mb-3">
//               🎯 Expected Hash (for verification)
//             </label>
//             <input
//               type="text"
//               value={expectedHash}
//               onChange={(e) => setExpectedHash(e.target.value)}
//               placeholder="Enter the expected hash value for comparison..."
//               className="input-field font-mono text-sm"
//             />
//           </div>

//           {/* Debug Button */}
//           <div className="mt-8">
//             <Button
//               onClick={debugHash}
//               loading={isDebugging}
//               disabled={!file1}
//               variant="danger"
//               className="w-full h-12 text-lg"
//             >
//               {isDebugging ? (
//                 <>🔬 Analyzing...</>
//               ) : (
//                 <>🔍 Start Debug Analysis</>
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Debug Results */}
//         {debugResult && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-8"
//           >
//             {/* Hash Generation Results */}
//             <div className="card">
//               <div className="flex items-center space-x-2 mb-6">
//                 <DocumentTextIcon className="w-5 h-5 text-[#296CFF]" />
//                 <h3 className="text-lg font-semibold text-white">Hash Generation Analysis</h3>
//               </div>
              
//               <div className="space-y-6">
//                 {/* File Information */}
//                 <div className="bg-[#121212] rounded-xl p-4 border border-[#333333]">
//                   <h4 className="font-semibold text-[#E0E0E0] mb-3 flex items-center space-x-2">
//                     <DocumentTextIcon className="w-4 h-4 text-[#296CFF]" />
//                     <span>File Information</span>
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#CCCCCC]">
//                     <div><strong className="text-white">Name:</strong> {debugResult.hashGeneration.file.name}</div>
//                     <div><strong className="text-white">Size:</strong> {debugResult.hashGeneration.file.size.toLocaleString()} bytes</div>
//                     <div><strong className="text-white">Type:</strong> {debugResult.hashGeneration.file.type || 'Unknown'}</div>
//                   </div>
//                 </div>

//                 {/* Generated Hashes */}
//                 <div className="bg-[#296CFF]/10 rounded-xl p-4 border border-[#296CFF]/30">
//                   <h4 className="font-semibold text-[#296CFF] mb-4">Generated Hashes</h4>
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm font-medium text-[#296CFF]">📄 File Content Hash:</span>
//                         <button
//                           onClick={() => copyToClipboard(debugResult.hashGeneration.hash)}
//                           className="p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//                         >
//                           <ClipboardIcon className="w-4 h-4" />
//                         </button>
//                       </div>
//                       <code className="block bg-[#0D0D0D] p-3 rounded-lg font-mono text-xs text-[#E0E0E0] break-all border border-[#333333]">
//                         {debugResult.hashGeneration.hash}
//                       </code>
//                     </div>
//                     {debugResult.hashGeneration.fullHash && (
//                       <div>
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-sm font-medium text-[#296CFF]">📋 File + Metadata Hash:</span>
//                           <button
//                             onClick={() => copyToClipboard(debugResult.hashGeneration.fullHash)}
//                             className="p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//                           >
//                             <ClipboardIcon className="w-4 h-4" />
//                           </button>
//                         </div>
//                         <code className="block bg-[#0D0D0D] p-3 rounded-lg font-mono text-xs text-[#E0E0E0] break-all border border-[#333333]">
//                           {debugResult.hashGeneration.fullHash}
//                         </code>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Metadata */}
//                 {debugResult.hashGeneration.metadata && (
//                   <div className="bg-[#8B5CF6]/10 rounded-xl p-4 border border-[#8B5CF6]/30">
//                     <h4 className="font-semibold text-[#8B5CF6] mb-3">Metadata Used in Hash</h4>
//                     <pre className="text-xs bg-[#0D0D0D] p-3 rounded-lg overflow-auto text-[#E0E0E0] border border-[#333333]">
//                       {JSON.stringify(debugResult.hashGeneration.metadata, null, 2)}
//                     </pre>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Verification Results */}
//             {debugResult.verification && (
//               <div className="card">
//                 <div className="flex items-center space-x-2 mb-6">
//                   <ClipboardDocumentCheckIcon className="w-5 h-5 text-[#00C853]" />
//                   <h3 className="text-lg font-semibold text-white">Verification Analysis</h3>
//                 </div>

//                 <div className={`p-6 rounded-xl border-2 ${
//                   debugResult.verification.isValid 
//                     ? 'bg-[#00C853]/10 border-[#00C853]/30'
//                     : 'bg-[#FF4C4C]/10 border-[#FF4C4C]/30'
//                 }`}>
//                   <div className="flex items-center justify-center space-x-3 mb-6">
//                     {debugResult.verification.isValid ? (
//                       <div className="flex items-center space-x-2">
//                         <CheckCircleIcon className="w-6 h-6 text-[#00C853]" />
//                         <span className="text-[#00C853] font-bold text-xl">✅ MATCH FOUND</span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center space-x-2">
//                         <XCircleIcon className="w-6 h-6 text-[#FF4C4C]" />
//                         <span className="text-[#FF4C4C] font-bold text-xl">❌ NO MATCH</span>
//                       </div>
//                     )}
//                     {debugResult.verification.matchingStrategy && (
//                       <span className="text-sm text-[#999999] bg-[#1A1A1A] px-2 py-1 rounded">
//                         Strategy: {debugResult.verification.matchingStrategy}
//                       </span>
//                     )}
//                   </div>

//                   <div className="space-y-4">
//                     {/* Expected Hash */}
//                     <div>
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm font-medium text-white">🎯 Expected Hash:</span>
//                         <button
//                           onClick={() => copyToClipboard(debugResult.verification.expectedHash)}
//                           className="p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//                         >
//                           <ClipboardIcon className="w-4 h-4" />
//                         </button>
//                       </div>
//                       <code className="block bg-[#0D0D0D] p-3 rounded-lg font-mono text-xs text-[#E0E0E0] break-all border border-[#333333]">
//                         {debugResult.verification.expectedHash}
//                       </code>
//                     </div>

//                     {/* Tested Strategies */}
//                     {debugResult.verification.strategies && (
//                       <div>
//                         <span className="text-sm font-medium text-white mb-3 block">🧪 Tested Strategies:</span>
//                         <div className="space-y-3">
//                           {debugResult.verification.strategies.map((strategy, index) => (
//                             <div key={index} className="bg-[#0D0D0D] p-4 rounded-lg border border-[#333333]">
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="font-medium text-[#E0E0E0]">{strategy.name}</span>
//                                 <div className="flex items-center space-x-2">
//                                   <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                                     strategy.hash === debugResult.verification.expectedHash
//                                       ? 'bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30'
//                                       : 'bg-[#FF4C4C]/20 text-[#FF4C4C] border border-[#FF4C4C]/30'
//                                   }`}>
//                                     {strategy.hash === debugResult.verification.expectedHash ? '✅ MATCH' : '❌ NO MATCH'}
//                                   </span>
//                                   <button
//                                     onClick={() => copyToClipboard(strategy.hash)}
//                                     className="p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//                                   >
//                                     <ClipboardIcon className="w-3 h-3" />
//                                   </button>
//                                 </div>
//                               </div>
//                               <code className="text-xs text-[#999999] break-all font-mono">
//                                 {strategy.hash}
//                               </code>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* File Comparison Results */}
//             {debugResult.comparison && (
//               <div className="card">
//                 <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
//                   <ExclamationTriangleIcon className="w-5 h-5 text-[#FF9800]" />
//                   <span>File Comparison Analysis</span>
//                 </h3>
                
//                 <div className={`p-6 rounded-xl border-2 ${
//                   debugResult.comparison.identical
//                     ? 'bg-[#00C853]/10 border-[#00C853]/30'
//                     : 'bg-[#FF9800]/10 border-[#FF9800]/30'
//                 }`}>
//                   <div className="text-center mb-6">
//                     {debugResult.comparison.identical ? (
//                       <div className="flex items-center justify-center space-x-2">
//                         <CheckCircleIcon className="w-6 h-6 text-[#00C853]" />
//                         <span className="text-[#00C853] font-bold text-xl">✅ FILES ARE IDENTICAL</span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center space-x-2">
//                         <ExclamationTriangleIcon className="w-6 h-6 text-[#FF9800]" />
//                         <span className="text-[#FF9800] font-bold text-xl">⚠️ FILES ARE DIFFERENT</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* File 1 */}
//                     <div>
//                       <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
//                         <DocumentTextIcon className="w-4 h-4 text-[#296CFF]" />
//                         <span>File 1</span>
//                       </h4>
//                       <div className="bg-[#0D0D0D] p-4 rounded-lg text-sm border border-[#333333]">
//                         <div className="mb-2"><strong className="text-white">Name:</strong> <span className="text-[#CCCCCC]">{debugResult.comparison.file1.name}</span></div>
//                         <div className="mb-2"><strong className="text-white">Hash:</strong></div>
//                         <div className="flex items-center justify-between">
//                           <code className="text-xs break-all text-[#E0E0E0] flex-1 mr-2">{debugResult.comparison.file1Hash}</code>
//                           <button
//                             onClick={() => copyToClipboard(debugResult.comparison.file1Hash)}
//                             className="p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//                           >
//                             <ClipboardIcon className="w-3 h-3" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     {/* File 2 */}
//                     <div>
//                       <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
//                         <DocumentTextIcon className="w-4 h-4 text-[#00C853]" />
//                         <span>File 2</span>
//                       </h4>
//                       <div className="bg-[#0D0D0D] p-4 rounded-lg text-sm border border-[#333333]">
//                         <div className="mb-2"><strong className="text-white">Name:</strong> <span className="text-[#CCCCCC]">{debugResult.comparison.file2.name}</span></div>
//                         <div className="mb-2"><strong className="text-white">Hash:</strong></div>
//                         <div className="flex items-center justify-between">
//                           <code className="text-xs break-all text-[#E0E0E0] flex-1 mr-2">{debugResult.comparison.file2Hash}</code>
//                           <button
//                             onClick={() => copyToClipboard(debugResult.comparison.file2Hash)}
//                             className="p-1 text-[#666666] hover:text-[#296CFF] transition-colors"
//                           >
//                             <ClipboardIcon className="w-3 h-3" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default HashDebugger;

// src/components/debug/HashDebugger.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  BugAntIcon, 
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardIcon
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('📋 Hash copied to clipboard!', {
        icon: '📋'
      });
    }).catch(() => {
      toast.error('❌ Failed to copy hash');
    });
  };

  const debugHash = async () => {
    if (!file1) {
      toast.error('❌ Please select a file to debug');
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

      toast.success('🔍 Debug analysis completed!', {
        icon: '🔬'
      });
    } catch (error) {
      console.error('Debug error:', error);
      toast.error(`❌ Debug failed: ${error.message}`);
    } finally {
      setIsDebugging(false);
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
            <div className="p-3 bg-[rgb(var(--color-error)/0.2)] rounded-full border border-[rgb(var(--color-error)/0.3)]">
              <BugAntIcon className="w-8 h-8 text-[rgb(var(--color-error))]" />
            </div>
          </div>
          <h1 
            className="text-4xl font-bold mb-3"
            style={{
              background: `linear-gradient(135deg, rgb(var(--color-error)), rgba(255,107,107,0.8))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Hash Debugger
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-lg max-w-2xl mx-auto">
            Advanced troubleshooting tool for hash mismatch issues and document hashing analysis
          </p>
        </div>

        {/* Configuration Card */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <BeakerIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Debug Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary File */}
            <div>
              <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
                📄 Primary File (to debug)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileSelect(1, e)}
                className="input-field"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
              />
              {file1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-[rgb(var(--color-success)/0.1)] border border-[rgb(var(--color-success)/0.3)] rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                    <span className="text-sm text-[rgb(var(--color-success))] font-medium">
                      {file1.name} ({(file1.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Comparison File */}
            <div>
              <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
                🔄 Comparison File (optional)
              </label>
              <input
                type="file"
                onChange={(e) => handleFileSelect(2, e)}
                className="input-field"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
              />
              {file2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-[rgb(var(--color-primary)/0.1)] border border-[rgb(var(--color-primary)/0.3)] rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    <span className="text-sm text-[rgb(var(--color-primary))] font-medium">
                      {file2.name} ({(file2.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Expected Hash Input */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">
              🎯 Expected Hash (for verification)
            </label>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Enter the expected hash value for comparison..."
              className="input-field font-mono text-sm"
            />
          </div>

          {/* Debug Button */}
          <div className="mt-8">
            <Button
              onClick={debugHash}
              loading={isDebugging}
              disabled={!file1}
              variant="danger"
              className="w-full h-12 text-lg"
            >
              {isDebugging ? (
                <>🔬 Analyzing...</>
              ) : (
                <>🔍 Start Debug Analysis</>
              )}
            </Button>
          </div>
        </div>

        {/* Debug Results */}
        {debugResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hash Generation Results */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Hash Generation Analysis</h3>
              </div>
              
              <div className="space-y-6">
                {/* File Information */}
                <div className="bg-[rgb(var(--surface-secondary))] rounded-xl p-4 border border-[rgb(var(--border-primary))]">
                  <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center space-x-2">
                    <DocumentTextIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    <span>File Information</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[rgb(var(--text-secondary))]">
                    <div><strong className="text-[rgb(var(--text-primary))]">Name:</strong> {debugResult.hashGeneration.file.name}</div>
                    <div><strong className="text-[rgb(var(--text-primary))]">Size:</strong> {debugResult.hashGeneration.file.size.toLocaleString()} bytes</div>
                    <div><strong className="text-[rgb(var(--text-primary))]">Type:</strong> {debugResult.hashGeneration.file.type || 'Unknown'}</div>
                  </div>
                </div>

                {/* Generated Hashes */}
                <div className="bg-[rgb(var(--color-primary)/0.1)] rounded-xl p-4 border border-[rgb(var(--color-primary)/0.3)]">
                  <h4 className="font-semibold text-[rgb(var(--color-primary))] mb-4">Generated Hashes</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[rgb(var(--color-primary))]">📄 File Content Hash:</span>
                        <button
                          onClick={() => copyToClipboard(debugResult.hashGeneration.hash)}
                          className="p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <code className="block bg-[rgb(var(--surface-primary))] p-3 rounded-lg font-mono text-xs text-[rgb(var(--text-primary))] break-all border border-[rgb(var(--border-primary))]">
                        {debugResult.hashGeneration.hash}
                      </code>
                    </div>
                    {debugResult.hashGeneration.fullHash && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[rgb(var(--color-primary))]">📋 File + Metadata Hash:</span>
                          <button
                            onClick={() => copyToClipboard(debugResult.hashGeneration.fullHash)}
                            className="p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <code className="block bg-[rgb(var(--surface-primary))] p-3 rounded-lg font-mono text-xs text-[rgb(var(--text-primary))] break-all border border-[rgb(var(--border-primary))]">
                          {debugResult.hashGeneration.fullHash}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {debugResult.hashGeneration.metadata && (
                  <div className="bg-[rgba(139,92,246,0.1)] rounded-xl p-4 border border-[rgba(139,92,246,0.3)]">
                    <h4 className="font-semibold text-[rgb(139,92,246)] mb-3">Metadata Used in Hash</h4>
                    <pre className="text-xs bg-[rgb(var(--surface-primary))] p-3 rounded-lg overflow-auto text-[rgb(var(--text-primary))] border border-[rgb(var(--border-primary))]">
                      {JSON.stringify(debugResult.hashGeneration.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Results */}
            {debugResult.verification && (
              <div className="card">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="p-2 bg-[rgb(var(--color-success)/0.1)] rounded-lg">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-[rgb(var(--color-success))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Verification Analysis</h3>
                </div>

                <div className={`p-6 rounded-xl border-2 ${
                  debugResult.verification.isValid 
                    ? 'bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success)/0.3)]'
                    : 'bg-[rgb(var(--color-error)/0.1)] border-[rgb(var(--color-error)/0.3)]'
                }`}>
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    {debugResult.verification.isValid ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-6 h-6 text-[rgb(var(--color-success))]" />
                        <span className="text-[rgb(var(--color-success))] font-bold text-xl">✅ MATCH FOUND</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <XCircleIcon className="w-6 h-6 text-[rgb(var(--color-error))]" />
                        <span className="text-[rgb(var(--color-error))] font-bold text-xl">❌ NO MATCH</span>
                      </div>
                    )}
                    {debugResult.verification.matchingStrategy && (
                      <span className="text-sm text-[rgb(var(--text-secondary))] bg-[rgb(var(--surface-primary))] px-2 py-1 rounded">
                        Strategy: {debugResult.verification.matchingStrategy}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Expected Hash */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))]">🎯 Expected Hash:</span>
                        <button
                          onClick={() => copyToClipboard(debugResult.verification.expectedHash)}
                          className="p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <code className="block bg-[rgb(var(--surface-primary))] p-3 rounded-lg font-mono text-xs text-[rgb(var(--text-primary))] break-all border border-[rgb(var(--border-primary))]">
                        {debugResult.verification.expectedHash}
                      </code>
                    </div>

                    {/* Tested Strategies */}
                    {debugResult.verification.strategies && (
                      <div>
                        <span className="text-sm font-medium text-[rgb(var(--text-primary))] mb-3 block">🧪 Tested Strategies:</span>
                        <div className="space-y-3">
                          {debugResult.verification.strategies.map((strategy, index) => (
                            <div key={index} className="bg-[rgb(var(--surface-primary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-[rgb(var(--text-primary))]">{strategy.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    strategy.hash === debugResult.verification.expectedHash
                                      ? 'bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] border border-[rgb(var(--color-success)/0.3)]'
                                      : 'bg-[rgb(var(--color-error)/0.2)] text-[rgb(var(--color-error))] border border-[rgb(var(--color-error)/0.3)]'
                                  }`}>
                                    {strategy.hash === debugResult.verification.expectedHash ? '✅ MATCH' : '❌ NO MATCH'}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(strategy.hash)}
                                    className="p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                                  >
                                    <ClipboardIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <code className="text-xs text-[rgb(var(--text-secondary))] break-all font-mono">
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
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center space-x-2">
                  <div className="p-2 bg-[rgb(var(--color-warning)/0.1)] rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-[rgb(var(--color-warning))]" />
                  </div>
                  <span>File Comparison Analysis</span>
                </h3>
                
                <div className={`p-6 rounded-xl border-2 ${
                  debugResult.comparison.identical
                    ? 'bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success)/0.3)]'
                    : 'bg-[rgb(var(--color-warning)/0.1)] border-[rgb(var(--color-warning)/0.3)]'
                }`}>
                  <div className="text-center mb-6">
                    {debugResult.comparison.identical ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircleIcon className="w-6 h-6 text-[rgb(var(--color-success))]" />
                        <span className="text-[rgb(var(--color-success))] font-bold text-xl">✅ FILES ARE IDENTICAL</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <ExclamationTriangleIcon className="w-6 h-6 text-[rgb(var(--color-warning))]" />
                        <span className="text-[rgb(var(--color-warning))] font-bold text-xl">⚠️ FILES ARE DIFFERENT</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File 1 */}
                    <div>
                      <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center space-x-2">
                        <DocumentTextIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                        <span>File 1</span>
                      </h4>
                      <div className="bg-[rgb(var(--surface-primary))] p-4 rounded-lg text-sm border border-[rgb(var(--border-primary))]">
                        <div className="mb-2"><strong className="text-[rgb(var(--text-primary))]">Name:</strong> <span className="text-[rgb(var(--text-secondary))]">{debugResult.comparison.file1.name}</span></div>
                        <div className="mb-2"><strong className="text-[rgb(var(--text-primary))]">Hash:</strong></div>
                        <div className="flex items-center justify-between">
                          <code className="text-xs break-all text-[rgb(var(--text-primary))] flex-1 mr-2">{debugResult.comparison.file1Hash}</code>
                          <button
                            onClick={() => copyToClipboard(debugResult.comparison.file1Hash)}
                            className="p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                          >
                            <ClipboardIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* File 2 */}
                    <div>
                      <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center space-x-2">
                        <DocumentTextIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                        <span>File 2</span>
                      </h4>
                      <div className="bg-[rgb(var(--surface-primary))] p-4 rounded-lg text-sm border border-[rgb(var(--border-primary))]">
                        <div className="mb-2"><strong className="text-[rgb(var(--text-primary))]">Name:</strong> <span className="text-[rgb(var(--text-secondary))]">{debugResult.comparison.file2.name}</span></div>
                        <div className="mb-2"><strong className="text-[rgb(var(--text-primary))]">Hash:</strong></div>
                        <div className="flex items-center justify-between">
                          <code className="text-xs break-all text-[rgb(var(--text-primary))] flex-1 mr-2">{debugResult.comparison.file2Hash}</code>
                          <button
                            onClick={() => copyToClipboard(debugResult.comparison.file2Hash)}
                            className="p-1 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                          >
                            <ClipboardIcon className="w-3 h-3" />
                          </button>
                        </div>
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
