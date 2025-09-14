import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Types and Interfaces
interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'purple' | 'cyan';
  loading?: boolean;
  change?: number;
  changeType?: 'percentage' | 'absolute' | 'none';
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

interface ColorConfig {
  gradient: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  shadowColor: string;
}

interface ChangeData {
  value: string;
  isPositive: boolean;
  className: string;
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
  // State
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Animate value changes
  useEffect(() => {
    if (value !== displayValue && !loading && typeof value === 'number') {
      setIsAnimating(true);
      const duration = 1000;
      const start = typeof displayValue === 'number' ? displayValue : 0;
      const end = value;
      const startTime = Date.now();

      const animate = (): void => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function - ease out cubic
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
    } else if (!loading && typeof value !== 'number') {
      // For non-numeric values, set directly
      setDisplayValue(value);
    }
  }, [value, displayValue, loading]);

  // Reset display value when loading starts
  useEffect(() => {
    if (loading) {
      setDisplayValue(0);
      setIsAnimating(false);
    }
  }, [loading]);

  // Color configuration
  const colorConfig: Record<string, ColorConfig> = useMemo(() => ({
    primary: {
      gradient: 'from-primary to-primary/80',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20 dark:border-primary/30',
      shadowColor: 'shadow-primary/20 dark:shadow-primary/30'
    },
    success: {
      gradient: 'from-green-600 to-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      shadowColor: 'shadow-green-200 dark:shadow-green-900'
    },
    warning: {
      gradient: 'from-yellow-600 to-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      shadowColor: 'shadow-yellow-200 dark:shadow-yellow-900'
    },
    error: {
      gradient: 'from-red-600 to-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      shadowColor: 'shadow-red-200 dark:shadow-red-900'
    },
    secondary: {
      gradient: 'from-gray-600 to-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700',
      shadowColor: 'shadow-gray-200 dark:shadow-gray-800'
    },
    purple: {
      gradient: 'from-purple-600 to-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      shadowColor: 'shadow-purple-200 dark:shadow-purple-900'
    },
    cyan: {
      gradient: 'from-cyan-600 to-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      shadowColor: 'shadow-cyan-200 dark:shadow-cyan-900'
    }
  }), []);

  const config = colorConfig[color] || colorConfig.primary;

  // Format display value
  const formatValue = (val: number | string): string => {
    if (loading) return '...';
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val?.toString() || '0';
  };

  // Format change data
  const formatChange = (changeValue?: number): ChangeData | null => {
    if (!changeValue || changeValue === 0) return null;
    
    const isPositive = changeValue > 0;
    const prefix = isPositive ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    
    return {
      value: `${prefix}${Math.abs(changeValue)}${suffix}`,
      isPositive,
      className: isPositive 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400'
    };
  };

  const changeData = formatChange(change);

  // Trend Arrow Component
  const TrendArrow: React.FC<{ isPositive: boolean }> = ({ isPositive }) => (
    <motion.svg
      className="w-3 h-3"
      viewBox="0 0 20 20"
      fill="currentColor"
      animate={{ 
        rotate: isPositive ? 0 : 180,
        y: isPositive ? -1 : 1
      }}
      transition={{ duration: 0.2 }}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </motion.svg>
  );

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      onClick={onClick}
      className={cn("group", onClick && "cursor-pointer")}
    >
      <Card className={cn(
        "relative transition-all duration-300 hover:shadow-lg border",
        config.borderColor,
        config.shadowColor,
        "hover:shadow-xl",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <p className="text-muted-foreground text-sm font-medium mb-2 group-hover:text-foreground transition-colors">
                {title}
              </p>
              
              {/* Value */}
              <motion.div
                animate={{ 
                  scale: isAnimating ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className="mb-2"
              >
                <p className={cn(
                  "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  config.gradient
                )}>
                  {formatValue(displayValue)}
                </p>
              </motion.div>

              {/* Subtitle and Change */}
              <div className="flex items-center justify-between text-xs gap-2">
                {subtitle && (
                  <span className="text-muted-foreground/70 truncate flex-1">
                    {subtitle}
                  </span>
                )}
                {changeData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex items-center space-x-1 font-medium shrink-0",
                      changeData.className
                    )}
                  >
                    <TrendArrow isPositive={changeData.isPositive} />
                    <span>{changeData.value}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Icon */}
            <motion.div
              className={cn(
                "p-3 rounded-xl border transition-all duration-300 group-hover:scale-110",
                config.bgColor,
                config.borderColor
              )}
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.5 }
              }}
            >
              {Icon && (
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
                  config.iconColor
                )} />
              )}
            </motion.div>
          </div>

          {/* Hover glow effect */}
          <div 
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none",
              "bg-gradient-to-br from-current/5 to-transparent"
            )}
            style={{
              color: config.iconColor.includes('primary') ? 'hsl(var(--primary))' : 
                     config.iconColor.includes('green') ? '#16a34a' :
                     config.iconColor.includes('yellow') ? '#ca8a04' :
                     config.iconColor.includes('red') ? '#dc2626' :
                     config.iconColor.includes('purple') ? '#9333ea' :
                     config.iconColor.includes('cyan') ? '#0891b2' : '#6b7280'
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
