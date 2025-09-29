import React from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner, { SkeletonLoader } from '../common/LoadingSpinner';

const ActivityFeed = ({ activities = [], loading = false, emptyMessage, maxHeight = '24rem' }) => {
  // Loading skeleton component
  const ActivitySkeleton = ({ index }) => (
    <div key={`loading-${index}`} className="animate-pulse">
      <div className="flex items-center space-x-3 p-4 bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))]">
        <div className="w-10 h-10 bg-[rgb(var(--color-primary)/0.2)] rounded-full"></div>
        <div className="flex-1 space-y-2">
          <SkeletonLoader height="16px" width="75%" />
          <SkeletonLoader height="12px" width="50%" />
        </div>
        <SkeletonLoader height="24px" width="64px" variant="rectangular" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
            <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <ActivitySkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
            <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Activity</h3>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[rgb(var(--surface-secondary))] rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgb(var(--border-primary))]">
            <DocumentIcon className="w-8 h-8 text-[rgb(var(--text-quaternary))]" />
          </div>
          <p className="text-[rgb(var(--text-primary))] font-medium mb-2">No activity yet</p>
          <p className="text-sm text-[rgb(var(--text-secondary))] max-w-xs mx-auto">
            {emptyMessage || "Upload and verify documents to see activity here"}
          </p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (activity) => {
    const { type, status } = activity;
    
    // Define icon configurations with colors
    const iconConfigs = {
      upload: {
        icon: CloudArrowUpIcon,
        bgColor: 'bg-[rgb(var(--color-primary)/0.1)]',
        textColor: 'text-[rgb(var(--color-primary))]',
        borderColor: 'border-[rgb(var(--color-primary)/0.3)]'
      },
      verification: {
        verified: {
          icon: CheckCircleIcon,
          bgColor: 'bg-[rgb(var(--color-success)/0.1)]',
          textColor: 'text-[rgb(var(--color-success))]',
          borderColor: 'border-[rgb(var(--color-success)/0.3)]'
        },
        pending: {
          icon: ClockIcon,
          bgColor: 'bg-[rgb(var(--color-warning)/0.1)]',
          textColor: 'text-[rgb(var(--color-warning))]',
          borderColor: 'border-[rgb(var(--color-warning)/0.3)]'
        },
        failed: {
          icon: XCircleIcon,
          bgColor: 'bg-[rgb(var(--color-error)/0.1)]',
          textColor: 'text-[rgb(var(--color-error))]',
          borderColor: 'border-[rgb(var(--color-error)/0.3)]'
        },
        default: {
          icon: EyeIcon,
          bgColor: 'bg-[rgb(var(--color-primary)/0.1)]',
          textColor: 'text-[rgb(var(--color-primary))]',
          borderColor: 'border-[rgb(var(--color-primary)/0.3)]'
        }
      },
      issue: {
        icon: DocumentCheckIcon,
        bgColor: 'bg-[rgb(var(--color-success)/0.1)]',
        textColor: 'text-[rgb(var(--color-success))]',
        borderColor: 'border-[rgb(var(--color-success)/0.3)]'
      },
      share: {
        icon: ArrowUpTrayIcon,
        bgColor: 'bg-[rgb(var(--text-quaternary)/0.1)]',
        textColor: 'text-[rgb(var(--text-quaternary))]',
        borderColor: 'border-[rgb(var(--text-quaternary)/0.3)]'
      }
    };

    // Get icon config based on type and status
    if (type === 'verification') {
      return iconConfigs.verification[status] || iconConfigs.verification.default;
    }
    
    return iconConfigs[type] || {
      icon: DocumentIcon,
      bgColor: 'bg-[rgb(var(--text-quaternary)/0.1)]',
      textColor: 'text-[rgb(var(--text-quaternary))]',
      borderColor: 'border-[rgb(var(--text-quaternary)/0.3)]'
    };
  };

  const getStatusBadge = (status) => {
    const statusConfigs = {
      verified: {
        className: 'bg-[rgb(var(--color-success))] text-white border-[rgb(var(--color-success-hover))]',
        icon: <CheckCircleIcon className="w-3 h-3" />,
        shadow: 'shadow-[rgb(var(--color-success)/0.3)]'
      },
      pending: {
        className: 'bg-[rgb(var(--color-warning))] text-white border-[rgb(var(--color-warning))]',
        icon: <ClockIcon className="w-3 h-3" />,
        shadow: 'shadow-[rgb(var(--color-warning)/0.3)]'
      },
      completed: {
        className: 'bg-[rgb(var(--color-success))] text-white border-[rgb(var(--color-success-hover))]',
        icon: <CheckCircleIcon className="w-3 h-3" />,
        shadow: 'shadow-[rgb(var(--color-success)/0.3)]'
      },
      failed: {
        className: 'bg-[rgb(var(--color-error))] text-white border-[rgb(var(--color-error))]',
        icon: <XCircleIcon className="w-3 h-3" />,
        shadow: 'shadow-[rgb(var(--color-error)/0.3)]'
      },
      error: {
        className: 'bg-[rgb(var(--color-error))] text-white border-[rgb(var(--color-error))]',
        icon: <ExclamationTriangleIcon className="w-3 h-3" />,
        shadow: 'shadow-[rgb(var(--color-error)/0.3)]'
      }
    };

    const config = statusConfigs[status] || {
      className: 'bg-[rgb(var(--text-quaternary))] text-[rgb(var(--text-primary))] border-[rgb(var(--border-primary))]',
      icon: <DocumentIcon className="w-3 h-3" />,
      shadow: 'shadow-none'
    };

    return config;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
            <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Recent Activity</h3>
        </div>
        <div className="text-xs text-[rgb(var(--text-secondary))] bg-[rgb(var(--surface-secondary))] px-3 py-1 rounded-full border border-[rgb(var(--border-primary))]">
          {activities.length} {activities.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      <div 
        className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--color-primary))] scrollbar-track-[rgb(var(--surface-secondary))]"
        style={{ maxHeight }}
      >
        {activities.map((activity, index) => {
          const uniqueKey = `activity-${activity.id || index}-${activity.timestamp || Date.now()}-${activity.type}-${Math.random().toString(36).substr(2, 9)}`;
          const iconConfig = getActivityIcon(activity);
          const statusConfig = getStatusBadge(activity.status);
          const Icon = iconConfig.icon;

          return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="group flex items-center space-x-3 p-4 bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.5)] hover:bg-[rgb(var(--surface-hover))] transition-all duration-300"
            >
              {/* Activity Icon */}
              <div className={`p-2 rounded-full ${iconConfig.bgColor} ${iconConfig.textColor} border ${iconConfig.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--text-primary))] mb-1 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-3">
                  <p className="text-xs text-[rgb(var(--text-secondary))] flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </p>
                  {activity.hash && (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-[rgb(var(--text-quaternary))] font-mono bg-[rgb(var(--surface-primary))] px-2 py-1 rounded border border-[rgb(var(--border-primary))] hover:text-[rgb(var(--color-primary))] hover:border-[rgb(var(--color-primary))] transition-colors cursor-pointer"
                      title="Click to copy hash"
                      onClick={() => {
                        navigator.clipboard.writeText(activity.hash);
                        // You could add a toast here
                      }}
                    >
                      {activity.hash.length > 8 
                        ? `${activity.hash.substring(0, 6)}...${activity.hash.substring(activity.hash.length - 4)}`
                        : activity.hash
                      }
                    </motion.span>
                  )}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 shadow-sm ${statusConfig.className} ${statusConfig.shadow}`}>
                {statusConfig.icon}
                <span>{activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Footer */}
      {activities.length > 5 && (
        <div className="mt-4 pt-4 border-t border-[rgb(var(--border-primary))]">
          <p className="text-xs text-center text-[rgb(var(--text-secondary))]">
            Showing {Math.min(activities.length, 50)} most recent activities
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
