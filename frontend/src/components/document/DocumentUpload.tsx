import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Trash2,
  Folder,
  BarChart3,
  File,
  Calendar,
  Eye,
  EyeOff,
  Clock,
  Lock,
  RefreshCw,
  Inbox,
  Image,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import HashDisplay from '@/components/common/HashDisplay';
import QRCodeGenerator from '@/components/verification/QRCodeGenerator';
import { generateDocumentHash } from '@/services/hashService';
import { useWeb3 } from '@/context/Web3Context';
import DocumentService from '@/services/DocumentService';
import { useDocumentStats } from '@/context/DocumentStatsContext';

// Types and Interfaces
interface FileMetadata {
  description: string;
  category: string;
  tags: string;
  isPrivate: boolean; // This was in your original interface, but not in the form. Added to form.
  expirationDate: string;
  uploader?: string;
  timestamp?: number;
  fileSize?: number;
  fileType?: string;
  status?: string;
}

interface UploadFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string | null;
  uploaded: boolean;
  uploadError: string | null;
  metadata: FileMetadata | null;
  uploadedAt?: number;
}

interface UploadProgress {
  [fileId: string]: number;
}

interface FileStatus {
  color: string;
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const DocumentUpload: React.FC = () => {
  // State
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [metadata, setMetadata] = useState<FileMetadata>({
    description: '',
    category: 'document',
    tags: '',
    isPrivate: false,
    expirationDate: ''
  });
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  // Context
  const { isConnected, account, provider, signer } = useWeb3();
  const { refreshStats } = useDocumentStats();

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error: any) => {
          toast.error(`Error with ${file.name}`, {
            description: error.message,
          });
        });
      });
    }

    if (acceptedFiles.length > 0) {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        size: file.size,
        type: file.type,
        hash: null,
        uploaded: false,
        uploadError: null,
        metadata: null
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      toast.success('Files Added', {
        description: `${acceptedFiles.length} file(s) added to the queue.`,
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
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    multiple: true
  });

  // Read file content
  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file.slice(0, 1024)); // Read only first 1KB for content
    });
  }, []);

  // Upload documents
  const uploadDocuments = useCallback(async (): Promise<void> => {
    if (!isConnected || !provider || !signer) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    const pendingFiles = files.filter(f => !f.uploaded);
    if (pendingFiles.length === 0) {
      toast.info('No Files to Upload', {
        description: 'Please add files to the queue first.',
      });
      return;
    }

    setUploading(true);
    toast.info('Processing Documents', {
      description: `Processing ${pendingFiles.length} document(s)...`,
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
          
          // Use the DocumentService to store the document
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

          toast.success('File Processed', {
            description: `"${fileObj.name}" is ready for verification.`,
          });

        } catch (fileError) {
          console.error(`Error processing ${fileObj.name}:`, fileError);
          const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
          
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, uploadError: errorMessage }
              : f
          ));
          
          toast.error('Upload Failed', {
            description: `Failed to process "${fileObj.name}"`,
          });
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileObj.id];
            return newProgress;
          });
        }
      }

      const successCount = files.filter(f => f.uploaded).length;
      if (successCount > 0) {
        toast.success('Upload Complete', {
          description: `${successCount} document(s) processed.`,
        });
        refreshStats(); // Refresh dashboard stats
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Upload Failed', {
        description: 'A network or contract error occurred.',
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000); // Clear progress bars after 2s
    }
  }, [isConnected, files, metadata, account, provider, signer, refreshStats, readFileContent]);

  // Remove file
  const removeFile = useCallback((fileId: string): void => {
    const fileName = files.find(f => f.id === fileId)?.name;
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    if (expandedFile === fileId) {
      setExpandedFile(null);
    }
    toast.info('File Removed', {
      description: `"${fileName}" removed from queue.`,
    });
  }, [files, expandedFile]);

  // Clear all files
  const clearAll = useCallback((): void => {
    const fileCount = files.length;
    if (fileCount === 0) return;
    setFiles([]);
    setUploadProgress({});
    setExpandedFile(null);
    toast.info('Queue Cleared', {
      description: `Cleared ${fileCount} file(s).`,
    });
  }, [files.length]);

  // Toggle file details
  const toggleFileDetails = useCallback((fileId: string): void => {
    setExpandedFile(prev => (prev === fileId ? null : fileId));
  }, []);

  // Get file icon
  const getFileIcon = useCallback((file: UploadFile): React.ReactElement => {
    if (file.type?.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (file.type?.includes('image')) return <Image className="w-6 h-6 text-blue-500" />;
    if (file.type?.includes('word') || file.type?.includes('document')) return <FileText className="w-6 h-6 text-primary" />;
    return <File className="w-6 h-6 text-muted-foreground" />;
  }, []);

  // Get file status
  const getFileStatus = useCallback((file: UploadFile): FileStatus => {
    if (file.uploaded) return { color: 'text-green-600', text: 'Processed (Pending Verification)', icon: CheckCircle };
    if (file.uploadError) return { color: 'text-red-600', text: `Failed: ${file.uploadError}`, icon: XCircle };
    if (uploadProgress[file.id] !== undefined) return { color: 'text-blue-600', text: 'Processing...', icon: RefreshCw };
    return { color: 'text-muted-foreground', text: 'Ready to Process', icon: Clock };
  }, [uploadProgress]);

  const pendingFileCount = files.filter(f => !f.uploaded).length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-left">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-primary">
            Upload Documents
          </h1>
          <p className="text-lg text-accent-foreground max-w-3xl">
            Add files and document details, then process them to create a secure, verifiable record on the blockchain.
          </p>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Wallet Connection Required</AlertTitle>
              <AlertDescription>
                Please connect your wallet to upload and process documents.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Step 1: Upload & Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Step 1: Add Document Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 h-full min-h-[300px]",
                isDragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ y: isDragActive ? -5 : 0 }}
                className="flex flex-col items-center"
              >
                <Upload className={cn(
                  "mx-auto h-12 w-12 mb-4",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )} />
                {isDragActive ? (
                  <p className="text-xl font-semibold text-primary">
                    Drop files here
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-semibold mb-2">
                      Drag & drop files or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Max 10MB each, up to 10 files.
                    </p>
                  </>
                )}
              </motion.div>
            </div>

            {/* Metadata Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the document(s)..."
                  className="resize-none mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={metadata.category}
                  onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="identity">Identity</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="important, confidential..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={metadata.expirationDate}
                  onChange={(e) => setMetadata(prev => ({ ...prev, expirationDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Review & Process */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Step 2: Review & Process Queue ({files.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {files.map((fileObj) => {
                    const status = getFileStatus(fileObj);
                    const isExpanded = expandedFile === fileObj.id;
                    return (
                      <div key={fileObj.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center p-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(fileObj)}
                          </div>
                          <div className="flex-grow min-w-0 mx-4">
                            <p className="font-semibold truncate" title={fileObj.name}>
                              {fileObj.name}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <status.icon className={cn("w-3.5 h-3.5", status.color, status.icon === RefreshCw && "animate-spin")} />
                              <span className={status.color}>{status.text}</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{(fileObj.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            {uploadProgress[fileObj.id] !== undefined && (
                              <Progress value={uploadProgress[fileObj.id]} className="h-1 mt-2" />
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-4 space-x-2">
                            {fileObj.hash && (
                              <Button
                                onClick={() => toggleFileDetails(fileObj.id)}
                                variant="outline"
                                size="sm"
                              >
                                {isExpanded ? 'Hide' : 'Details'}
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 ml-1" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                )}
                              </Button>
                            )}
                            <Button
                              onClick={() => removeFile(fileObj.id)}
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-red-600"
                              disabled={uploading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Expandable Section */}
                        <AnimatePresence>
                          {isExpanded && fileObj.hash && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="p-4 bg-muted/50 border-t space-y-4">
                                <HashDisplay 
                                  hash={fileObj.hash}
                                  label="Document Hash"
                                  variant="card"
                                />
                                <QRCodeGenerator 
                                  hash={fileObj.hash} 
                                  metadata={fileObj.metadata || undefined}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Button 
                    onClick={clearAll} 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-600"
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button 
                    onClick={uploadDocuments} 
                    disabled={!isConnected || pendingFileCount === 0 || uploading}
                    size="lg"
                    className='text-accent-foreground'
                  >
                    {uploading ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Inbox className="w-5 h-5 mr-2" />
                    )}
                    {uploading 
                      ? "Processing..." 
                      : `Process ${pendingFileCount} Document${pendingFileCount > 1 ? 's' : ''}`
                    }
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;