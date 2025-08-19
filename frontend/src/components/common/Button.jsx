// import React from 'react';
// import { motion } from 'framer-motion';

// const Button = ({ 
//   children, 
//   onClick, 
//   variant = 'primary', 
//   size = 'md', 
//   disabled = false, 
//   loading = false, 
//   className = '',
//   icon: Icon,
//   ...props
// }) => {
//   const baseClasses = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden';
  
//   const variants = {
//     primary: 'bg-[#296CFF] hover:bg-[#2979FF] text-white shadow-lg shadow-[#296CFF]/30 hover:shadow-[#296CFF]/50 border border-[#296CFF]/50 hover:border-[#2979FF]',
//     secondary: 'bg-[#00C853] hover:bg-[#1DE685] text-white shadow-lg shadow-[#00C853]/30 hover:shadow-[#00C853]/50 border border-[#00C853]/50 hover:border-[#1DE685]',
//     outline: 'border-2 border-[#296CFF] text-[#296CFF] hover:bg-[#296CFF] hover:text-white bg-transparent hover:shadow-lg hover:shadow-[#296CFF]/30',
//     danger: 'bg-[#FF4C4C] hover:bg-[#FF6B6B] text-white shadow-lg shadow-[#FF4C4C]/30 hover:shadow-[#FF4C4C]/50 border border-[#FF4C4C]/50 hover:border-[#FF6B6B]',
//     ghost: 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#E0E0E0] hover:text-white border border-[#333333] hover:border-[#296CFF]',
//     success: 'bg-[#00C853] hover:bg-[#1DE685] text-white shadow-lg shadow-[#00C853]/30 hover:shadow-[#00C853]/50 border border-[#00C853]/50',
//     warning: 'bg-[#FF9800] hover:bg-[#FFB74D] text-white shadow-lg shadow-[#FF9800]/30 hover:shadow-[#FF9800]/50 border border-[#FF9800]/50'
//   };
  
//   const sizes = {
//     xs: 'px-2 py-1 text-xs',
//     sm: 'px-3 py-2 text-sm',
//     md: 'px-4 py-3 text-base',
//     lg: 'px-6 py-4 text-lg',
//     xl: 'px-8 py-5 text-xl'
//   };

//   const disabledClasses = disabled || loading 
//     ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' 
//     : 'cursor-pointer hover:-translate-y-0.5 hover:scale-105';

//   const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

//   return (
//     <motion.button
//       whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
//       whileTap={disabled || loading ? {} : { scale: 0.98 }}
//       className={classes}
//       onClick={onClick}
//       disabled={disabled || loading}
//       {...props}
//     >
//       {/* Loading spinner */}
//       {loading && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
//         >
//           <svg 
//             className="animate-spin h-5 w-5 text-current" 
//             fill="none" 
//             viewBox="0 0 24 24"
//           >
//             <circle 
//               className="opacity-25" 
//               cx="12" 
//               cy="12" 
//               r="10" 
//               stroke="currentColor" 
//               strokeWidth="4"
//             />
//             <path 
//               className="opacity-75" 
//               fill="currentColor" 
//               d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             />
//           </svg>
//         </motion.div>
//       )}

//       {/* Button content */}
//       <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
//         {Icon && !loading && (
//           <Icon className="w-4 h-4" />
//         )}
//         <span>{children}</span>
//       </div>

//       {/* Subtle shimmer effect on hover */}
//       {!disabled && !loading && (
//         <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
//           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer" />
//         </div>
//       )}
//     </motion.button>
//   );
// };

// export default Button;

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
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden border';
  
  const variants = {
    primary: `
      bg-[rgb(var(--color-primary))] 
      hover:bg-[rgb(var(--color-primary-hover))] 
      text-white 
      shadow-lg 
      hover:shadow-xl
      border-[rgb(var(--color-primary)/0.5)] 
      hover:border-[rgb(var(--color-primary-hover))]
      hover:shadow-[rgb(var(--color-primary)/0.4)]
    `,
    secondary: `
      bg-[rgb(var(--surface-primary))] 
      hover:bg-[rgb(var(--surface-hover))] 
      text-[rgb(var(--text-primary))] 
      shadow-lg 
      hover:shadow-xl
      border-[rgb(var(--border-primary))] 
      hover:border-[rgb(var(--color-primary))]
      hover:shadow-[rgb(var(--color-primary)/0.2)]
    `,
    success: `
      bg-[rgb(var(--color-success))] 
      hover:bg-[rgb(var(--color-success-hover))] 
      text-white 
      shadow-lg 
      hover:shadow-xl
      border-[rgb(var(--color-success)/0.5)] 
      hover:border-[rgb(var(--color-success-hover))]
      hover:shadow-[rgb(var(--color-success)/0.4)]
    `,
    danger: `
      bg-[rgb(var(--color-error))] 
      hover:bg-[rgba(255,76,76,0.9)] 
      text-white 
      shadow-lg 
      hover:shadow-xl
      border-[rgb(var(--color-error)/0.5)] 
      hover:border-[rgb(var(--color-error))]
      hover:shadow-[rgb(var(--color-error)/0.4)]
    `,
    warning: `
      bg-[rgb(var(--color-warning))] 
      hover:bg-[rgba(255,152,0,0.9)] 
      text-white 
      shadow-lg 
      hover:shadow-xl
      border-[rgb(var(--color-warning)/0.5)] 
      hover:border-[rgb(var(--color-warning))]
      hover:shadow-[rgb(var(--color-warning)/0.4)]
    `,
    outline: `
      bg-transparent 
      hover:bg-[rgb(var(--color-primary))] 
      text-[rgb(var(--color-primary))] 
      hover:text-white 
      shadow-none
      hover:shadow-lg
      border-[rgb(var(--color-primary))] 
      border-2
      hover:shadow-[rgb(var(--color-primary)/0.3)]
    `,
    ghost: `
      bg-transparent 
      hover:bg-[rgb(var(--surface-hover))] 
      text-[rgb(var(--text-secondary))] 
      hover:text-[rgb(var(--color-primary))] 
      shadow-none
      border-transparent 
      hover:border-[rgb(var(--border-primary))]
    `,
    link: `
      bg-transparent 
      hover:bg-[rgb(var(--surface-hover))] 
      text-[rgb(var(--color-primary))] 
      hover:text-[rgb(var(--color-primary-hover))] 
      shadow-none
      border-transparent 
      underline-offset-4 
      hover:underline
    `
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-3 text-base gap-2',
    lg: 'px-6 py-4 text-lg gap-2',
    xl: 'px-8 py-5 text-xl gap-3'
  };

  const disabledClasses = disabled || loading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer hover:-translate-y-0.5 hover:scale-105 active:scale-95';

  const widthClasses = fullWidth ? 'w-full' : '';

  // Clean up variant classes by removing extra whitespace
  const variantClasses = variants[variant]?.replace(/\s+/g, ' ').trim() || variants.primary;
  
  const classes = `${baseClasses} ${variantClasses} ${sizes[size]} ${disabledClasses} ${widthClasses} ${className}`.replace(/\s+/g, ' ').trim();

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        duration: 0.1
      }}
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
          exit={{ opacity: 0, scale: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
        >
          <motion.svg 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 text-current" 
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
          </motion.svg>
        </motion.div>
      )}

      {/* Button content */}
      <div className={`flex items-center ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {Icon && !loading && (
          <Icon className={`flex-shrink-0 ${sizes[size].includes('xs') ? 'w-3 h-3' : sizes[size].includes('sm') ? 'w-4 h-4' : sizes[size].includes('lg') ? 'w-6 h-6' : sizes[size].includes('xl') ? 'w-7 h-7' : 'w-5 h-5'}`} />
        )}
        {children && <span>{children}</span>}
      </div>

      {/* Shimmer effect on hover */}
      {!disabled && !loading && variant !== 'link' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}

      {/* Focus ring */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-opacity-50 pointer-events-none" />
    </motion.button>
  );
};

// Button group component for multiple buttons
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal', ...props }) => {
  const orientationClasses = orientation === 'vertical' 
    ? 'flex-col space-y-2' 
    : 'flex-row space-x-2';
  
  return (
    <div className={`flex ${orientationClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Icon-only button variant
export const IconButton = ({ icon: Icon, size = 'md', className = '', ...props }) => {
  const iconSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button 
      className={`${iconSizes[size]} aspect-square ${className}`}
      size={size}
      {...props}
    >
      {Icon && <Icon className="w-full h-full" />}
    </Button>
  );
};

export default Button;
