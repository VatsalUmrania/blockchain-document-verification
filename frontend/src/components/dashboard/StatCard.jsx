// // import React from 'react';
// // import { motion } from 'framer-motion';

// // const StatCard = ({ title, value, icon: Icon, color, loading = false }) => {
// //   const colorClasses = {
// //     blue: 'bg-blue-500',
// //     green: 'bg-green-500',
// //     yellow: 'bg-yellow-500',
// //     purple: 'bg-purple-500',
// //     red: 'bg-red-500'
// //   };

// //   const bgColorClasses = {
// //     blue: 'bg-blue-50',
// //     green: 'bg-green-50',
// //     yellow: 'bg-yellow-50',
// //     purple: 'bg-purple-50',
// //     red: 'bg-red-50'
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       whileHover={{ scale: 1.02 }}
// //       className={`card ${bgColorClasses[color]} border-l-4 border-l-${color}-500`}
// //     >
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <p className="text-sm font-medium text-gray-600">{title}</p>
// //           {loading ? (
// //             <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
// //           ) : (
// //             <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
// //           )}
// //         </div>
// //         <div className={`p-3 rounded-full ${colorClasses[color]}`}>
// //           <Icon className="w-6 h-6 text-white" />
// //         </div>
// //       </div>
// //     </motion.div>
// //   );
// // };

// // export default StatCard;


// import React from 'react';
// import { motion } from 'framer-motion';

// const StatCard = ({ title, value, icon: Icon, color, loading = false }) => {
//   const colorClasses = {
//     electric: 'bg-accent-500', // Electric Blue
//     cyan: 'bg-secondary-400', // Neon Cyan
//     purple: 'bg-primary-500', // Bright Purple
//     violet: 'bg-surface', // Dark Violet
//     orange: 'bg-orange-500' // Keep orange for warnings
//   };

//   const bgColorClasses = {
//     electric: 'bg-accent-500/10 border-accent-400/30', // Electric Blue background
//     cyan: 'bg-secondary-400/10 border-secondary-400/30', // Neon Cyan background
//     purple: 'bg-primary-500/10 border-primary-400/30', // Bright Purple background
//     violet: 'bg-surface/20 border-surface/40', // Dark Violet background
//     orange: 'bg-orange-500/10 border-orange-400/30' // Orange background
//   };

//   const textColorClasses = {
//     electric: 'text-accent-400',
//     cyan: 'text-secondary-400',
//     purple: 'text-primary-400',
//     violet: 'text-muted-300',
//     orange: 'text-orange-400'
//   };

//   const iconColorClasses = {
//     electric: 'text-accent-400 bg-accent-500/20 border border-accent-400/30',
//     cyan: 'text-secondary-400 bg-secondary-400/20 border border-secondary-400/30',
//     purple: 'text-primary-400 bg-primary-500/20 border border-primary-400/30',
//     violet: 'text-muted-300 bg-surface/40 border border-muted-600',
//     orange: 'text-orange-400 bg-orange-500/20 border border-orange-400/30'
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ scale: 1.02, y: -2 }}
//       className={`card-stats ${bgColorClasses[color]} border relative overflow-hidden`}
//     >
//       {/* Subtle gradient overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none" />
      
//       <div className="relative flex items-center justify-between">
//         <div className="flex-1">
//           <p className="text-sm font-medium text-muted-300 mb-1">{title}</p>
//           {loading ? (
//             <div className="h-8 w-20 bg-primary-400/20 rounded animate-pulse"></div>
//           ) : (
//             <motion.p 
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className={`text-3xl font-bold ${textColorClasses[color]}`}
//             >
//               {value}
//             </motion.p>
//           )}
//         </div>
        
//         <motion.div 
//           whileHover={{ rotate: 5, scale: 1.1 }}
//           className={`p-3 rounded-xl ${iconColorClasses[color]} backdrop-blur-sm`}
//         >
//           <Icon className="w-6 h-6" />
//         </motion.div>
//       </div>

//       {/* Bottom accent line */}
//       <motion.div 
//         initial={{ width: 0 }}
//         animate={{ width: '100%' }}
//         transition={{ delay: 0.5, duration: 0.8 }}
//         className={`absolute bottom-0 left-0 h-0.5 ${colorClasses[color]} rounded-full`}
//       />
//     </motion.div>
//   );
// };

// export default StatCard;


// components/dashboard/StatCard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, loading, ...props }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (value !== displayValue && !loading) {
      setIsAnimating(true);
      const duration = 500;
      const start = displayValue;
      const end = value;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        setDisplayValue(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, displayValue, loading]);

  const colorClasses = {
    electric: 'from-blue-500 to-cyan-400',
    cyan: 'from-cyan-500 to-teal-400',
    purple: 'from-purple-500 to-pink-400',
    violet: 'from-violet-500 to-purple-400'
  };

  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-surface/40 backdrop-blur-sm rounded-xl border border-primary-500/20 p-6 hover:border-accent-400/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-400 text-sm font-medium">{title}</p>
          <motion.p 
            className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
            animate={{ 
              scale: isAnimating ? [1, 1.1, 1] : 1,
              opacity: loading ? 0.5 : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            {loading ? '...' : displayValue.toLocaleString()}
          </motion.p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
