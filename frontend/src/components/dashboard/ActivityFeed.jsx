// // import React from 'react';
// // import { motion } from 'framer-motion';
// // import { 
// //   DocumentArrowUpIcon, 
// //   ShieldCheckIcon, 
// //   ClockIcon 
// // } from '@heroicons/react/24/outline';

// // const ActivityFeed = ({ activities, loading = false }) => {
// //   const getActivityIcon = (type) => {
// //     switch (type) {
// //       case 'upload':
// //         return DocumentArrowUpIcon;
// //       case 'verification':
// //         return ShieldCheckIcon;
// //       default:
// //         return ClockIcon;
// //     }
// //   };

// //   const getActivityColor = (type) => {
// //     switch (type) {
// //       case 'upload':
// //         return 'text-blue-500 bg-blue-50';
// //       case 'verification':
// //         return 'text-green-500 bg-green-50';
// //       default:
// //         return 'text-gray-500 bg-gray-50';
// //     }
// //   };

// //   const formatTimeAgo = (timestamp) => {
// //     const now = Date.now();
// //     const diff = now - timestamp;
// //     const minutes = Math.floor(diff / (1000 * 60));
// //     const hours = Math.floor(diff / (1000 * 60 * 60));
// //     const days = Math.floor(diff / (1000 * 60 * 60 * 24));

// //     if (minutes < 60) {
// //       return `${minutes}m ago`;
// //     } else if (hours < 24) {
// //       return `${hours}h ago`;
// //     } else {
// //       return `${days}d ago`;
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="card">
// //         <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
// //         <div className="space-y-4">
// //           {[...Array(3)].map((_, i) => (
// //             <div key={i} className="flex items-start space-x-3 animate-pulse">
// //               <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
// //               <div className="flex-1">
// //                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
// //                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="card">
// //       <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
// //       {activities.length === 0 ? (
// //         <div className="text-center py-8 text-gray-500">
// //           <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
// //           <p>No recent activity</p>
// //         </div>
// //       ) : (
// //         <div className="space-y-4">
// //           {activities.map((activity, index) => {
// //             const Icon = getActivityIcon(activity.type);
// //             const colorClasses = getActivityColor(activity.type);
            
// //             return (
// //               <motion.div
// //                 key={activity.id}
// //                 initial={{ opacity: 0, x: -20 }}
// //                 animate={{ opacity: 1, x: 0 }}
// //                 transition={{ delay: index * 0.1 }}
// //                 className="flex items-start space-x-3"
// //               >
// //                 <div className={`p-2 rounded-full ${colorClasses}`}>
// //                   <Icon className="w-5 h-5" />
// //                 </div>
// //                 <div className="flex-1 min-w-0">
// //                   <p className="text-sm text-gray-800">{activity.message}</p>
// //                   <div className="flex items-center space-x-2 mt-1">
// //                     <p className="text-xs text-gray-500">
// //                       {formatTimeAgo(activity.timestamp)}
// //                     </p>
// //                     {activity.hash && (
// //                       <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
// //                         {activity.hash.substring(0, 8)}...
// //                       </span>
// //                     )}
// //                   </div>
// //                 </div>
// //               </motion.div>
// //             );
// //           })}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ActivityFeed;

// import React from 'react';
// import { motion } from 'framer-motion';
// import { 
//   DocumentArrowUpIcon, 
//   ShieldCheckIcon, 
//   ClockIcon 
// } from '@heroicons/react/24/outline';

// const ActivityFeed = ({ activities, loading = false }) => {
//   const getActivityIcon = (type) => {
//     switch (type) {
//       case 'upload':
//         return DocumentArrowUpIcon;
//       case 'verification':
//         return ShieldCheckIcon;
//       default:
//         return ClockIcon;
//     }
//   };

//   const getActivityColor = (type) => {
//     switch (type) {
//       case 'upload':
//         return 'text-accent-400 bg-accent-500/15 border border-accent-400/20'; // Electric Blue
//       case 'verification':
//         return 'text-secondary-400 bg-secondary-400/15 border border-secondary-400/20'; // Neon Cyan
//       default:
//         return 'text-primary-400 bg-primary-500/15 border border-primary-400/20'; // Bright Purple
//     }
//   };

//   const formatTimeAgo = (timestamp) => {
//     const now = Date.now();
//     const diff = now - timestamp;
//     const minutes = Math.floor(diff / (1000 * 60));
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//     if (minutes < 60) {
//       return `${minutes}m ago`;
//     } else if (hours < 24) {
//       return `${hours}h ago`;
//     } else {
//       return `${days}d ago`;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="card">
//         <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="flex items-start space-x-3 animate-pulse">
//               <div className="w-10 h-10 bg-primary-400/20 rounded-full border border-primary-400/20"></div>
//               <div className="flex-1">
//                 <div className="h-4 bg-primary-400/20 rounded w-3/4 mb-2"></div>
//                 <div className="h-3 bg-primary-400/20 rounded w-1/2"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="card">
//       <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
      
//       {activities.length === 0 ? (
//         <div className="text-center py-8 text-muted-400">
//           <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
//           <p>No recent activity</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {activities.map((activity, index) => {
//             const Icon = getActivityIcon(activity.type);
//             const colorClasses = getActivityColor(activity.type);
            
//             return (
//               <motion.div
//                 key={activity.id}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="flex items-start space-x-3 p-3 rounded-lg bg-surface/40 hover:bg-surface/60 transition-all duration-200"
//               >
//                 <div className={`p-2 rounded-full ${colorClasses}`}>
//                   <Icon className="w-5 h-5" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-foreground font-medium">{activity.message}</p>
//                   <div className="flex items-center space-x-2 mt-1">
//                     <p className="text-xs text-muted-400">
//                       {formatTimeAgo(activity.timestamp)}
//                     </p>
//                     {activity.hash && (
//                       <span className="blockchain-address">
//                         {activity.hash.substring(0, 8)}...
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActivityFeed;


// components/dashboard/ActivityFeed.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { DocumentIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const ActivityFeed = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={`loading-${i}`} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 bg-surface/20 rounded-lg">
                <div className="w-8 h-8 bg-primary-500/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-primary-500/20 rounded w-3/4"></div>
                  <div className="h-3 bg-primary-500/20 rounded w-1/2"></div>
                </div>
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
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
        <div className="text-center py-8">
          <DocumentIcon className="w-12 h-12 text-muted-400 mx-auto mb-3" />
          <p className="text-muted-300">No activity yet</p>
          <p className="text-sm text-muted-400">Upload and verify documents to see activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          // Create truly unique key using multiple properties
          const uniqueKey = `activity-${activity.id || index}-${activity.timestamp || Date.now()}-${activity.type}-${Math.random().toString(36).substr(2, 9)}`;
          
          const Icon = activity.status === 'verified' ? CheckCircleIcon : 
                      activity.status === 'pending' ? ClockIcon : DocumentIcon;
                      
          const iconColor = activity.status === 'verified' ? 'text-secondary-400' : 
                           activity.status === 'pending' ? 'text-accent-400' : 'text-muted-400';

          return (
            <motion.div
              key={uniqueKey} // Use truly unique key
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-surface/20 rounded-lg border border-primary-500/10 hover:border-accent-400/30 transition-colors"
            >
              <div className={`p-2 rounded-full bg-surface/40 ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-muted-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.hash && (
                    <span className="text-xs text-muted-500 font-mono">
                      {activity.hash}
                    </span>
                  )}
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === 'verified' 
                  ? 'bg-secondary-400/20 text-secondary-400'
                  : activity.status === 'pending'
                    ? 'bg-accent-400/20 text-accent-400'
                    : 'bg-muted-400/20 text-muted-400'
              }`}>
                {activity.status}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
