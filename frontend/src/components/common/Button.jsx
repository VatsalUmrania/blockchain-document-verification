import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden';
  
  const variants = {
    primary: 'bg-[#296CFF] hover:bg-[#2979FF] text-white shadow-lg shadow-[#296CFF]/30 hover:shadow-[#296CFF]/50 border border-[#296CFF]/50 hover:border-[#2979FF]',
    secondary: 'bg-[#00C853] hover:bg-[#1DE685] text-white shadow-lg shadow-[#00C853]/30 hover:shadow-[#00C853]/50 border border-[#00C853]/50 hover:border-[#1DE685]',
    outline: 'border-2 border-[#296CFF] text-[#296CFF] hover:bg-[#296CFF] hover:text-white bg-transparent hover:shadow-lg hover:shadow-[#296CFF]/30',
    danger: 'bg-[#FF4C4C] hover:bg-[#FF6B6B] text-white shadow-lg shadow-[#FF4C4C]/30 hover:shadow-[#FF4C4C]/50 border border-[#FF4C4C]/50 hover:border-[#FF6B6B]',
    ghost: 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#E0E0E0] hover:text-white border border-[#333333] hover:border-[#296CFF]',
    success: 'bg-[#00C853] hover:bg-[#1DE685] text-white shadow-lg shadow-[#00C853]/30 hover:shadow-[#00C853]/50 border border-[#00C853]/50',
    warning: 'bg-[#FF9800] hover:bg-[#FFB74D] text-white shadow-lg shadow-[#FF9800]/30 hover:shadow-[#FF9800]/50 border border-[#FF9800]/50'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl'
  };

  const disabledClasses = disabled || loading 
    ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' 
    : 'cursor-pointer hover:-translate-y-0.5 hover:scale-105';

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
        >
          <svg 
            className="animate-spin h-5 w-5 text-current" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      )}

      {/* Button content */}
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {Icon && !loading && (
          <Icon className="w-4 h-4" />
        )}
        <span>{children}</span>
      </div>

      {/* Subtle shimmer effect on hover */}
      {!disabled && !loading && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer" />
        </div>
      )}
    </motion.button>
  );
};

export default Button;
