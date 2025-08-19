// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import { 
//   CheckIcon, 
//   TrashIcon, 
//   ShareIcon,
//   DownloadIcon,
//   DocumentDuplicateIcon,
//   CubeIcon,
//   ChartBarIcon,
//   ClockIcon,
//   CheckCircleIcon
// } from '@heroicons/react/24/outline';
// import Button from '../common/Button';
// import ProgressBar from '../common/ProgressBar';

// const BatchOperations = ({ documents, selectedDocuments, onSelectionChange }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [currentOperation, setCurrentOperation] = useState('');

//   const selectAll = () => {
//     const allIds = documents.map(doc => doc.id);
//     onSelectionChange(allIds);
//     toast.info(`📋 Selected ${allIds.length} documents`, {
//       icon: '✅'
//     });
//   };

//   const selectNone = () => {
//     onSelectionChange([]);
//     toast.info('🗑️ Selection cleared', {
//       icon: '❌'
//     });
//   };

//   const simulateProgress = async (operation, duration = 3000) => {
//     setIsProcessing(true);
//     setCurrentOperation(operation);
//     setProgress(0);

//     const steps = 100;
//     const stepDuration = duration / steps;

//     for (let i = 0; i <= steps; i++) {
//       setProgress(i);
//       await new Promise(resolve => setTimeout(resolve, stepDuration));
//     }

//     setIsProcessing(false);
//     setProgress(0);
//     setCurrentOperation('');
//   };

//   const batchVerify = async () => {
//     if (selectedDocuments.length === 0) {
//       toast.error('❌ Please select documents to verify');
//       return;
//     }

//     await simulateProgress(`Verifying ${selectedDocuments.length} documents...`);
//     toast.success(`✅ Successfully verified ${selectedDocuments.length} documents`, {
//       icon: '🔍'
//     });
//   };

//   const batchDelete = async () => {
//     if (selectedDocuments.length === 0) {
//       toast.error('❌ Please select documents to delete');
//       return;
//     }

//     if (!window.confirm(`⚠️ Are you sure you want to delete ${selectedDocuments.length} documents? This action cannot be undone.`)) {
//       return;
//     }

//     await simulateProgress(`Deleting ${selectedDocuments.length} documents...`);
//     toast.success(`🗑️ Successfully deleted ${selectedDocuments.length} documents`, {
//       icon: '🗑️'
//     });
//     onSelectionChange([]);
//   };

//   const batchDownload = async () => {
//     if (selectedDocuments.length === 0) {
//       toast.error('❌ Please select documents to download');
//       return;
//     }

//     await simulateProgress(`Preparing ${selectedDocuments.length} documents for download...`);
    
//     // Simulate creating a ZIP file
//     const link = document.createElement('a');
//     link.href = 'data:text/plain;charset=utf-8,This would be your ZIP file content';
//     link.download = `documents-batch-${Date.now()}.zip`;
//     link.click();
    
//     toast.success(`📥 Download prepared for ${selectedDocuments.length} documents`, {
//       icon: '📥'
//     });
//   };

//   const batchShare = async () => {
//     if (selectedDocuments.length === 0) {
//       toast.error('❌ Please select documents to share');
//       return;
//     }

//     await simulateProgress(`Creating share links for ${selectedDocuments.length} documents...`);
    
//     const shareLink = `${window.location.origin}/shared/batch-${Math.random().toString(36).substring(2, 15)}`;
    
//     navigator.clipboard.writeText(shareLink).then(() => {
//       toast.success(`🔗 Batch share link copied to clipboard!`, {
//         icon: '🔗'
//       });
//     }).catch(() => {
//       toast.success(`🔗 Batch share link created: ${shareLink}`, {
//         icon: '🔗'
//       });
//     });
//   };

//   const batchExport = async () => {
//     if (selectedDocuments.length === 0) {
//       toast.error('❌ Please select documents to export');
//       return;
//     }

//     await simulateProgress(`Exporting ${selectedDocuments.length} document records...`);
    
//     // Create CSV data
//     const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
//     const csvContent = [
//       ['Name', 'Hash', 'Size', 'Category', 'Upload Date'],
//       ...selectedDocs.map(doc => [
//         doc.name,
//         doc.hash,
//         `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
//         doc.category,
//         new Date(doc.timestamp).toLocaleDateString()
//       ])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `document-export-${Date.now()}.csv`;
//     link.click();
//     URL.revokeObjectURL(url);

//     toast.success(`📊 Exported ${selectedDocuments.length} document records`, {
//       icon: '📊'
//     });
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="card mb-6"
//     >
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <CubeIcon className="w-5 h-5 text-[#296CFF]" />
//             <h3 className="text-lg font-semibold text-white">
//               Batch Operations
//               {selectedDocuments.length > 0 && (
//                 <span className="ml-2 text-sm font-normal text-[#999999]">
//                   ({selectedDocuments.length} selected)
//                 </span>
//               )}
//             </h3>
//           </div>
          
//           <div className="flex space-x-3">
//             <Button 
//               onClick={selectAll} 
//               variant="outline" 
//               size="sm"
//               className="flex items-center space-x-2"
//             >
//               <CheckCircleIcon className="w-4 h-4" />
//               <span>Select All</span>
//             </Button>
//             <Button 
//               onClick={selectNone} 
//               variant="ghost" 
//               size="sm"
//               className="flex items-center space-x-2"
//             >
//               <span>Clear</span>
//             </Button>
//           </div>
//         </div>

//         {/* Progress Bar */}
//         {isProcessing && (
//           <motion.div 
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="space-y-3 p-4 bg-[#121212] rounded-xl border border-[#333333]"
//           >
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-[#E0E0E0] flex items-center space-x-2">
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                   className="w-4 h-4 border-2 border-[#296CFF] border-t-transparent rounded-full"
//                 />
//                 <span>{currentOperation}</span>
//               </span>
//               <span className="text-sm font-semibold text-[#296CFF]">{progress}%</span>
//             </div>
//             <ProgressBar progress={progress} />
//           </motion.div>
//         )}

//         {/* Action Buttons */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               onClick={batchVerify}
//               disabled={isProcessing || selectedDocuments.length === 0}
//               className="w-full flex items-center justify-center space-x-2 h-12"
//               size="sm"
//               variant="primary"
//             >
//               <CheckIcon className="w-4 h-4" />
//               <span>Verify</span>
//             </Button>
//           </motion.div>

//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               onClick={batchDownload}
//               disabled={isProcessing || selectedDocuments.length === 0}
//               variant="outline"
//               className="w-full flex items-center justify-center space-x-2 h-12"
//               size="sm"
//             >
//               <DownloadIcon className="w-4 h-4" />
//               <span>Download</span>
//             </Button>
//           </motion.div>

//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               onClick={batchShare}
//               disabled={isProcessing || selectedDocuments.length === 0}
//               variant="outline"
//               className="w-full flex items-center justify-center space-x-2 h-12"
//               size="sm"
//             >
//               <ShareIcon className="w-4 h-4" />
//               <span>Share</span>
//             </Button>
//           </motion.div>

//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               onClick={batchExport}
//               disabled={isProcessing || selectedDocuments.length === 0}
//               variant="secondary"
//               className="w-full flex items-center justify-center space-x-2 h-12"
//               size="sm"
//             >
//               <DocumentDuplicateIcon className="w-4 h-4" />
//               <span>Export</span>
//             </Button>
//           </motion.div>

//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               onClick={batchDelete}
//               disabled={isProcessing || selectedDocuments.length === 0}
//               variant="danger"
//               className="w-full flex items-center justify-center space-x-2 h-12"
//               size="sm"
//             >
//               <TrashIcon className="w-4 h-4" />
//               <span>Delete</span>
//             </Button>
//           </motion.div>
//         </div>

//         {/* Quick Stats */}
//         {selectedDocuments.length > 0 && (
//           <motion.div 
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#333333]"
//           >
//             <div className="text-center p-4 bg-[#296CFF]/10 rounded-xl border border-[#296CFF]/30">
//               <div className="text-2xl font-bold text-[#296CFF] mb-1">{selectedDocuments.length}</div>
//               <div className="text-sm text-[#999999] flex items-center justify-center space-x-1">
//                 <CubeIcon className="w-3 h-3" />
//                 <span>Selected</span>
//               </div>
//             </div>
            
//             <div className="text-center p-4 bg-[#00C853]/10 rounded-xl border border-[#00C853]/30">
//               <div className="text-2xl font-bold text-[#00C853] mb-1">
//                 {documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'verified').length}
//               </div>
//               <div className="text-sm text-[#999999] flex items-center justify-center space-x-1">
//                 <CheckCircleIcon className="w-3 h-3" />
//                 <span>Verified</span>
//               </div>
//             </div>
            
//             <div className="text-center p-4 bg-[#FF9800]/10 rounded-xl border border-[#FF9800]/30">
//               <div className="text-2xl font-bold text-[#FF9800] mb-1">
//                 {documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'pending').length}
//               </div>
//               <div className="text-sm text-[#999999] flex items-center justify-center space-x-1">
//                 <ClockIcon className="w-3 h-3" />
//                 <span>Pending</span>
//               </div>
//             </div>
            
//             <div className="text-center p-4 bg-[#8B5CF6]/10 rounded-xl border border-[#8B5CF6]/30">
//               <div className="text-2xl font-bold text-[#8B5CF6] mb-1">
//                 {(documents
//                   .filter(doc => selectedDocuments.includes(doc.id))
//                   .reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024
//                 ).toFixed(1)}MB
//               </div>
//               <div className="text-sm text-[#999999] flex items-center justify-center space-x-1">
//                 <ChartBarIcon className="w-3 h-3" />
//                 <span>Total Size</span>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default BatchOperations;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  CheckIcon, 
  TrashIcon, 
  ShareIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CubeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { ConfirmModal } from '../common/Modal';

const BatchOperations = ({ documents, selectedDocuments, onSelectionChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectAll = () => {
    const allIds = documents.map(doc => doc.id);
    onSelectionChange(allIds);
    toast.info(`📋 Selected ${allIds.length} documents`, {
      icon: '✅'
    });
  };

  const selectNone = () => {
    onSelectionChange([]);
    toast.info('🗑️ Selection cleared', {
      icon: '❌'
    });
  };

  const selectByStatus = (status) => {
    const filteredIds = documents
      .filter(doc => doc.status === status)
      .map(doc => doc.id);
    onSelectionChange(filteredIds);
    toast.info(`📋 Selected ${filteredIds.length} ${status} documents`);
  };

  const simulateProgress = async (operation, duration = 3000) => {
    setIsProcessing(true);
    setCurrentOperation(operation);
    setProgress(0);

    const steps = 100;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    setIsProcessing(false);
    setProgress(0);
    setCurrentOperation('');
  };

  const batchVerify = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('❌ Please select documents to verify');
      return;
    }

    await simulateProgress(`Verifying ${selectedDocuments.length} documents...`);
    toast.success(`✅ Successfully verified ${selectedDocuments.length} documents`, {
      icon: '🔍'
    });
  };

  const batchDelete = async () => {
    await simulateProgress(`Deleting ${selectedDocuments.length} documents...`);
    toast.success(`🗑️ Successfully deleted ${selectedDocuments.length} documents`, {
      icon: '🗑️'
    });
    onSelectionChange([]);
    setShowDeleteConfirm(false);
  };

  const batchDownload = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('❌ Please select documents to download');
      return;
    }

    await simulateProgress(`Preparing ${selectedDocuments.length} documents for download...`);
    
    // Simulate creating a ZIP file
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,This would be your ZIP file content';
    link.download = `documents-batch-${Date.now()}.zip`;
    link.click();
    
    toast.success(`📥 Download prepared for ${selectedDocuments.length} documents`, {
      icon: '📥'
    });
  };

  const batchShare = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('❌ Please select documents to share');
      return;
    }

    await simulateProgress(`Creating share links for ${selectedDocuments.length} documents...`);
    
    const shareLink = `${window.location.origin}/shared/batch-${Math.random().toString(36).substring(2, 15)}`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success(`🔗 Batch share link copied to clipboard!`, {
        icon: '🔗'
      });
    }).catch(() => {
      toast.success(`🔗 Batch share link created: ${shareLink}`, {
        icon: '🔗'
      });
    });
  };

  const batchExport = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('❌ Please select documents to export');
      return;
    }

    await simulateProgress(`Exporting ${selectedDocuments.length} document records...`);
    
    // Create CSV data
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    const csvContent = [
      ['Name', 'Hash', 'Size', 'Category', 'Upload Date', 'Status'],
      ...selectedDocs.map(doc => [
        doc.name,
        doc.hash,
        `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
        doc.category,
        new Date(doc.timestamp).toLocaleDateString(),
        doc.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`📊 Exported ${selectedDocuments.length} document records`, {
      icon: '📊'
    });
  };

  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-[rgb(var(--surface-secondary))] rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-2 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-hover))] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );

  const selectedStats = {
    total: selectedDocuments.length,
    verified: documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'verified').length,
    pending: documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'pending').length,
    totalSize: documents
      .filter(doc => selectedDocuments.includes(doc.id))
      .reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                <CubeIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                  Batch Operations
                </h3>
                {selectedDocuments.length > 0 && (
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
            
            {/* Selection Controls */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={selectAll} 
                variant="ghost" 
                size="sm"
                icon={CheckCircleIcon}
                disabled={isProcessing}
              >
                All ({documents.length})
              </Button>
              <Button 
                onClick={() => selectByStatus('verified')} 
                variant="ghost" 
                size="sm"
                icon={CheckIcon}
                disabled={isProcessing}
                className="text-[rgb(var(--color-success))] hover:text-[rgb(var(--color-success))]"
              >
                Verified
              </Button>
              <Button 
                onClick={() => selectByStatus('pending')} 
                variant="ghost" 
                size="sm"
                icon={ClockIcon}
                disabled={isProcessing}
                className="text-[rgb(var(--color-warning))] hover:text-[rgb(var(--color-warning))]"
              >
                Pending
              </Button>
              <Button 
                onClick={selectNone} 
                variant="ghost" 
                size="sm"
                icon={XMarkIcon}
                disabled={isProcessing}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-4 bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(var(--text-primary))] flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full"
                    />
                    <span>{currentOperation}</span>
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-primary))]">
                    {progress}%
                  </span>
                </div>
                <ProgressBar progress={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={batchVerify}
                disabled={isProcessing || selectedDocuments.length === 0}
                className="w-full h-12"
                size="sm"
                variant="primary"
                icon={EyeIcon}
              >
                Verify
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={batchDownload}
                disabled={isProcessing || selectedDocuments.length === 0}
                variant="secondary"
                className="w-full h-12"
                size="sm"
                icon={ArrowDownTrayIcon}
              >
                Download
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={batchShare}
                disabled={isProcessing || selectedDocuments.length === 0}
                variant="secondary"
                className="w-full h-12"
                size="sm"
                icon={ShareIcon}
              >
                Share
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={batchExport}
                disabled={isProcessing || selectedDocuments.length === 0}
                variant="secondary"
                className="w-full h-12"
                size="sm"
                icon={DocumentDuplicateIcon}
              >
                Export
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing || selectedDocuments.length === 0}
                variant="danger"
                className="w-full h-12"
                size="sm"
                icon={TrashIcon}
              >
                Delete
              </Button>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <AnimatePresence>
            {selectedDocuments.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[rgb(var(--border-primary))]"
              >
                <div className="text-center p-4 bg-[rgb(var(--color-primary)/0.1)] rounded-xl border border-[rgb(var(--color-primary)/0.3)] hover:border-[rgb(var(--color-primary))] transition-colors">
                  <div className="text-2xl font-bold text-[rgb(var(--color-primary))] mb-1">
                    {selectedStats.total}
                  </div>
                  <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                    <FolderIcon className="w-3 h-3" />
                    <span>Selected</span>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-[rgb(var(--color-success)/0.1)] rounded-xl border border-[rgb(var(--color-success)/0.3)] hover:border-[rgb(var(--color-success))] transition-colors">
                  <div className="text-2xl font-bold text-[rgb(var(--color-success))] mb-1">
                    {selectedStats.verified}
                  </div>
                  <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-[rgb(var(--color-warning)/0.1)] rounded-xl border border-[rgb(var(--color-warning)/0.3)] hover:border-[rgb(var(--color-warning))] transition-colors">
                  <div className="text-2xl font-bold text-[rgb(var(--color-warning))] mb-1">
                    {selectedStats.pending}
                  </div>
                  <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>Pending</span>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-[rgb(var(--text-quaternary)/0.1)] rounded-xl border border-[rgb(var(--text-quaternary)/0.3)] hover:border-[rgb(var(--text-quaternary))] transition-colors">
                  <div className="text-2xl font-bold text-[rgb(var(--text-quaternary))] mb-1">
                    {selectedStats.totalSize.toFixed(1)}MB
                  </div>
                  <div className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center space-x-1">
                    <ChartBarIcon className="w-3 h-3" />
                    <span>Total Size</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={batchDelete}
        title="Delete Documents"
        message={`Are you sure you want to delete ${selectedDocuments.length} selected document${selectedDocuments.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={isProcessing}
      />
    </>
  );
};

export default BatchOperations;
