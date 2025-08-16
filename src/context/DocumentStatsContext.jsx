// // context/DocumentStatsContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import DocumentService from '../services/DocumentService';
// import { useWeb3 } from './Web3Context';

// const DocumentStatsContext = createContext();

// export const useDocumentStats = () => {
//   const context = useContext(DocumentStatsContext);
//   if (!context) {
//     throw new Error('useDocumentStats must be used within a DocumentStatsProvider');
//   }
//   return context;
// };

// export const DocumentStatsProvider = ({ children }) => {
//   const { isConnected, provider, signer } = useWeb3();
//   const [stats, setStats] = useState({
//     totalDocuments: 0,
//     verifiedDocuments: 0,
//     pendingDocuments: 0,
//     totalVerifications: 0
//   });
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(Date.now());

//   // Stable refreshStats function with minimal dependencies
//   const refreshStats = useCallback(async () => {
//     console.log('🔄 refreshStats called');
//     setIsLoading(true);
    
//     try {
//       const documentService = new DocumentService(provider || null, signer || null);
//       const updatedStats = documentService.getDocumentStats();
//       const updatedActivity = documentService.getRecentActivity(10);
      
//       setStats(prevStats => {
//         // Only update if stats actually changed to prevent unnecessary re-renders
//         const hasChanged = JSON.stringify(prevStats) !== JSON.stringify(updatedStats);
//         if (hasChanged) {
//           console.log('📊 Stats changed, updating state');
//           return { ...updatedStats };
//         }
//         return prevStats;
//       });
      
//       setRecentActivity(updatedActivity);
//       setLastUpdate(Date.now());
      
//     } catch (error) {
//       console.error('❌ Error refreshing stats:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [provider, signer]); // Only depend on provider and signer

//   // Load stats on wallet connection change - NO refreshStats dependency
//   useEffect(() => {
//     console.log('🔄 Wallet connection changed, loading stats...');
//     refreshStats();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isConnected, provider, signer]); // Don't include refreshStats here

//   // Listen for document changes - stable event listener
//   useEffect(() => {
//     const handleDocumentStatsChange = () => {
//       console.log('📊 Document stats change event received');
//       setTimeout(() => refreshStats(), 100); // Small delay to ensure localStorage write completes
//     };

//     window.addEventListener('documentStatsChanged', handleDocumentStatsChange);
    
//     return () => {
//       window.removeEventListener('documentStatsChanged', handleDocumentStatsChange);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Empty dependency array - setup only once

//   const contextValue = {
//     stats,
//     recentActivity,
//     isLoading,
//     refreshStats,
//     lastUpdate
//   };

//   return (
//     <DocumentStatsContext.Provider value={contextValue}>
//       {children}
//     </DocumentStatsContext.Provider>
//   );
// };


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
  
  // Use ref to prevent infinite loops
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(0);

  const refreshStats = useCallback(async (force = false) => {
    // Prevent multiple simultaneous refreshes
    if (refreshInProgress.current) {
      console.log('📊 Refresh already in progress, skipping...');
      return;
    }
    
    // Rate limiting - don't refresh more than once per second
    const now = Date.now();
    if (!force && (now - lastRefreshTime.current) < 1000) {
      console.log('📊 Rate limited, skipping refresh');
      return;
    }
    
    refreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    console.log('📊 refreshStats called at:', new Date().toLocaleTimeString());
    setIsLoading(true);
    
    try {
      const documentService = new DocumentService(provider || null, signer || null);
      const updatedStats = documentService.getDocumentStats();
      const updatedActivity = documentService.getRecentActivity(10);
      
      console.log('📊 Computed stats:', updatedStats);
      
      // Only update if stats actually changed
      setStats(prevStats => {
        const hasChanged = JSON.stringify(prevStats) !== JSON.stringify(updatedStats);
        if (hasChanged) {
          console.log('📊 Stats changed, updating state');
          return { ...updatedStats };
        }
        console.log('📊 Stats unchanged, keeping previous state');
        return prevStats;
      });
      
      setRecentActivity([...updatedActivity]);
      setLastUpdate(now);
      
    } catch (error) {
      console.error('❌ Error refreshing stats:', error);
    } finally {
      setIsLoading(false);
      refreshInProgress.current = false;
    }
  }, [provider, signer]);

  // Initial load only
  useEffect(() => {
    console.log('📊 DocumentStatsContext mounted, loading initial data...');
    refreshStats(true);
  }, []);

  // Wallet connection changes
  useEffect(() => {
    if (isConnected) {
      console.log('🔄 Wallet connected, refreshing stats...');
      setTimeout(() => refreshStats(true), 100);
    }
  }, [isConnected, refreshStats]);

  // Listen for document changes
  useEffect(() => {
    const handleDocumentStatsChange = (event) => {
      console.log('📊 Document stats change event received:', event.detail);
      setTimeout(() => refreshStats(true), 200);
    };

    window.addEventListener('documentStatsChanged', handleDocumentStatsChange);
    
    return () => {
      window.removeEventListener('documentStatsChanged', handleDocumentStatsChange);
    };
  }, [refreshStats]);

  const contextValue = {
    stats,
    recentActivity,
    isLoading,
    refreshStats: () => refreshStats(true),
    lastUpdate
  };

  return (
    <DocumentStatsContext.Provider value={contextValue}>
      {children}
    </DocumentStatsContext.Provider>
  );
};
