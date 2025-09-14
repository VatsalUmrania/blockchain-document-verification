import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  loading = false,
  change,
  changeType = 'percentage', // 'percentage', 'absolute', 'none'
  subtitle,
  className = '',
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (value !== displayValue && !loading && typeof value === 'number') {
      setIsAnimating(true);
      const duration = 1000;
      const start = displayValue;
      const end = value;
      const startTime = Date.now();

      const animate = () => {
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

  const colorConfig = {
    primary: {
      gradient: 'from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-hover))]',
      bgColor: 'bg-[rgb(var(--color-primary)/0.1)]',
      iconColor: 'text-[rgb(var(--color-primary))]',
      borderColor: 'border-[rgb(var(--color-primary)/0.3)]',
      shadowColor: 'shadow-[rgb(var(--color-primary)/0.2)]'
    },
    success: {
      gradient: 'from-[rgb(var(--color-success))] to-[rgb(var(--color-success-hover))]',
      bgColor: 'bg-[rgb(var(--color-success)/0.1)]',
      iconColor: 'text-[rgb(var(--color-success))]',
      borderColor: 'border-[rgb(var(--color-success)/0.3)]',
      shadowColor: 'shadow-[rgb(var(--color-success)/0.2)]'
    },
    warning: {
      gradient: 'from-[rgb(var(--color-warning))] to-[rgba(255,152,0,0.8)]',
      bgColor: 'bg-[rgb(var(--color-warning)/0.1)]',
      iconColor: 'text-[rgb(var(--color-warning))]',
      borderColor: 'border-[rgb(var(--color-warning)/0.3)]',
      shadowColor: 'shadow-[rgb(var(--color-warning)/0.2)]'
    },
    error: {
      gradient: 'from-[rgb(var(--color-error))] to-[rgba(255,76,76,0.8)]',
      bgColor: 'bg-[rgb(var(--color-error)/0.1)]',
      iconColor: 'text-[rgb(var(--color-error))]',
      borderColor: 'border-[rgb(var(--color-error)/0.3)]',
      shadowColor: 'shadow-[rgb(var(--color-error)/0.2)]'
    },
    secondary: {
      gradient: 'from-[rgb(var(--text-secondary))] to-[rgb(var(--text-tertiary))]',
      bgColor: 'bg-[rgb(var(--text-quaternary)/0.1)]',
      iconColor: 'text-[rgb(var(--text-secondary))]',
      borderColor: 'border-[rgb(var(--text-quaternary)/0.3)]',
      shadowColor: 'shadow-[rgb(var(--text-quaternary)/0.1)]'
    },
    purple: {
      gradient: 'from-[rgb(147,51,234)] to-[rgb(126,34,206)]',
      bgColor: 'bg-[rgba(147,51,234,0.1)]',
      iconColor: 'text-[rgb(147,51,234)]',
      borderColor: 'border-[rgba(147,51,234,0.3)]',
      shadowColor: 'shadow-[rgba(147,51,234,0.2)]'
    },
    cyan: {
      gradient: 'from-[rgb(6,182,212)] to-[rgb(20,184,166)]',
      bgColor: 'bg-[rgba(6,182,212,0.1)]',
      iconColor: 'text-[rgb(6,182,212)]',
      borderColor: 'border-[rgba(6,182,212,0.3)]',
      shadowColor: 'shadow-[rgba(6,182,212,0.2)]'
    }
  };

  const config = colorConfig[color] || colorConfig.primary;

  const formatValue = (val) => {
    if (loading) return '...';
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val || '0';
  };

  const formatChange = (changeValue) => {
    if (!changeValue || changeValue === 0) return null;
    
    const isPositive = changeValue > 0;
    const prefix = isPositive ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    
    return {
      value: `${prefix}${Math.abs(changeValue)}${suffix}`,
      isPositive,
      className: isPositive 
        ? 'text-[rgb(var(--color-success))]' 
        : 'text-[rgb(var(--color-error))]'
    };
  };

  const changeData = formatChange(change);

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
      className={`
        card-stats group cursor-pointer
        ${config.shadowColor} hover:shadow-xl
        ${className}
      `}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[rgb(var(--surface-primary)/0.8)] rounded-xl flex items-center justify-center z-10">
          <div className={`animate-spin w-6 h-6 border-2 border-transparent border-t-current rounded-full ${config.iconColor}`} />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-[rgb(var(--text-secondary))] text-sm font-medium mb-2 group-hover:text-[rgb(var(--text-primary))] transition-colors">
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
            <p className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
              {formatValue(displayValue)}
            </p>
          </motion.div>

          {/* Subtitle and Change */}
          <div className="flex items-center justify-between text-xs">
            {subtitle && (
              <span className="text-[rgb(var(--text-tertiary))] truncate">
                {subtitle}
              </span>
            )}
            {changeData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center space-x-1 ${changeData.className} font-medium`}
              >
                <motion.svg
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  animate={{ 
                    rotate: changeData.isPositive ? 0 : 180,
                    y: changeData.isPositive ? -1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
                <span>{changeData.value}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Icon */}
        <motion.div
          className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor} group-hover:scale-110 transition-all duration-300`}
          whileHover={{ 
            rotate: [0, -10, 10, 0],
            transition: { duration: 0.5 }
          }}
        >
          {Icon && (
            <Icon className={`w-6 h-6 ${config.iconColor} group-hover:scale-110 transition-transform duration-300`} />
          )}
        </motion.div>
      </div>

      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${config.bgColor.replace('bg-[', '').replace(']', '')}, transparent 70%)`
        }}
      />
    </motion.div>
  );
};

export default StatCard;
