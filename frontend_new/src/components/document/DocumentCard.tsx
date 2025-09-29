import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Tag,
  Share,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  User,
  Info,
  Shield,
  File,
  Folder,
  BarChart3,
  Hash,
  Package,
  Image
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay';

// Types and Interfaces
interface DocumentMetadata {
  uploader?: string;
  uploadedAt?: string;
  fileType?: string;
  description?: string;
  [key: string]: any;
}

interface Document {
  id: string;
  name: string;
  hash: string;
  type: string;
  size: number;
  status: 'verified' | 'pending' | 'failed' | 'unknown';
  timestamp: number;
  category?: string;
  description?: string;
  metadata?: DocumentMetadata;
}

interface DocumentCardProps {
  document: Document;
  onShare: (document: Document) => void;
  onVerify: (document: Document) => void;
  onSelect?: (documentId: string) => void;
  isSelected?: boolean;
  className?: string;
}

interface StatusConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onShare, 
  onVerify, 
  onSelect, 
  isSelected = false,
  className
}) => {
  // State
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Get status configuration
  const getStatusConfig = (status: Document['status']): StatusConfig => {
    const configs: Record<Document['status'], StatusConfig> = {
      verified: {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      },
      pending: {
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      },
      failed: {
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      },
      unknown: {
        icon: FileText,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }
    };

    return configs[status] || configs.unknown;
  };

  // Get file type icon
  const getFileTypeIcon = (type: string): React.ReactNode => {
    if (type?.includes('pdf')) return <File className="w-5 h-5 text-red-600 dark:text-red-400" />;
    if (type?.includes('image')) return <Image className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (type?.includes('word') || type?.includes('document')) return <FileText className="w-5 h-5 text-primary" />;
    return <Folder className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  };

  // Handle card selection
  const handleSelect = useCallback((e: React.MouseEvent): void => {
    if (onSelect) {
      onSelect(document.id);
    }
  }, [onSelect, document.id]);

  // Handle details toggle
  const handleToggleDetails = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowDetails(prev => !prev);
  }, []);

  // Handle verify click
  const handleVerify = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    onVerify(document);
  }, [onVerify, document]);

  // Handle share click
  const handleShare = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    onShare(document);
  }, [onShare, document]);

  const statusConfig = getStatusConfig(document.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn("transition-all duration-300", className)}
    >
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-lg transition-all duration-300",
          isSelected && "ring-2 ring-primary bg-primary/5 shadow-lg"
        )}
        onClick={handleSelect}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-muted rounded-lg border shrink-0">
                {getFileTypeIcon(document.type)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold truncate">
                  {document.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <BarChart3 className="w-3 h-3" />
                  <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{document.type || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 shrink-0">
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="p-1 bg-primary rounded-full"
                  >
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Badge className={cn("text-xs font-semibold border", statusConfig.bgColor)}>
                <div className="flex items-center space-x-1">
                  <StatusIcon className={cn("w-3 h-3", statusConfig.color)} />
                  <span className="capitalize">{document.status || 'Unknown'}</span>
                </div>
              </Badge>
            </div>
          </div>

          {/* Document Hash Display */}
          <div className="mb-4">
            <HashDisplay 
              hash={document.hash} 
              label="Document Hash"
              variant="card"
              size="sm"
            />
          </div>

          {/* Metadata */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <span>Uploaded {new Date(document.timestamp).toLocaleDateString()}</span>
            </div>
            
            {document.category && (
              <div className="flex items-center text-sm">
                <Tag className="w-4 h-4 mr-2 text-green-600" />
                <Badge variant="secondary" className="capitalize">
                  {document.category}
                </Badge>
              </div>
            )}
            
            {document.metadata?.uploader && (
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                <code className="text-xs font-mono">
                  {document.metadata.uploader.substring(0, 8)}...
                </code>
              </div>
            )}
            
            {document.description && (
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Expandable Details Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleDetails}
            className="mb-4 h-8 px-2 text-primary hover:text-primary/80"
          >
            {showDetails ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          </Button>

          {/* Expandable Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mb-4 overflow-hidden"
              >
                {/* Full Hash Display */}
                <div>
                  <HashDisplay 
                    hash={document.hash}
                    label="Full Document Hash"
                    showFullHash
                    size="sm"
                  />
                </div>

                {/* Additional Metadata */}
                {document.metadata && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Hash className="w-4 h-4 text-purple-600" />
                        <h5 className="font-semibold">Metadata</h5>
                      </div>
                      <div className="space-y-3 text-sm">
                        {document.metadata.uploader && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-medium">Uploader:</span>
                            </div>
                            <HashDisplay 
                              hash={document.metadata.uploader}
                              variant="compact"
                              showLabel={false}
                              size="sm"
                            />
                          </div>
                        )}
                        
                        {document.metadata.uploadedAt && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Upload Time:</span>
                            <span className="text-muted-foreground">
                              {new Date(document.metadata.uploadedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                        
                        {document.metadata.fileType && (
                          <div className="flex items-center space-x-2">
                            <Folder className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">File Type:</span>
                            <Badge variant="outline" className="text-xs">
                              {document.metadata.fileType}
                            </Badge>
                          </div>
                        )}
                        
                        {document.metadata.description && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Info className="w-4 h-4 text-primary" />
                              <span className="font-medium">Description:</span>
                            </div>
                            <Card>
                              <CardContent className="p-3">
                                <p className="text-muted-foreground text-sm">
                                  {document.metadata.description}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Document Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">File Size</span>
                      </div>
                      <p className="text-lg font-bold">
                        {(document.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className={cn("border", statusConfig.bgColor)}>
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                        <span className={cn("text-xs font-medium", statusConfig.color)}>Status</span>
                      </div>
                      <p className="text-lg font-bold capitalize">
                        {document.status || 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleVerify}
              size="sm" 
              variant="default"
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify
            </Button>
            
            <Button 
              onClick={handleShare}
              size="sm" 
              variant="outline"
              className="flex-1"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DocumentCard;
