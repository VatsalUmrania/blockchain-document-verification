// src/components/theme/ThemeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="theme-toggle group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{
          background: theme === 'light' 
            ? 'linear-gradient(45deg, #f59e0b, #f97316)' 
            : 'linear-gradient(45deg, #3b82f6, #8b5cf6)'
        }}
      />
      
      {/* Toggle Thumb */}
      <motion.div
        className="theme-toggle-thumb"
        animate={{
          x: theme === 'dark' ? 28 : 2,
          rotate: theme === 'dark' ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0, scale: 0 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          {theme === 'light' ? (
            <SunIcon className="w-3 h-3 text-yellow-600" />
          ) : (
            <MoonIcon className="w-3 h-3 text-blue-400" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
