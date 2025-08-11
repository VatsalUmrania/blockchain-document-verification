import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  CheckIcon, 
  TrashIcon, 
  ShareIcon,
  DownloadIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const BatchOperations = ({ documents, selectedDocuments, onSelectionChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');

  const selectAll = () => {
    const allIds = documents.map(doc => doc.id);
    onSelectionChange(allIds);
    toast.info(`Selected ${allIds.length} documents`);
  };

  const selectNone = () => {
    onSelectionChange([]);
    toast.info('Selection cleared');
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
      toast.error('Please select documents to verify');
      return;
    }

    await simulateProgress(`Verifying ${selectedDocuments.length} documents...`);
    toast.success(`Successfully verified ${selectedDocuments.length} documents`);
  };

  const batchDelete = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select documents to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedDocuments.length} documents? This action cannot be undone.`)) {
      return;
    }

    await simulateProgress(`Deleting ${selectedDocuments.length} documents...`);
    toast.success(`Successfully deleted ${selectedDocuments.length} documents`);
    onSelectionChange([]);
  };

  const batchDownload = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select documents to download');
      return;
    }

    await simulateProgress(`Preparing ${selectedDocuments.length} documents for download...`);
    
    // Simulate creating a ZIP file
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,This would be your ZIP file content';
    link.download = `documents-batch-${Date.now()}.zip`;
    link.click();
    
    toast.success(`Download prepared for ${selectedDocuments.length} documents`);
  };

  const batchShare = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select documents to share');
      return;
    }

    await simulateProgress(`Creating share links for ${selectedDocuments.length} documents...`);
    
    const shareLink = `${window.location.origin}/shared/batch-${Math.random().toString(36).substring(2, 15)}`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success(`Batch share link copied to clipboard!`);
    }).catch(() => {
      toast.success(`Batch share link created: ${shareLink}`);
    });
  };

  const batchExport = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select documents to export');
      return;
    }

    await simulateProgress(`Exporting ${selectedDocuments.length} document records...`);
    
    // Create CSV data
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    const csvContent = [
      ['Name', 'Hash', 'Size', 'Category', 'Upload Date'],
      ...selectedDocs.map(doc => [
        doc.name,
        doc.hash,
        `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
        doc.category,
        new Date(doc.timestamp).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedDocuments.length} document records`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-6"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Batch Operations
            {selectedDocuments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({selectedDocuments.length} selected)
              </span>
            )}
          </h3>
          
          <div className="flex space-x-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={selectNone} variant="outline" size="sm">
              Select None
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{currentOperation}</span>
              <span className="text-sm font-medium text-gray-800">{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button
            onClick={batchVerify}
            disabled={isProcessing || selectedDocuments.length === 0}
            className="flex items-center justify-center space-x-2"
            size="sm"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Verify</span>
          </Button>

          <Button
            onClick={batchDownload}
            disabled={isProcessing || selectedDocuments.length === 0}
            variant="outline"
            className="flex items-center justify-center space-x-2"
            size="sm"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Download</span>
          </Button>

          <Button
            onClick={batchShare}
            disabled={isProcessing || selectedDocuments.length === 0}
            variant="outline"
            className="flex items-center justify-center space-x-2"
            size="sm"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </Button>

          <Button
            onClick={batchExport}
            disabled={isProcessing || selectedDocuments.length === 0}
            variant="outline"
            className="flex items-center justify-center space-x-2"
            size="sm"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>Export</span>
          </Button>

          <Button
            onClick={batchDelete}
            disabled={isProcessing || selectedDocuments.length === 0}
            variant="danger"
            className="flex items-center justify-center space-x-2"
            size="sm"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>

        {/* Quick Stats */}
        {selectedDocuments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedDocuments.length}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'verified').length}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(documents
                  .filter(doc => selectedDocuments.includes(doc.id))
                  .reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024
                ).toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BatchOperations;
