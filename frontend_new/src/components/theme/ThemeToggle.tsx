import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types and Interfaces
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  enableCircleBlur?: boolean; // New prop for circle blur effect
}

type Theme = 'light' | 'dark';

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className,
  size = 'md',
  variant = 'ghost',
  showLabel = false,
  enableCircleBlur = true // Enable by default
}) => {
  // State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize theme on component mount
  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    
    setIsDarkMode(shouldUseDark);
    applyTheme(shouldUseDark);
    setMounted(true);
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((isDark: boolean): void => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, []);

  // Enhanced toggle with circle blur animation
  const toggleTheme = useCallback((): void => {
    const newTheme = !isDarkMode;
    
    if (enableCircleBlur) {
      // Inject circle-blur animation from shadcn.io
      const styleId = `theme-transition-${Date.now()}`;
      const style = document.createElement('style');
      style.id = styleId;
      
      const css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.6s ease-out;
            transform-origin: ${showLabel ? 'center' : 'top right'};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${showLabel ? '50% 50%' : '100% 0%'});
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${showLabel ? '50% 50%' : '100% 0%'});
              filter: blur(0);
            }
          }
        }
      `;
      
      style.textContent = css;
      document.head.appendChild(style);
      
      // Clean up after animation
      setTimeout(() => {
        const styleEl = document.getElementById(styleId);
        if (styleEl) styleEl.remove();
      }, 1000);
      
      // Start View Transition if supported
      if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => {
          setIsDarkMode(newTheme);
          applyTheme(newTheme);
        });
      } else {
        setIsDarkMode(newTheme);
        applyTheme(newTheme);
      }
    } else {
      setIsDarkMode(newTheme);
      applyTheme(newTheme);
    }
  }, [isDarkMode, applyTheme, enableCircleBlur, showLabel]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent): void => {
      const savedTheme = localStorage.getItem('theme');
      // Only update if no saved theme preference exists
      if (!savedTheme) {
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 w-8',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      button: 'h-9 w-9',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      button: 'h-10 w-10',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  if (showLabel) {
    return (
      <Button
        onClick={toggleTheme}
        variant={variant}
        className={cn(
          'flex items-center space-x-2 transition-all duration-200 rounded-full',
          'hover:scale-105 active:scale-95',
          className
        )}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <motion.div
          key={isDarkMode ? 'dark' : 'light'}
          initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            rotate: 0
          }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut",
            type: "spring",
            bounce: 0.3
          }}
        >
          {isDarkMode ? (
            <Sun className={cn(config.icon, 'text-amber-500')} />
          ) : (
            <Moon className={cn(config.icon, 'text-blue-600')} />
          )}
        </motion.div>
        <span className={config.text}>
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </span>
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      variant={variant}
      size="sm"
      className={cn(
        config.button,
        'p-0 rounded-full transition-all duration-200 hover:scale-105 active:scale-95',
        'hover:bg-accent/50 relative overflow-hidden',
        className
      )}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={isDarkMode ? 'dark' : 'light'}
        initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          rotate: 0
        }}
        exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
        transition={{ 
          duration: 0.3, 
          ease: "easeOut",
          type: "spring",
          bounce: 0.2
        }}
        className="flex items-center justify-center"
      >
        {isDarkMode ? (
          <Sun className={cn(
            config.icon, 
            'text-amber-500 drop-shadow-sm'
          )} />
        ) : (
          <Moon className={cn(
            config.icon, 
            'text-blue-600 drop-shadow-sm'
          )} />
        )}
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        style={{
          background: isDarkMode 
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)'
        }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </Button>
  );
};

export default ThemeToggle;
