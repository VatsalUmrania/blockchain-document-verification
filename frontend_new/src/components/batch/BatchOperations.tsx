import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Check, 
  Trash2, 
  Share,
  Download,
  Copy,
  Package,
  BarChart3,
  Clock,
  CheckCircle,
  X,
  Eye,
  Folder,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Types and Interfaces
interface Document {
  id: string;
  name: string;
  hash: string;
  size: number;
  category: string;
  timestamp: number;
  status: 'verified' | 'pending' | 'rejected';
}

interface BatchOperationsProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

interface SelectedStats {
  total: number;
  verified: number;
  pending: number;
  totalSize: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  colorClass: string;
  borderClass: string;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({ 
  documents, 
  selectedDocuments, 
  onSelectionChange 
}) => {
  // State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Selection handlers
  const selectAll = useCallback((): void => {
    const allIds = documents.map(doc => doc.id);
    onSelectionChange(allIds);
    toast.success('Selection Updated', {
      description: `Selected ${allIds.length} documents`,
    });
  }, [documents, onSelectionChange]);

  const selectNone = useCallback((): void => {
    onSelectionChange([]);
    toast.info('Selection Cleared', {
      description: 'All documents deselected',
    });
  }, [onSelectionChange]);

  const selectByStatus = useCallback((status: 'verified' | 'pending' | 'rejected'): void => {
    const filteredIds = documents
      .filter(doc => doc.status === status)
      .map(doc => doc.id);
    onSelectionChange(filteredIds);
    toast.success('Selection Updated', {
      description: `Selected ${filteredIds.length} ${status} documents`,
    });
  }, [documents, onSelectionChange]);

  // Progress simulation
  const simulateProgress = useCallback(async (operation: string, duration: number = 3000): Promise<void> => {
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
  }, []);

  // Batch operations
  const batchVerify = useCallback(async (): Promise<void> => {
    if (selectedDocuments.length === 0) {
      toast.error('No Selection', {
        description: 'Please select documents to verify',
      });
      return;
    }

    await simulateProgress(`Verifying ${selectedDocuments.length} documents...`);
    toast.success('Verification Complete', {
      description: `Successfully verified ${selectedDocuments.length} documents`,
    });
  }, [selectedDocuments.length, simulateProgress]);

  const batchDelete = useCallback(async (): Promise<void> => {
    await simulateProgress(`Deleting ${selectedDocuments.length} documents...`);
    toast.success('Deletion Complete', {
      description: `Successfully deleted ${selectedDocuments.length} documents`,
    });
    onSelectionChange([]);
    setShowDeleteConfirm(false);
  }, [selectedDocuments.length, simulateProgress, onSelectionChange]);

  const batchDownload = useCallback(async (): Promise<void> => {
    if (selectedDocuments.length === 0) {
      toast.error('No Selection', {
        description: 'Please select documents to download',
      });
      return;
    }

    await simulateProgress(`Preparing ${selectedDocuments.length} documents for download...`);
    
    // Simulate creating a ZIP file
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,This would be your ZIP file content';
    link.download = `documents-batch-${Date.now()}.zip`;
    link.click();
    
    toast.success('Download Ready', {
      description: `Download prepared for ${selectedDocuments.length} documents`,
    });
  }, [selectedDocuments.length, simulateProgress]);

  const batchShare = useCallback(async (): Promise<void> => {
    if (selectedDocuments.length === 0) {
      toast.error('No Selection', {
        description: 'Please select documents to share',
      });
      return;
    }

    await simulateProgress(`Creating share links for ${selectedDocuments.length} documents...`);
    
    const shareLink = `${window.location.origin}/shared/batch-${Math.random().toString(36).substring(2, 15)}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share Link Copied', {
        description: 'Batch share link copied to clipboard!',
      });
    } catch {
      toast.success('Share Link Created', {
        description: `Share link: ${shareLink}`,
      });
    }
  }, [selectedDocuments.length, simulateProgress]);

  const batchExport = useCallback(async (): Promise<void> => {
    if (selectedDocuments.length === 0) {
      toast.error('No Selection', {
        description: 'Please select documents to export',
      });
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

    toast.success('Export Complete', {
      description: `Exported ${selectedDocuments.length} document records`,
    });
  }, [selectedDocuments, documents, simulateProgress]);

  // Calculate selected stats
  const selectedStats: SelectedStats = {
    total: selectedDocuments.length,
    verified: documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'verified').length,
    pending: documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'pending').length,
    totalSize: documents
      .filter(doc => selectedDocuments.includes(doc.id))
      .reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024
  };

  // StatCard component
  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, borderClass }) => (
    <Card className={`text-center transition-colors hover:${borderClass} ${borderClass}`}>
      <CardContent className={`p-4 ${colorClass}`}>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
          <Icon className="w-3 h-3" />
          <span>{title}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Batch Operations</h3>
                  {selectedDocuments.length > 0 && (
                    <p className="text-sm text-muted-foreground">
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
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All ({documents.length})
                </Button>
                <Button 
                  onClick={() => selectByStatus('verified')} 
                  variant="ghost" 
                  size="sm"
                  disabled={isProcessing}
                  className="text-green-600 hover:text-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Verified
                </Button>
                <Button 
                  onClick={() => selectByStatus('pending')} 
                  variant="ghost" 
                  size="sm"
                  disabled={isProcessing}
                  className="text-yellow-600 hover:text-yellow-600 hover:bg-yellow-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </Button>
                <Button 
                  onClick={selectNone} 
                  variant="ghost" 
                  size="sm"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
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
                  className="space-y-3"
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>{currentOperation}</span>
                        </span>
                        <Badge variant="outline" className="text-primary border-primary">
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </CardContent>
                  </Card>
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
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={batchDownload}
                  disabled={isProcessing || selectedDocuments.length === 0}
                  variant="outline"
                  className="w-full h-12"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={batchShare}
                  disabled={isProcessing || selectedDocuments.length === 0}
                  variant="outline"
                  className="w-full h-12"
                  size="sm"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={batchExport}
                  disabled={isProcessing || selectedDocuments.length === 0}
                  variant="outline"
                  className="w-full h-12"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isProcessing || selectedDocuments.length === 0}
                  variant="destructive"
                  className="w-full h-12"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </motion.div>
            </div>

            {/* Quick Stats */}
            <AnimatePresence>
              {selectedDocuments.length > 0 && (
                <>
                  <Separator />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                  >
                    <StatCard
                      title="Selected"
                      value={selectedStats.total}
                      icon={Folder}
                      colorClass="bg-primary/5 text-primary"
                      borderClass="border-primary/20"
                    />
                    
                    <StatCard
                      title="Verified"
                      value={selectedStats.verified}
                      icon={CheckCircle}
                      colorClass="bg-green-50 text-green-600"
                      borderClass="border-green-200"
                    />
                    
                    <StatCard
                      title="Pending"
                      value={selectedStats.pending}
                      icon={Clock}
                      colorClass="bg-yellow-50 text-yellow-600"
                      borderClass="border-yellow-200"
                    />
                    
                    <StatCard
                      title="Total Size"
                      value={`${selectedStats.totalSize.toFixed(1)}MB`}
                      icon={BarChart3}
                      colorClass="bg-gray-50 text-gray-600"
                      borderClass="border-gray-200"
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <span>Delete Documents</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''}? 
              This action cannot be undone and will permanently remove the documents from the blockchain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={batchDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchOperations;
