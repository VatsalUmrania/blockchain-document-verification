// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { cn } from '@/lib/utils';

// // Types
// interface StatCardProps {
//   title: string;
//   value: number | string;
//   icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
//   color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'purple' | 'blue';
//   loading?: boolean;
//   change?: number;
//   changeType?: 'percentage' | 'absolute';
//   subtitle?: string;
//   className?: string;
//   onClick?: () => void;
// }

// const StatCard: React.FC<StatCardProps> = ({ 
//   title, 
//   value, 
//   icon: Icon, 
//   color = 'primary', 
//   loading = false,
//   change,
//   changeType = 'percentage',
//   subtitle,
//   className = '',
//   onClick,
//   ...props 
// }) => {
//   const [displayValue, setDisplayValue] = useState<number | string>(0);

//   // Simplified animation
//   useEffect(() => {
//     if (!loading && typeof value === 'number') {
//       const start = 0;
//       const end = value;
//       const duration = 800;
//       const startTime = Date.now();

//       const animate = () => {
//         const elapsed = Date.now() - startTime;
//         const progress = Math.min(elapsed / duration, 1);
//         const easeOut = 1 - Math.pow(1 - progress, 3);
//         const current = Math.round(start + (end - start) * easeOut);
        
//         setDisplayValue(current);
        
//         if (progress < 1) {
//           requestAnimationFrame(animate);
//         }
//       };
      
//       requestAnimationFrame(animate);
//     } else if (!loading) {
//       setDisplayValue(value);
//     }
//   }, [value, loading]);

//   // Color configuration - simplified
//   const colorConfig = {
//     primary: {
//       bg: 'bg-primary/10',
//       iconBg: 'bg-primary/20',
//       text: 'text-primary',
//       border: 'border-primary/20'
//     },
//     success: {
//       bg: 'bg-success/10',
//       iconBg: 'bg-success/20',
//       text: 'text-success',
//       border: 'border-success/20'
//     },
//     warning: {
//       bg: 'bg-warning/10',
//       iconBg: 'bg-warning/20',
//       text: 'text-warning',
//       border: 'border-warning/20'
//     },
//     error: {
//       bg: 'bg-error/10',
//       iconBg: 'bg-error/20',
//       text: 'text-error',
//       border: 'border-error/20'
//     },
//     secondary: {
//       bg: 'bg-secondary/10',
//       iconBg: 'bg-secondary/20',
//       text: 'text-secondary',
//       border: 'border-secondary/20'
//     },
//     purple: {
//       bg: 'bg-purple-500/10',
//       iconBg: 'bg-purple-500/20',
//       text: 'text-purple-600',
//       border: 'border-purple-500/20'
//     },
//     blue: {
//       bg: 'bg-blue-500/10',
//       iconBg: 'bg-blue-500/20',
//       text: 'text-blue-600',
//       border: 'border-blue-500/20'
//     }
//   };

//   const config = colorConfig[color] || colorConfig.primary;

//   // Format value
//   const formatValue = (val: number | string): string => {
//     if (loading) return '--';
//     if (typeof val === 'number') {
//       return val.toLocaleString();
//     }
//     return val || '0';
//   };

//   // Format change
//   const formatChange = (changeValue?: number) => {
//     if (!changeValue || changeValue === 0) return null;
    
//     const isPositive = changeValue > 0;
//     const prefix = isPositive ? '+' : '';
//     const suffix = changeType === 'percentage' ? '%' : '';
    
//     return {
//       value: `${prefix}${Math.abs(changeValue)}${suffix}`,
//       isPositive,
//       className: isPositive ? 'text-success' : 'text-error'
//     };
//   };

//   const changeData = formatChange(change);

//   // Loading state
//   if (loading) {
//     return (
//       <Card className={cn("bg-surface-primary border", className)}>
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between">
//             <div className="space-y-3 flex-1">
//               <Skeleton className="h-4 w-24" />
//               <Skeleton className="h-8 w-20" />
//               <Skeleton className="h-3 w-32" />
//             </div>
//             <Skeleton className="w-12 h-12 rounded-xl" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -2 }}
//       transition={{ duration: 0.2 }}
//       onClick={onClick}
//       className={cn("group", onClick && "cursor-pointer")}
//       {...props}
//     >
//       <Card className={cn(
//         "bg-surface-primary transition-all duration-200 hover:shadow-md",
//         config.border,
//         "hover:border-primary/30",
//         className
//       )}>
//         <CardContent className="p-6">
//           <div className="flex items-start justify-between">
//             {/* Content */}
//             <div className="flex-1 min-w-0">
//               {/* Title */}
//               <p className="text-sm font-medium text-muted-foreground mb-3">
//                 {title}
//               </p>
              
//               {/* Value */}
//               <div className="mb-2">
//                 <motion.p 
//                   key={value}
//                   initial={{ scale: 0.9 }}
//                   animate={{ scale: 1 }}
//                   className={cn(
//                     "text-3xl font-bold",
//                     config.text
//                   )}
//                 >
//                   {formatValue(displayValue)}
//                 </motion.p>
//               </div>

//               {/* Subtitle and Change */}
//               <div className="flex items-center justify-between">
//                 {subtitle && (
//                   <span className="text-xs text-muted-foreground">
//                     {subtitle}
//                   </span>
//                 )}
                
//                 {changeData && (
//                   <motion.span
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className={cn(
//                       "text-xs font-medium flex items-center space-x-1",
//                       changeData.className
//                     )}
//                   >
//                     <span>{changeData.isPositive ? '↗' : '↘'}</span>
//                     <span>{changeData.value}</span>
//                   </motion.span>
//                 )}
//               </div>
//             </div>

//             {/* Icon */}
//             {Icon && (
//               <motion.div
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 className={cn(
//                   "p-3 rounded-xl transition-colors",
//                   config.iconBg,
//                   config.text
//                 )}
//               >
//                 <Icon className="w-5 h-5" />
//               </motion.div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// };

// export default StatCard;


import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react'; // Added lucide icons

// Types
interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'purple' | 'blue';
  loading?: boolean;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  loading = false,
  change,
  changeType = 'percentage',
  subtitle,
  className = '',
  onClick,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  // Simplified animation
  useEffect(() => {
    if (!loading && typeof value === 'number') {
      const start = 0;
      const end = value;
      const duration = 800;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        setDisplayValue(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (!loading) {
      setDisplayValue(value);
    }
  }, [value, loading]);

  // [MODIFIED] Color configuration re-mapped to your index.css theme
  const colorConfig = {
    primary: {
      text: 'text-primary',
      iconBg: 'bg-primary/10',
      border: 'border-primary/20'
    },
    success: { // Mapped to primary
      text: 'text-primary',
      iconBg: 'bg-primary/10',
      border: 'border-primary/20'
    },
    warning: { // Mapped to accent
      text: 'text-accent-foreground',
      iconBg: 'bg-accent',
      border: 'border-accent'
    },
    error: { // Mapped to destructive
      text: 'text-destructive',
      iconBg: 'bg-destructive/10',
      border: 'border-destructive/20'
    },
    secondary: {
      text: 'text-secondary-foreground',
      iconBg: 'bg-secondary',
      border: 'border-border'
    },
    purple: { // Mapped to primary
      text: 'text-primary',
      iconBg: 'bg-primary/10',
      border: 'border-primary/20'
    },
    blue: { // Mapped to primary
      text: 'text-primary',
      iconBg: 'bg-primary/10',
      border: 'border-primary/20'
    }
  };

  const config = colorConfig[color] || colorConfig.primary;

  // Format value
  const formatValue = (val: number | string): string => {
    if (loading) return '--';
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val || '0';
  };

  // Format change
  const formatChange = (changeValue?: number) => {
    if (!changeValue || changeValue === 0) return null;
    
    const isPositive = changeValue > 0;
    const prefix = isPositive ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    
    return {
      value: `${prefix}${Math.abs(changeValue)}${suffix}`,
      isPositive,
      // [MODIFIED] Using theme colors
      className: isPositive ? 'text-primary' : 'text-destructive'
    };
  };

  const changeData = formatChange(change);

  // Loading state
  if (loading) {
    return (
      // [MODIFIED] Removed bg-surface-primary
      <Card className={cn("border", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn("group", onClick && "cursor-pointer")}
      {...props}
    >
      <Card className={cn(
        // [MODIFIED] Removed bg-surface-primary
        "transition-all duration-200 hover:shadow-md",
        config.border,
        "hover:border-primary/30",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {title}
              </p>
              
              {/* Value */}
              <div className="mb-2">
                <motion.p 
                  key={value}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  // [MODIFIED] Added spring animation
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "text-3xl font-bold",
                    config.text
                  )}
                >
                  {formatValue(displayValue)}
                </motion.p>
              </div>

              {/* Subtitle and Change */}
              <div className="flex items-center justify-between">
                {subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                )}
                
                {changeData && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "text-xs font-medium flex items-center space-x-1",
                      changeData.className
                    )}
                  >
                    {/* [MODIFIED] Using lucide icons */}
                    {changeData.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{changeData.value}</span>
                  </motion.span>
                )}
              </div>
            </div>

            {/* Icon */}
            {Icon && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={cn(
                  "p-3 rounded-xl transition-colors",
                  config.iconBg,
                  config.text
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;