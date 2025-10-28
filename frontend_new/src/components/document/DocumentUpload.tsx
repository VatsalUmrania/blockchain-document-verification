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
  Wallet,
  Trash2,
  Folder,
  BarChart3,
  File,
  Package,
  Tag,
  Calendar,
  Eye,
  EyeOff,
  Clock,
  Lock,
  RefreshCw,
  Inbox,
  Trophy,
  CreditCard,
  Scale,
  Heart,
  ClipboardList,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay';
import QRCodeGenerator from '../verification/QRCodeGenerator';
import { generateDocumentHash } from '../../services/hashService';
import { useWeb3 } from '../../context/Web3Context';
import DocumentService from '../../services/DocumentService';
import { useDocumentStats } from '../../context/DocumentStatsContext';

// Types and Interfaces
interface FileMetadata {
  description: string;
  category: string;
  tags: string;
  isPrivate: boolean;
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

interface CategoryOption {
  value: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface UploadProgress {
  [fileId: string]: number;
}

interface QRCodeState {
  [fileId: string]: boolean;
}

interface FileStatus {
  color: string;
  text: string;
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
  const [showQRCode, setShowQRCode] = useState<QRCodeState>({});

  // Context
  const { isConnected, account, provider, signer } = useWeb3();
  const { refreshStats } = useDocumentStats();

  // Category options with icons
  const categoryOptions: CategoryOption[] = [
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'certificate', label: 'Certificate', icon: Trophy },
    { value: 'contract', label: 'Contract', icon: File },
    { value: 'identity', label: 'Identity', icon: CreditCard },
    { value: 'financial', label: 'Financial', icon: CreditCard },
    { value: 'legal', label: 'Legal', icon: Scale },
    { value: 'medical', label: 'Medical', icon: Heart },
    { value: 'other', label: 'Other', icon: ClipboardList }
  ];

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error: any) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error('File Too Large', {
                description: `File "${file.name}" is too large. Maximum size is 10MB.`,
              });
              break;
            case 'file-invalid-type':
              toast.error('Invalid File Type', {
                description: `File "${file.name}" has invalid type. Only PDF, DOC, DOCX, and images are allowed.`,
              });
              break;
            case 'too-many-files':
              toast.error('Too Many Files', {
                description: 'Please select fewer files.',
              });
              break;
            default:
              toast.error('File Error', {
                description: `Error with file "${file.name}": ${error.message}`,
              });
          }
        });
      });
    }

    if (acceptedFiles.length > 0) {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
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
      toast.success('Files Selected', {
        description: `${acceptedFiles.length} file(s) selected successfully`,
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
      reader.readAsText(file.slice(0, 1024));
    });
  }, []);

  // Upload documents
  const uploadDocuments = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    if (files.length === 0) {
      toast.error('No Files', {
        description: 'Please select files to upload',
      });
      return;
    }

    const pendingFiles = files.filter(f => !f.uploaded);
    if (pendingFiles.length === 0) {
      toast.info('All Uploaded', {
        description: 'All files are already uploaded',
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

          toast.success('File Uploaded', {
            description: `"${fileObj.name}" uploaded as pending verification`,
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
          description: `${successCount} document(s) ready for verification.`,
        });
        
        // Refresh Dashboard stats immediately after upload
        refreshStats();
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Upload Failed', {
        description: 'Failed to process documents',
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000);
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
    setShowQRCode(prev => {
      const newQR = { ...prev };
      delete newQR[fileId];
      return newQR;
    });
    toast.info('File Removed', {
      description: `"${fileName}" removed from upload queue`,
    });
  }, [files]);

  // Clear all files
  const clearAll = useCallback((): void => {
    const fileCount = files.length;
    setFiles([]);
    setUploadProgress({});
    setShowQRCode({});
    toast.info('Queue Cleared', {
      description: `Cleared ${fileCount} file(s) from upload queue`,
    });
  }, [files.length]);

  // Toggle QR code
  const toggleQRCode = useCallback((fileId: string): void => {
    setShowQRCode(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  }, []);

  // Get file icon
  const getFileIcon = useCallback((file: UploadFile): React.ReactNode => {
    if (file.uploaded) return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (file.uploadError) return <XCircle className="w-8 h-8 text-red-600" />;
    
    // File type icons
    if (file.type?.includes('pdf')) return <File className="w-8 h-8 text-red-600" />;
    if (file.type?.includes('image')) return <Image className="w-8 h-8 text-green-600" />;
    if (file.type?.includes('word') || file.type?.includes('document')) return <FileText className="w-8 h-8 text-primary" />;
    return <Folder className="w-8 h-8 text-purple-600" />;
  }, []);

  // Get file status
  const getFileStatus = useCallback((file: UploadFile): FileStatus => {
    if (file.uploaded) return { color: 'text-green-600', text: 'Uploaded (Pending Verification)' };
    if (file.uploadError) return { color: 'text-red-600', text: `Upload Failed: ${file.uploadError}` };
    return { color: 'text-muted-foreground', text: 'Ready to Upload' };
  }, []);

  // Get current category icon
  const getCurrentCategoryIcon = useCallback((): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
    const category = categoryOptions.find(cat => cat.value === metadata.category);
    return category ? category.icon : FileText;
  }, [metadata.category, categoryOptions]);

  const CurrentCategoryIcon = getCurrentCategoryIcon();

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
            <div className="p-3 bg-primary/20 rounded-full border border-primary/30">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Upload Documents
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your documents securely with cryptographic hashing. Documents will be ready for verification once processed.
          </p>
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Wallet Connection Required</p>
                  <p className="text-sm">
                    Please connect your MetaMask wallet to upload and track documents.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Connected Account Info */}
        {isConnected && account && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold text-green-600">Wallet Connected</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <Wallet className="w-4 h-4" />
                    <span>Connected to:</span>
                    <code className="font-mono text-xs bg-green-100 dark:bg-green-900/40 p-1 rounded">
                      {account}
                    </code>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <span>Document Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div
              {...getRootProps()}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
                isDragActive 
                  ? "border-primary bg-primary/10 scale-105" 
                  : "border-border hover:border-primary hover:bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ 
                  y: isDragActive ? -5 : 0,
                  scale: isDragActive ? 1.05 : 1 
                }}
                transition={{ duration: 0.2 }}
              >
                <Upload className={cn(
                  "mx-auto h-16 w-16 mb-4",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )} />
                
                {isDragActive ? (
                  <div>
                    <p className="text-xl font-semibold text-primary mb-2">
                      Drop your files here!
                    </p>
                    <p className="text-primary">
                      Release to add them to the upload queue
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-semibold mb-2">
                      Drag & drop files here, or click to browse
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Supports PDF, DOC, DOCX, Images, and Text files • Max 10MB per file • Up to 10 files
                    </p>
                    <Button className="inline-flex">
                      <Folder className="w-5 h-5 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Metadata Form */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Document Metadata</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={metadata.description}
                      onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the document..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <CurrentCategoryIcon className="w-4 h-4" />
                      <span>Category</span>
                    </Label>
                    <Select
                      value={metadata.category}
                      onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                      type="text"
                      value={metadata.tags}
                      onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="important, confidential, archive..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="private"
                      checked={metadata.isPrivate}
                      onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, isPrivate: checked === true }))}
                    />
                    <Label htmlFor="private" className="flex items-center space-x-1">
                      <Lock className="w-4 h-4" />
                      <span>Mark as private</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <Label>Expiration date:</Label>
                    <Input
                      type="date"
                      value={metadata.expirationDate}
                      onChange={(e) => setMetadata(prev => ({ ...prev, expirationDate: e.target.value }))}
                      className="w-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <span>Upload Queue ({files.length} files)</span>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={clearAll} 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                      <Button 
                        onClick={uploadDocuments} 
                        disabled={!isConnected || files.every(f => f.uploaded) || uploading}
                        className="min-w-[200px]"
                        size="lg"
                      >
                        {!isConnected ? (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Connect Wallet First
                          </>
                        ) : uploading ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Inbox className="w-5 h-5 mr-2" />
                            Process {files.filter(f => !f.uploaded).length} Document{files.filter(f => !f.uploaded).length > 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {files.map((fileObj, index) => {
                    const status = getFileStatus(fileObj);
                    return (
                      <motion.div
                        key={fileObj.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={cn(
                          "transition-all duration-300",
                          fileObj.uploaded 
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" 
                            : fileObj.uploadError
                              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                              : "hover:border-primary/30"
                        )}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className="flex-shrink-0 p-2 bg-card rounded-lg border">
                                  {getFileIcon(fileObj)}
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-semibold truncate">
                                      {fileObj.name}
                                    </h4>
                                    <Badge className={cn(
                                      "text-xs",
                                      fileObj.uploaded ? "bg-green-100 text-green-700 border-green-200" :
                                      fileObj.uploadError ? "bg-red-100 text-red-700 border-red-200" :
                                      "bg-muted"
                                    )}>
                                      {status.text}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center space-x-1">
                                      <BarChart3 className="w-3 h-3" />
                                      <span>{(fileObj.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <span>{fileObj.type || 'Unknown'}</span>
                                    {fileObj.uploadedAt && (
                                      <span>{new Date(fileObj.uploadedAt).toLocaleString()}</span>
                                    )}
                                  </div>

                                  {/* Progress Bar */}
                                  {uploadProgress[fileObj.id] !== undefined && (
                                    <div className="mb-4 space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Processing document...</span>
                                        <span>{uploadProgress[fileObj.id]}%</span>
                                      </div>
                                      <Progress value={uploadProgress[fileObj.id]} className="h-2" />
                                    </div>
                                  )}

                                  {/* Hash Display */}
                                  {fileObj.hash && (
                                    <div className="mt-4 space-y-3">
                                      <HashDisplay 
                                        hash={fileObj.hash}
                                        label="Document Hash (Ready for Verification)"
                                        variant="card"
                                        size="sm"
                                      />
                                      <Alert className="border-primary/20 bg-primary/5">
                                        <Info className="h-4 w-4 text-primary" />
                                        <AlertDescription className="text-xs text-primary">
                                          Use this hash in the Verification Portal to verify document authenticity
                                        </AlertDescription>
                                      </Alert>
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
                                          metadata={fileObj.metadata || undefined}
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
                                    variant="outline"
                                    size="sm"
                                  >
                                    {showQRCode[fileObj.id] ? (
                                      <EyeOff className="w-4 h-4 mr-2" />
                                    ) : (
                                      <Eye className="w-4 h-4 mr-2" />
                                    )}
                                    {showQRCode[fileObj.id] ? 'Hide QR' : 'Show QR'}
                                  </Button>
                                )}
                                
                                <Button
                                  onClick={() => removeFile(fileObj.id)}
                                  variant="destructive"
                                  size="sm"
                                  disabled={uploading}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                  <Separator />

                  {/* Upload Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="text-center p-4 bg-primary/5 border-primary/20">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-primary mb-2">{files.length}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>Total Files</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="text-center p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {files.filter(f => f.uploaded).length}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Processed</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                          {files.filter(f => !f.uploaded && !f.uploadError).length}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                          {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)}MB
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>Total Size</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;
