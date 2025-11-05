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
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

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
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
  emptyMessage?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = [], 
  loading = false, 
  emptyMessage = "No activity yet"
}) => {
  // Simplified icon mapping
  const getActivityConfig = (activity: Activity) => {
    const { type, status } = activity;

    const configs = {
      issued: { icon: FileCheck, color: 'text-primary', bg: 'bg-primary/10' },
      verified: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
      revoked: { icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
      upload: { icon: Upload, color: 'text-primary', bg: 'bg-primary/10' },
      share: { icon: Share, color: 'text-blue-600', bg: 'bg-blue-500/10' },
      download: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-500/10' },
      delete: { icon: XCircle, color: 'text-error', bg: 'bg-error/10' }
    };

    return configs[type] || { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  // Simplified status colors
  const getStatusColor = (status: string) => {
    const colors = {
      verified: 'bg-success/20 text-success border-success/30',
      pending: 'bg-warning/20 text-warning border-warning/30',
      completed: 'bg-success/20 text-success border-success/30',
      failed: 'bg-error/20 text-error border-error/30',
      error: 'bg-error/20 text-error border-error/30',
      processing: 'bg-primary/20 text-primary border-primary/30',
      active: 'bg-secondary text-secondary-foreground border-secondary'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground border-muted';
  };

  // Format time
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

  // Handle hash copy
  const handleHashCopy = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Hash copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy hash');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="bg-surface-primary border">
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

  // Empty state
  if (activities.length === 0) {
    return (
      <Card className="bg-surface-primary border">
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-muted-foreground mb-2">No activity yet</h3>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-primary border">
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 px-1">
            {activities.map((activity, index) => {
              const { icon: Icon, color, bg } = getActivityConfig(activity);
              const statusColor = getStatusColor(activity.status);
              const documentHash = activity.hash || activity.documentHash;

              return (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer">
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
                        
                        {/* Status */}
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-normal border ${statusColor}`}
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
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            {activity.documentType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Separator */}
                  {index < activities.length - 1 && (
                    <div className="mx-3 border-b border-border" />
                  )}
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