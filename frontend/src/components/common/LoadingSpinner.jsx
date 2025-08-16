import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  variant = 'spin', // 'spin', 'pulse', 'dots', 'bars'
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const colorClasses = {
    primary: {
      border: 'border-[#296CFF]',
      bg: 'bg-[#296CFF]',
      text: 'text-[#296CFF]'
    },
    secondary: {
      border: 'border-[#00C853]',
      bg: 'bg-[#00C853]',
      text: 'text-[#00C853]'
    },
    white: {
      border: 'border-white',
      bg: 'bg-white',
      text: 'text-white'
    },
    gray: {
      border: 'border-[#666666]',
      bg: 'bg-[#666666]',
      text: 'text-[#666666]'
    },
    danger: {
      border: 'border-[#FF4C4C]',
      bg: 'bg-[#FF4C4C]',
      text: 'text-[#FF4C4C]'
    }
  };

  const colorScheme = colorClasses[color] || colorClasses.primary;

  // Spinning variant (default)
  const SpinningLoader = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} border-2 border-t-transparent ${colorScheme.border} rounded-full`}
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
        ease: 'easeInOut'
      }}
      className={`${sizeClasses[size]} ${colorScheme.bg} rounded-full`}
    />
  );

  // Dots variant
  const DotsLoader = () => (
    <div className="flex items-center space-x-1">
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
            ease: 'easeInOut'
          }}
          className={`w-2 h-2 ${colorScheme.bg} rounded-full`}
        />
      ))}
    </div>
  );

  // Bars variant
  const BarsLoader = () => (
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
            ease: 'easeInOut'
          }}
          className={`w-1 h-4 ${colorScheme.bg} rounded-full origin-bottom`}
        />
      ))}
    </div>
  );

  // Advanced spinning variant with gradient
  const GradientSpinner = () => (
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-2 border-transparent rounded-full`}
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${color === 'primary' ? '#296CFF' : color === 'secondary' ? '#00C853' : '#666666'} 360deg)`,
          borderRadius: '50%'
        }}
      />
      <div 
        className={`absolute inset-1 bg-[#1A1A1A] rounded-full`}
      />
    </div>
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
        className="fixed inset-0 bg-[#0D0D0D]/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {getLoader()}
          </div>
          {text && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`text-lg font-medium ${colorScheme.text}`}
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
    <div className="flex items-center justify-center space-x-3">
      {getLoader()}
      {text && (
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`text-sm font-medium ${colorScheme.text}`}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

export default LoadingSpinner;
