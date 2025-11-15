import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Upload,
  XCircle,
  Share,
  FileCheck,
  Copy,
  User,
  Inbox,
  UserCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, badgeVariants } from '@/components/ui/badge'; 
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import HashDisplay from '../common/HashDisplay'; // <-- ADDED
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip'; // <-- ADDED

// Simplified Types
interface Activity {
  id?: string;
  type: 'issued' | 'verified' | 'revoked' | 'upload' | 'share' | 'download' | 'delete';
  status: 'verified' | 'pending' | 'completed' | 'failed' | 'error' | 'processing' | 'active';
  timestamp: number;
  hash?: string;
  title?: string;
  recipientName?: string;
  documentType?: string;
  documentHash?: string;
  verifiedBy?: string | null; // <-- ADDED
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
  emptyMessage?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = [], 
  loading = false, 
  emptyMessage = "Your recent activities will appear here."
}) => {

  const getActivityConfig = (activity: Activity) => {
    const { type } = activity;

    const configs = {
      issued: { icon: FileCheck, color: 'text-primary', bg: 'bg-primary/10' },
      verified: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
      revoked: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
      upload: { icon: Upload, color: 'text-primary', bg: 'bg-primary/10' },
      share: { icon: Share, color: 'text-accent-foreground', bg: 'bg-accent/10' },
      download: { icon: FileText, color: 'text-accent-foreground', bg: 'bg-accent/10' },
      delete: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' }
    };

    return configs[type] || { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    const statusLower = status.toLowerCase();

    if (statusLower === 'verified' || statusLower === 'completed' || statusLower === 'active') {
      return "default"; 
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return "secondary"; 
    }
    if (statusLower === 'failed' || statusLower === 'error' || statusLower === 'revoked') {
      return "destructive"; 
    }
    
    return 'outline'; 
  };
  
  const getDocumentTypeConfig = (docType?: string): string => {
    if (!docType) return "bg-muted text-muted-foreground border-border";

    switch (docType.toLowerCase()) {
      case 'certificate':
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case 'contract':
        return "bg-destructive/10 text-destructive border-destructive/20";
      case 'identity':
        return "bg-primary/10 text-primary border-primary/20";
      case 'financial':
        return "bg-primary/10 text-primary border-primary/20";
      case 'legal':
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case 'medical':
        return "bg-destructive/10 text-destructive border-destructive/20";
      case 'document':
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return activityTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleHashCopy = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Hash copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy hash');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg text-foreground mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-2">
            {activities.map((activity, index) => {
              const { icon: Icon, color, bg } = getActivityConfig(activity);
              const documentHash = activity.hash || activity.documentHash;

              return (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Title and Recipient */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {activity.title || 'Document Activity'}
                        </h4>
                        {activity.recipientName && (
                          <p className="text-xs text-muted-foreground flex items-center space-x-1 mt-0.5">
                            <User className="w-3 h-3" />
                            <span>{activity.recipientName}</span>
                          </p>
                        )}
                      </div>
                      
                      <Badge 
                        variant={getStatusVariant(activity.status)}
                        className="text-xs font-normal capitalize"
                      >
                        {activity.status}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(activity.timestamp)}</span>
                      </div>

                      {documentHash && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHashCopy(documentHash);
                          }}
                          className="flex items-center space-x-1 hover:text-foreground transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span className="font-mono">
                            {documentHash.substring(0, 6)}...
                          </span>
                        </button>
                      )}

                      {activity.documentType && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            getDocumentTypeConfig(activity.documentType)
                          )}
                        >
                          {activity.documentType}
                        </Badge>
                      )}
                    </div>
                    
                    {/* --- ADDED: Verified By Display --- */}
                    {activity.verifiedBy && activity.status === 'verified' && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-1">
                        <UserCheck className="w-3 h-3 text-primary" />
                        <span className="text-primary font-medium">Verified by:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-default">
                                <HashDisplay 
                                    hash={activity.verifiedBy} 
                                    size="sm" 
                                    variant="compact" 
                                /> 
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verifier: {activity.verifiedBy}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    {/* --- END: Verified By Display --- */}

                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;