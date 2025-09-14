import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Upload,
  Shield,
  AlertTriangle,
  Eye,
  XCircle,
  Share,
  FileCheck,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Types and Interfaces
interface Activity {
  id?: string;
  type: 'upload' | 'verification' | 'issue' | 'share' | 'download' | 'delete';
  status: 'verified' | 'pending' | 'completed' | 'failed' | 'error' | 'processing';
  message: string;
  timestamp: number;
  hash?: string;
  documentName?: string;
  user?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
  emptyMessage?: string;
  maxHeight?: string;
}

interface IconConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface StatusConfig {
  className: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shadow: string;
}

interface ActivitySkeletonProps {
  index: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = [], 
  loading = false, 
  emptyMessage, 
  maxHeight = '24rem' 
}) => {
  // Loading skeleton component
  const ActivitySkeleton: React.FC<ActivitySkeletonProps> = ({ index }) => (
    <div key={`loading-${index}`} className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Get activity icon based on type and status
  const getActivityIcon = (activity: Activity): IconConfig => {
    const { type, status } = activity;
    
    const iconConfigs: Record<string, IconConfig | Record<string, IconConfig>> = {
      upload: {
        icon: Upload,
        bgColor: 'bg-primary/10',
        textColor: 'text-primary',
        borderColor: 'border-primary/20'
      },
      verification: {
        verified: {
          icon: CheckCircle,
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800'
        },
        pending: {
          icon: Clock,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        },
        failed: {
          icon: XCircle,
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800'
        },
        default: {
          icon: Eye,
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
          borderColor: 'border-primary/20'
        }
      },
      issue: {
        icon: FileCheck,
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800'
      },
      share: {
        icon: Share,
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800'
      },
      download: {
        icon: FileText,
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800'
      },
      delete: {
        icon: XCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800'
      }
    };

    // Handle verification with status
    if (type === 'verification') {
      const verificationConfigs = iconConfigs.verification as Record<string, IconConfig>;
      return verificationConfigs[status] || verificationConfigs.default;
    }
    
    return (iconConfigs[type] as IconConfig) || {
      icon: FileText,
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-600 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700'
    };
  };

  // Get status badge configuration
  const getStatusBadge = (status: Activity['status']): StatusConfig => {
    const statusConfigs: Record<Activity['status'], StatusConfig> = {
      verified: {
        className: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
        icon: CheckCircle,
        shadow: 'shadow-green-200 dark:shadow-green-900'
      },
      pending: {
        className: 'bg-yellow-600 text-white border-yellow-700 hover:bg-yellow-700',
        icon: Clock,
        shadow: 'shadow-yellow-200 dark:shadow-yellow-900'
      },
      completed: {
        className: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
        icon: CheckCircle,
        shadow: 'shadow-green-200 dark:shadow-green-900'
      },
      failed: {
        className: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
        icon: XCircle,
        shadow: 'shadow-red-200 dark:shadow-red-900'
      },
      error: {
        className: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
        icon: AlertTriangle,
        shadow: 'shadow-red-200 dark:shadow-red-900'
      },
      processing: {
        className: 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700',
        icon: Clock,
        shadow: 'shadow-blue-200 dark:shadow-blue-900'
      }
    };

    return statusConfigs[status] || {
      className: 'bg-gray-600 text-white border-gray-700 hover:bg-gray-700',
      icon: FileText,
      shadow: 'shadow-gray-200 dark:shadow-gray-900'
    };
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return activityTime.toLocaleDateString();
  };

  // Handle hash copy
  const handleHashCopy = async (hash: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Hash Copied', {
        description: 'Document hash copied to clipboard',
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy hash to clipboard',
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ActivitySkeleton key={i} index={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No activity yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {emptyMessage || "Upload and verify documents to see activity here"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span>Recent Activity</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {activities.length} {activities.length === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const uniqueKey = `activity-${activity.id || index}-${activity.timestamp || Date.now()}-${activity.type}-${Math.random().toString(36).substr(2, 9)}`;
              const iconConfig = getActivityIcon(activity);
              const statusConfig = getStatusBadge(activity.status);
              const Icon = iconConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={uniqueKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group"
                >
                  <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {/* Activity Icon */}
                        <div className={`p-2 rounded-full ${iconConfig.bgColor} ${iconConfig.textColor} border ${iconConfig.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                            {activity.message}
                          </p>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                            {activity.hash && (
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded border hover:text-primary hover:border-primary transition-colors cursor-pointer flex items-center space-x-1"
                                title="Click to copy hash"
                                onClick={() => handleHashCopy(activity.hash!)}
                              >
                                <Copy className="w-3 h-3" />
                                <span>
                                  {activity.hash.length > 8 
                                    ? `${activity.hash.substring(0, 6)}...${activity.hash.substring(activity.hash.length - 4)}`
                                    : activity.hash
                                  }
                                </span>
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge 
                          className={`flex items-center space-x-1 transition-all duration-300 ${statusConfig.className} ${statusConfig.shadow}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}</span>
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        {activities.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Showing {Math.min(activities.length, 50)} most recent activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
