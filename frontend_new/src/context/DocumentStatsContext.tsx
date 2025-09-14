import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    useCallback, 
    useRef,
    ReactNode 
  } from 'react';
  import { DocumentService } from '../services/DocumentService.types';
  import { useWeb3 } from './Web3Context';
  import { toast } from 'sonner';
  import { 
    DocumentStats, 
    ActivityItem, 
    DetailedStats, 
    ConnectionStatus 
  } from '../types/document.types';
  
  // Context Types
  interface DocumentStatsContextType {
    stats: DocumentStats;
    recentActivity: ActivityItem[];
    isLoading: boolean;
    refreshStats: () => void;
    lastUpdate: number;
    connectionStatus: ConnectionStatus;
    error: string | null;
    recoverFromError: () => void;
    getDetailedStats: () => DetailedStats;
    clearError: () => void;
  }
  
  interface DocumentStatsProviderProps {
    children: ReactNode;
  }
  
  // Custom Event Interface
  interface DocumentStatsChangeEvent extends CustomEvent {
    detail?: {
      type?: string;
      data?: unknown;
    };
  }
  
  // Create Context
  const DocumentStatsContext = createContext<DocumentStatsContextType | null>(null);
  
  // Custom Hook
  export const useDocumentStats = (): DocumentStatsContextType => {
    const context = useContext(DocumentStatsContext);
    if (!context) {
      throw new Error('useDocumentStats must be used within a DocumentStatsProvider');
    }
    return context;
  };
  
  // Provider Component
  export const DocumentStatsProvider: React.FC<DocumentStatsProviderProps> = ({ children }) => {
    const { isConnected, provider, signer } = useWeb3();
    
    // State
    const [stats, setStats] = useState<DocumentStats>({
      totalDocuments: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0,
      totalVerifications: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [error, setError] = useState<string | null>(null);
    
    // Refs to prevent infinite loops and manage state
    const refreshInProgress = useRef<boolean>(false);
    const lastRefreshTime = useRef<number>(0);
    const retryCount = useRef<number>(0);
    const maxRetries = 3;
    const mountedRef = useRef<boolean>(true);
  
    // Refresh stats with comprehensive error handling
    const refreshStats = useCallback(async (force: boolean = false): Promise<void> => {
      // Prevent multiple simultaneous refreshes
      if (refreshInProgress.current || !mountedRef.current) {
        return;
      }
      
      // Rate limiting - don't refresh more than once per second
      const now = Date.now();
      if (!force && (now - lastRefreshTime.current) < 1000) {
        return;
      }
      
      refreshInProgress.current = true;
      lastRefreshTime.current = now;
      
      if (mountedRef.current) {
        setIsLoading(true);
        setConnectionStatus('connecting');
        setError(null);
      }
      
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
  
        if (mountedRef.current) {
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
        }
        
        retryCount.current = 0; // Reset retry count on success
        
      } catch (error) {
        console.error('❌ Error refreshing document stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh document statistics';
        
        if (mountedRef.current) {
          setError(errorMessage);
          setConnectionStatus('error');
        }
        
        // Implement retry logic for transient errors
        if (retryCount.current < maxRetries && mountedRef.current) {
          retryCount.current++;
          setTimeout(() => {
            if (mountedRef.current) {
              refreshStats(true);
            }
          }, Math.pow(2, retryCount.current) * 1000); // Exponential backoff
        } else if (retryCount.current >= maxRetries) {
          toast.error('Statistics Update Failed', {
            description: 'Unable to refresh document statistics. Please try again later.',
          });
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        refreshInProgress.current = false;
      }
    }, [provider, signer]);
  
    // Enhanced error recovery
    const recoverFromError = useCallback((): void => {
      if (mountedRef.current) {
        setError(null);
        setConnectionStatus('disconnected');
        retryCount.current = 0;
        refreshStats(true);
        
        toast.info('Recovering Statistics', {
          description: 'Attempting to recover document statistics...',
        });
      }
    }, [refreshStats]);
  
    // Component mount/unmount tracking
    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);
  
    // Initial load only
    useEffect(() => {
      const initializeStats = async (): Promise<void> => {
        try {
          if (mountedRef.current) {
            await refreshStats(true);
          }
        } catch (error) {
          console.error('❌ Error initializing document stats:', error);
          if (mountedRef.current) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize document statistics';
            setError(errorMessage);
            setConnectionStatus('error');
          }
        }
      };
  
      initializeStats();
    }, [refreshStats]);
  
    // Wallet connection changes
    useEffect(() => {
      if (isConnected && mountedRef.current) {
        const timer = setTimeout(() => {
          if (mountedRef.current) {
            refreshStats(true);
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, [isConnected, refreshStats]);
  
    // Listen for document changes with error handling
    useEffect(() => {
      const handleDocumentStatsChange = (event: Event): void => {
        try {
          const customEvent = event as DocumentStatsChangeEvent;
          if (customEvent?.detail && mountedRef.current) {
            const timer = setTimeout(() => {
              if (mountedRef.current) {
                refreshStats(true);
              }
            }, 200);
            
            // Cleanup function
            setTimeout(() => clearTimeout(timer), 300);
          }
        } catch (error) {
          console.error('❌ Error handling document stats change event:', error);
        }
      };
  
      const handleStorageChange = (event: StorageEvent): void => {
        try {
          if (event.storageArea === localStorage && mountedRef.current) {
            refreshStats(true);
          }
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
      if (isConnected && connectionStatus === 'connected' && mountedRef.current) {
        const interval = setInterval(() => {
          try {
            if (mountedRef.current) {
              refreshStats();
            }
          } catch (error) {
            console.error('❌ Error during auto-refresh:', error);
          }
        }, 30000);
  
        return () => clearInterval(interval);
      }
    }, [isConnected, connectionStatus, refreshStats]);
  
    // Handle visibility changes to refresh when tab becomes active
    useEffect(() => {
      const handleVisibilityChange = (): void => {
        try {
          if (!document.hidden && isConnected && mountedRef.current) {
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
    const manualRefresh = useCallback((): void => {
      try {
        refreshStats(true);
        toast.info('Refreshing Statistics', {
          description: 'Updating document statistics...',
        });
      } catch (error) {
        console.error('❌ Error during manual refresh:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh statistics';
        setError(errorMessage);
        toast.error('Refresh Failed', {
          description: errorMessage,
        });
      }
    }, [refreshStats]);
  
    // Get detailed statistics
    const getDetailedStats = useCallback((): DetailedStats => {
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to get detailed statistics';
        
        return {
          ...stats,
          available: false,
          used: 0,
          total: 0,
          lastUpdate,
          connectionStatus: 'error',
          error: errorMessage,
          isLoading
        };
      }
    }, [stats, lastUpdate, connectionStatus, error, isLoading, provider, signer]);
  
    // Clear error state
    const clearError = useCallback((): void => {
      if (mountedRef.current) {
        setError(null);
        if (connectionStatus === 'error') {
          setConnectionStatus('disconnected');
        }
        toast.success('Error Cleared', {
          description: 'Error state has been cleared successfully.',
        });
      }
    }, [connectionStatus]);
  
    // Context value
    const contextValue: DocumentStatsContextType = {
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
  
  export default DocumentStatsProvider;
  