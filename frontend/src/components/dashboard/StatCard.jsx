import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, loading, ...props }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (value !== displayValue && !loading) {
      setIsAnimating(true);
      const duration = 500;
      const start = displayValue;
      const end = value;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
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
    }
  }, [value, displayValue, loading]);

  const colorClasses = {
    electric: 'from-blue-500 to-cyan-400',
    cyan: 'from-cyan-500 to-teal-400',
    purple: 'from-purple-500 to-pink-400',
    violet: 'from-violet-500 to-purple-400'
  };

  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-surface/40 backdrop-blur-sm rounded-xl border border-primary-500/20 p-6 hover:border-accent-400/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-400 text-sm font-medium">{title}</p>
          <motion.p 
            className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
            animate={{ 
              scale: isAnimating ? [1, 1.1, 1] : 1,
              opacity: loading ? 0.5 : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            {loading ? '...' : displayValue.toLocaleString()}
          </motion.p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
