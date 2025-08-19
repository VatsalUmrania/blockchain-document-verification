import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  showCloseButton = true,
  title,
  closeOnBackdrop = true,
  closeOnEscape = true,
  variant = 'default' // 'default', 'blur', 'slide'
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27 && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  const getAnimationVariants = () => {
    switch (variant) {
      case 'slide':
        return {
          initial: { opacity: 0, x: '100%' },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: '100%' }
        };
      case 'blur':
        return {
          initial: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
          animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 0.9, filter: 'blur(10px)' }
        };
      default:
        return {
          initial: { opacity: 0, scale: 0.9, y: 50 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.9, y: 50 }
        };
    }
  };

  if (!isOpen) return null;

  const animationVariants = getAnimationVariants();

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="fixed inset-0 backdrop-blur-md"
            style={{
              background: `
                radial-gradient(circle at center, rgba(var(--color-primary), 0.1) 0%, rgba(var(--bg-primary), 0.9) 70%),
                rgb(var(--bg-primary))/80
              `
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={animationVariants.initial}
            animate={animationVariants.animate}
            exit={animationVariants.exit}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className={`
              relative z-10 w-full ${sizeClasses[size]} max-h-[90vh] 
              bg-[rgb(var(--surface-primary))] border-2 border-[rgb(var(--border-primary))] 
              rounded-2xl shadow-2xl overflow-hidden ${className}
            `}
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 0 0 1px rgba(var(--color-primary), 0.1),
                0 0 30px rgba(var(--color-primary), 0.15)
              `
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--surface-secondary))]">
                {title && (
                  <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center space-x-2">
                    <span>{title}</span>
                  </h2>
                )}
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--color-error))] bg-[rgb(var(--surface-primary))] hover:bg-[rgb(var(--surface-hover))] border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-error))] rounded-lg transition-all duration-300"
                    title="Close modal"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-thumb-[rgb(var(--color-primary))] scrollbar-track-[rgb(var(--surface-secondary))]">
              {children}
            </div>

            {/* Decorative border glow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none">
              <div 
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(var(--color-primary), 0.1) 0%, 
                    transparent 50%, 
                    rgba(var(--color-success), 0.1) 100%
                  )`
                }}
              />
            </div>
          </motion.div>

          {/* Background particles effect */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `rgba(var(--color-primary), 0.2)`
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  repeatType: 'loop'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Pre-styled modal variants with centralized theme
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "primary", // 'primary', 'danger', 'success'
  loading = false
}) => {
  const variants = {
    primary: {
      confirmButton: "btn-primary",
      icon: <InformationCircleIcon className="w-6 h-6 text-[rgb(var(--color-primary))]" />
    },
    danger: {
      confirmButton: `
        px-4 py-2 bg-[rgb(var(--color-error))] hover:bg-[rgba(255,76,76,0.9)] 
        text-white border border-[rgb(var(--color-error))] rounded-lg 
        shadow-lg transition-all duration-300
      `,
      icon: <XCircleIcon className="w-6 h-6 text-[rgb(var(--color-error))]" />
    },
    success: {
      confirmButton: "btn-success",
      icon: <CheckCircleIcon className="w-6 h-6 text-[rgb(var(--color-success))]" />
    }
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          {currentVariant.icon}
          <div>
            <p className="text-[rgb(var(--text-primary))] text-lg font-medium mb-2">
              Are you sure?
            </p>
            <p className="text-[rgb(var(--text-secondary))]">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={currentVariant.confirmButton}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "info" 
}) => {
  const typeConfig = {
    info: { 
      bg: 'bg-[rgb(var(--color-primary)/0.1)]', 
      border: 'border-[rgb(var(--color-primary))]', 
      text: 'text-[rgb(var(--color-primary))]',
      icon: <InformationCircleIcon className="w-6 h-6" />
    },
    success: { 
      bg: 'bg-[rgb(var(--color-success)/0.1)]', 
      border: 'border-[rgb(var(--color-success))]', 
      text: 'text-[rgb(var(--color-success))]',
      icon: <CheckCircleIcon className="w-6 h-6" />
    },
    error: { 
      bg: 'bg-[rgb(var(--color-error)/0.1)]', 
      border: 'border-[rgb(var(--color-error))]', 
      text: 'text-[rgb(var(--color-error))]',
      icon: <XCircleIcon className="w-6 h-6" />
    },
    warning: { 
      bg: 'bg-[rgb(var(--color-warning)/0.1)]', 
      border: 'border-[rgb(var(--color-warning))]', 
      text: 'text-[rgb(var(--color-warning))]',
      icon: <ExclamationTriangleIcon className="w-6 h-6" />
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className={`p-4 rounded-lg ${config.bg} border ${config.border} mb-6`}>
          <div className={`flex items-start space-x-3 ${config.text}`}>
            {config.icon}
            <p className="text-lg flex-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Loading Modal
export const LoadingModal = ({ 
  isOpen, 
  title = "Loading...", 
  message 
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={() => {}} 
    title={title} 
    size="sm" 
    showCloseButton={false}
    closeOnBackdrop={false}
    closeOnEscape={false}
  >
    <div className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-8 h-8 border-2 border-[rgb(var(--color-primary))]/30 border-t-[rgb(var(--color-primary))] rounded-full animate-spin" />
      </div>
      {message && (
        <p className="text-[rgb(var(--text-secondary))]">{message}</p>
      )}
    </div>
  </Modal>
);

// Image Modal
export const ImageModal = ({ 
  isOpen, 
  onClose, 
  src, 
  alt, 
  title 
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    title={title} 
    size="2xl"
    className="bg-[rgb(var(--bg-primary))]"
  >
    <div className="p-4">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
      />
    </div>
  </Modal>
);

export default Modal;
