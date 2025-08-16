import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  showCloseButton = true,
  title,
  closeOnBackdrop = true,
  closeOnEscape = true
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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-[#0D0D0D]/80 backdrop-blur-md"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(41, 108, 255, 0.1) 0%, rgba(13, 13, 13, 0.9) 70%)'
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className={`
              relative z-10 w-full ${sizeClasses[size]} max-h-[90vh] 
              bg-[#1A1A1A] border-2 border-[#333333] rounded-2xl 
              shadow-2xl shadow-[#296CFF]/20 overflow-hidden ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-[#333333] bg-[#121212]">
                {title && (
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>{title}</span>
                  </h2>
                )}
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-[#666666] hover:text-[#296CFF] bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] hover:border-[#296CFF] rounded-lg transition-all duration-300"
                    title="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>

            {/* Decorative border glow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#296CFF]/20 via-transparent to-[#00C853]/20 opacity-50" />
            </div>
          </motion.div>

          {/* Background particles effect */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#296CFF]/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
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

// Pre-styled modal variants
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="p-6">
      <p className="text-[#CCCCCC] text-lg mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="px-4 py-2 bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] hover:text-white border border-[#555555] hover:border-[#666666] rounded-lg transition-all duration-300"
        >
          {cancelText}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="px-4 py-2 bg-[#296CFF] hover:bg-[#2979FF] text-white border border-[#296CFF] hover:border-[#2979FF] rounded-lg shadow-lg shadow-[#296CFF]/30 hover:shadow-[#296CFF]/50 transition-all duration-300"
        >
          {confirmText}
        </motion.button>
      </div>
    </div>
  </Modal>
);

export const AlertModal = ({ isOpen, onClose, title, message, type = "info" }) => {
  const typeStyles = {
    info: { bg: 'bg-[#296CFF]/10', border: 'border-[#296CFF]', text: 'text-[#296CFF]' },
    success: { bg: 'bg-[#00C853]/10', border: 'border-[#00C853]', text: 'text-[#00C853]' },
    error: { bg: 'bg-[#FF4C4C]/10', border: 'border-[#FF4C4C]', text: 'text-[#FF4C4C]' },
    warning: { bg: 'bg-[#FF9800]/10', border: 'border-[#FF9800]', text: 'text-[#FF9800]' }
  };

  const styles = typeStyles[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className={`p-4 rounded-lg ${styles.bg} border ${styles.border} mb-6`}>
          <p className={`text-lg ${styles.text}`}>{message}</p>
        </div>
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-2 bg-[#296CFF] hover:bg-[#2979FF] text-white border border-[#296CFF] hover:border-[#2979FF] rounded-lg shadow-lg shadow-[#296CFF]/30 hover:shadow-[#296CFF]/50 transition-all duration-300"
          >
            OK
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
