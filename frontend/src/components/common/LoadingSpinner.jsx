import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  variant = 'spin', // 'spin', 'pulse', 'dots', 'bars', 'gradient'
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const colorClasses = {
    primary: {
      border: 'border-[rgb(var(--color-primary))]',
      borderTransparent: 'border-[rgb(var(--color-primary))]/20',
      bg: 'bg-[rgb(var(--color-primary))]',
      text: 'text-[rgb(var(--color-primary))]',
      gradient: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()})`
    },
    secondary: {
      border: 'border-[rgb(var(--text-secondary))]',
      borderTransparent: 'border-[rgb(var(--text-secondary))]/20',
      bg: 'bg-[rgb(var(--text-secondary))]',
      text: 'text-[rgb(var(--text-secondary))]',
      gradient: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()})`
    },
    success: {
      border: 'border-[rgb(var(--color-success))]',
      borderTransparent: 'border-[rgb(var(--color-success))]/20',
      bg: 'bg-[rgb(var(--color-success))]',
      text: 'text-[rgb(var(--color-success))]',
      gradient: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim()})`
    },
    warning: {
      border: 'border-[rgb(var(--color-warning))]',
      borderTransparent: 'border-[rgb(var(--color-warning))]/20',
      bg: 'bg-[rgb(var(--color-warning))]',
      text: 'text-[rgb(var(--color-warning))]',
      gradient: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim()})`
    },
    danger: {
      border: 'border-[rgb(var(--color-error))]',
      borderTransparent: 'border-[rgb(var(--color-error))]/20',
      bg: 'bg-[rgb(var(--color-error))]',
      text: 'text-[rgb(var(--color-error))]',
      gradient: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--color-error').trim()})`
    },
    muted: {
      border: 'border-[rgb(var(--text-quaternary))]',
      borderTransparent: 'border-[rgb(var(--text-quaternary))]/20',
      bg: 'bg-[rgb(var(--text-quaternary))]',
      text: 'text-[rgb(var(--text-quaternary))]',
      gradient: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--text-quaternary').trim()})`
    }
  };

  // Fallback for server-side rendering or when CSS variables aren't available
  const getColorScheme = () => {
    try {
      return colorClasses[color] || colorClasses.primary;
    } catch (error) {
      return {
        border: 'border-[rgb(41,108,255)]',
        borderTransparent: 'border-[rgb(41,108,255)]/20',
        bg: 'bg-[rgb(41,108,255)]',
        text: 'text-[rgb(41,108,255)]',
        gradient: 'rgb(41, 108, 255)'
      };
    }
  };

  const colorScheme = getColorScheme();

  // Spinning variant (default)
  const SpinningLoader = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: 'linear',
        repeatType: 'loop'
      }}
      className={`${sizeClasses[size]} border-2 border-t-transparent ${colorScheme.borderTransparent} border-t-transparent ${colorScheme.border} rounded-full`}
    />
  );

  // Pulse variant
  const PulseLoader = () => (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'loop'
      }}
      className={`${sizeClasses[size]} ${colorScheme.bg} rounded-full`}
    />
  );

  // Dots variant
  const DotsLoader = () => {
    const dotSize = size === 'xs' ? 'w-1 h-1' : 
                   size === 'sm' ? 'w-1.5 h-1.5' :
                   size === 'md' ? 'w-2 h-2' :
                   size === 'lg' ? 'w-3 h-3' :
                   size === 'xl' ? 'w-4 h-4' : 'w-5 h-5';

    const spacing = size === 'xs' || size === 'sm' ? 'space-x-1' : 'space-x-2';

    return (
      <div className={`flex items-center ${spacing}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
              repeatType: 'loop'
            }}
            className={`${dotSize} ${colorScheme.bg} rounded-full`}
          />
        ))}
      </div>
    );
  };

  // Bars variant
  const BarsLoader = () => {
    const barHeight = size === 'xs' ? 'h-2' : 
                     size === 'sm' ? 'h-3' :
                     size === 'md' ? 'h-4' :
                     size === 'lg' ? 'h-6' :
                     size === 'xl' ? 'h-8' : 'h-10';

    const barWidth = size === 'xs' ? 'w-0.5' : 
                    size === 'sm' ? 'w-1' :
                    size === 'md' ? 'w-1' :
                    size === 'lg' ? 'w-1.5' :
                    size === 'xl' ? 'w-2' : 'w-2';

    return (
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{
              scaleY: [1, 2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.1,
              ease: 'easeInOut',
              repeatType: 'loop'
            }}
            className={`${barWidth} ${barHeight} ${colorScheme.bg} rounded-full origin-bottom`}
          />
        ))}
      </div>
    );
  };

  // Advanced gradient spinner
  const GradientSpinner = () => (
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: 'linear',
          repeatType: 'loop'
        }}
        className={`${sizeClasses[size]} rounded-full`}
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${colorScheme.gradient || 'rgb(41, 108, 255)'} 360deg)`,
          mask: 'radial-gradient(circle at center, transparent 30%, black 30%)',
          WebkitMask: 'radial-gradient(circle at center, transparent 30%, black 30%)'
        }}
      />
    </div>
  );

  // Ring variant (enhanced spinning with better visuals)
  const RingLoader = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1.2, 
        repeat: Infinity, 
        ease: 'linear',
        repeatType: 'loop'
      }}
      className={`${sizeClasses[size]} border-2 ${colorScheme.borderTransparent} rounded-full relative`}
      style={{
        borderTopColor: colorScheme.gradient || 'rgb(41, 108, 255)',
        borderRightColor: 'transparent',
      }}
    />
  );

  const getLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader />;
      case 'dots':
        return <DotsLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'gradient':
        return <GradientSpinner />;
      case 'ring':
        return <RingLoader />;
      default:
        return <SpinningLoader />;
    }
  };

  // Full screen overlay
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[rgb(var(--bg-primary))]/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {getLoader()}
          </div>
          {text && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: 'loop'
              }}
              className={`${textSizes[size] || 'text-lg'} font-medium ${colorScheme.text}`}
            >
              {text}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  }

  // Regular loader
  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      {getLoader()}
      {text && (
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatType: 'loop'
          }}
          className={`${textSizes[size] || 'text-sm'} font-medium ${colorScheme.text}`}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

// Skeleton loader component
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  variant = 'text' // 'text', 'circular', 'rectangular'
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <motion.div
      animate={{ 
        opacity: [0.4, 0.8, 0.4] 
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: 'easeInOut',
        repeatType: 'loop'
      }}
      className={`bg-[rgb(var(--surface-secondary))] ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

// Inline loader for buttons
export const InlineSpinner = ({ size = 'sm', color = 'primary' }) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    variant="spin"
    className="inline-flex"
  />
);

export default LoadingSpinner;
