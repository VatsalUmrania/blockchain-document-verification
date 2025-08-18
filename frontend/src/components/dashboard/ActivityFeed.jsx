import React from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ActivityFeed = ({ activities = [], loading = false, emptyMessage }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <DocumentIcon className="w-5 h-5 text-[#296CFF]" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={`loading-${i}`} className="animate-pulse">
              <div className="flex items-center space-x-3 p-4 bg-[#121212] rounded-xl border border-[#333333]">
                <div className="w-10 h-10 bg-[#296CFF]/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#296CFF]/20 rounded w-3/4"></div>
                  <div className="h-3 bg-[#333333] rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-[#333333] rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <DocumentIcon className="w-5 h-5 text-[#296CFF]" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333333]">
            <DocumentIcon className="w-8 h-8 text-[#666666]" />
          </div>
          <p className="text-[#E0E0E0] font-medium mb-2">No activity yet</p>
          <p className="text-sm text-[#999999] max-w-xs mx-auto">
            {emptyMessage || "Upload and verify documents to see activity here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DocumentIcon className="w-5 h-5 text-[#296CFF]" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="text-xs text-[#999999] bg-[#121212] px-2 py-1 rounded border border-[#333333]">
          {activities.length} {activities.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          // Create truly unique key using multiple properties
          const uniqueKey = `activity-${activity.id || index}-${activity.timestamp || Date.now()}-${activity.type}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Icon selection based on activity type and status
          let Icon, iconBgColor, iconTextColor;
          
          if (activity.type === 'upload') {
            Icon = CloudArrowUpIcon;
            iconBgColor = 'bg-[#296CFF]/20';
            iconTextColor = 'text-[#296CFF]';
          } else if (activity.type === 'verification') {
            Icon = activity.status === 'verified' ? CheckCircleIcon : ShieldCheckIcon;
            iconBgColor = activity.status === 'verified' ? 'bg-[#00C853]/20' : 'bg-[#296CFF]/20';
            iconTextColor = activity.status === 'verified' ? 'text-[#00C853]' : 'text-[#296CFF]';
          } else {
            Icon = activity.status === 'verified' ? CheckCircleIcon : 
                  activity.status === 'pending' ? ClockIcon : 
                  activity.status === 'error' ? ExclamationTriangleIcon : DocumentIcon;
            
            if (activity.status === 'verified') {
              iconBgColor = 'bg-[#00C853]/20';
              iconTextColor = 'text-[#00C853]';
            } else if (activity.status === 'pending') {
              iconBgColor = 'bg-[#296CFF]/20';
              iconTextColor = 'text-[#296CFF]';
            } else if (activity.status === 'error') {
              iconBgColor = 'bg-[#FF4C4C]/20';
              iconTextColor = 'text-[#FF4C4C]';
            } else {
              iconBgColor = 'bg-[#333333]';
              iconTextColor = 'text-[#666666]';
            }
          }

          return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-4 bg-[#121212] rounded-xl border border-[#333333] hover:border-[#296CFF]/50 hover:bg-[#1A1A1A] transition-all duration-300 group"
            >
              {/* Activity Icon */}
              <div className={`p-2 rounded-full ${iconBgColor} ${iconTextColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-[#E0E0E0] transition-colors">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-xs text-[#999999] flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </p>
                  {activity.hash && (
                    <span className="text-xs text-[#666666] font-mono bg-[#0D0D0D] px-2 py-1 rounded border border-[#333333] hover:text-[#296CFF] hover:border-[#296CFF] transition-colors cursor-pointer">
                      {activity.hash}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
                activity.status === 'verified' 
                  ? 'bg-[#00C853] text-white border-[#1DE685] shadow-lg shadow-[#00C853]/20'
                  : activity.status === 'pending'
                    ? 'bg-[#296CFF] text-white border-[#2979FF] shadow-lg shadow-[#296CFF]/20'
                    : activity.status === 'error'
                      ? 'bg-[#FF4C4C] text-white border-[#FF6B6B] shadow-lg shadow-[#FF4C4C]/20'
                      : 'bg-[#333333] text-[#999999] border-[#444444]'
              }`}>
                {activity.status === 'verified' && '✓ '}
                {activity.status === 'pending' && '⏳ '}
                {activity.status === 'error' && '⚠ '}
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Footer */}
      {activities.length > 5 && (
        <div className="mt-4 pt-4 border-t border-[#333333]">
          <p className="text-xs text-center text-[#999999]">
            Showing recent {activities.length} activities
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
