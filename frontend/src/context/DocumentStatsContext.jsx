// context/DocumentStatsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import DocumentService from '../services/DocumentService';
import { useWeb3 } from './Web3Context';

const DocumentStatsContext = createContext();

export const useDocumentStats = () => {
  const context = useContext(DocumentStatsContext);
  if (!context) {
    throw new Error('useDocumentStats must be used within a DocumentStatsProvider');
  }
  return context;
};

export const DocumentStatsProvider = ({ children }) => {
  const { isConnected, provider, signer } = useWeb3();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    verifiedDocuments: 0,
    pendingDocuments: 0,
    totalVerifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  
  // Use ref to prevent infinite loops
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(0);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const refreshStats = useCallback(async (force = false) => {
    // Prevent multiple simultaneous refreshes
    if (refreshInProgress.current) {
      return;
    }
    
    // Rate limiting - don't refresh more than once per second
    const now = Date.now();
    if (!force && (now - lastRefreshTime.current) < 1000) {
      return;
    }
    
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    setIsLoading(true);
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      const documentService = new DocumentService(provider || null, signer || null);
      
      // Check if localStorage is available
      if (!documentService.isStorageAvailable()) {
        throw new Error('localStorage is not available');
      }

      const updatedStats = documentService.getDocumentStats();
      const updatedActivity = documentService.getRecentActivity(10);
      
      // Validate stats before updating
      if (typeof updatedStats !== 'object' || updatedStats === null) {
        throw new Error('Invalid stats data received');
      }

      // Only update if stats actually changed
      setStats(prevStats => {
        const hasChanged = JSON.stringify(prevStats) !== JSON.stringify(updatedStats);
        if (hasChanged) {
          return { ...updatedStats };
        }
        return prevStats;
      });
      
      setRecentActivity([...updatedActivity]);
      setLastUpdate(now);
      setConnectionStatus('connected');
      retryCount.current = 0; // Reset retry count on success
      
    } catch (error) {
      console.error('❌ Error refreshing document stats:', error);
      setError(error.message || 'Failed to refresh document statistics');
      setConnectionStatus('error');
      
      // Implement retry logic for transient errors
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        setTimeout(() => {
          refreshStats(true);
        }, Math.pow(2, retryCount.current) * 1000); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
      refreshInProgress.current = false;
    }
  }, [provider, signer]);

  // Enhanced error recovery
  const recoverFromError = useCallback(() => {
    setError(null);
    setConnectionStatus('disconnected');
    retryCount.current = 0;
    refreshStats(true);
  }, [refreshStats]);

  // Initial load only
  useEffect(() => {
    let mounted = true;
    
    const initializeStats = async () => {
      try {
        if (mounted) {
          await refreshStats(true);
        }
      } catch (error) {
        console.error('❌ Error initializing document stats:', error);
        if (mounted) {
          setError('Failed to initialize document statistics');
          setConnectionStatus('error');
        }
      }
    };

    initializeStats();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Wallet connection changes
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        refreshStats(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, refreshStats]);

  // Listen for document changes with error handling
  useEffect(() => {
    const handleDocumentStatsChange = (event) => {
      try {
        if (event && event.detail) {
          const timer = setTimeout(() => {
            refreshStats(true);
          }, 200);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('❌ Error handling document stats change event:', error);
      }
    };

    const handleStorageChange = () => {
      try {
        refreshStats(true);
      } catch (error) {
        console.error('❌ Error handling storage change event:', error);
      }
    };

    // Listen for custom events
    window.addEventListener('documentStatsChanged', handleDocumentStatsChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('documentStatsChanged', handleDocumentStatsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshStats]);

  // Auto-refresh every 30 seconds when connected
  useEffect(() => {
    if (isConnected && connectionStatus === 'connected') {
      const interval = setInterval(() => {
        try {
          refreshStats();
        } catch (error) {
          console.error('❌ Error during auto-refresh:', error);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, connectionStatus, refreshStats]);

  // Handle visibility changes to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      try {
        if (!document.hidden && isConnected) {
          refreshStats();
        }
      } catch (error) {
        console.error('❌ Error handling visibility change:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, refreshStats]);

  // Manual refresh with error handling
  const manualRefresh = useCallback(() => {
    try {
      refreshStats(true);
    } catch (error) {
      console.error('❌ Error during manual refresh:', error);
      setError('Failed to refresh statistics');
    }
  }, [refreshStats]);

  // Get detailed statistics
  const getDetailedStats = useCallback(() => {
    try {
      const documentService = new DocumentService(provider || null, signer || null);
      const storageInfo = documentService.getStorageInfo();
      
      return {
        ...stats,
        ...storageInfo,
        lastUpdate,
        connectionStatus,
        error,
        isLoading
      };
    } catch (error) {
      console.error('❌ Error getting detailed stats:', error);
      return {
        ...stats,
        available: false,
        error: error.message
      };
    }
  }, [stats, lastUpdate, connectionStatus, error, isLoading, provider, signer]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    if (connectionStatus === 'error') {
      setConnectionStatus('disconnected');
    }
  }, [connectionStatus]);

  const contextValue = {
    stats,
    recentActivity,
    isLoading,
    refreshStats: manualRefresh,
    lastUpdate,
    connectionStatus,
    error,
    recoverFromError,
    getDetailedStats,
    clearError
  };

  return (
    <DocumentStatsContext.Provider value={contextValue}>
      {children}
    </DocumentStatsContext.Provider>
  );
};
