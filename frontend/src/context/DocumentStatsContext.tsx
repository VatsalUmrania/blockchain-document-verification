// import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
// import { useWeb3 } from './Web3Context';

// // Types
// export interface DashboardStats {
//   totalDocuments: number;
//   verifiedDocuments: number;
//   pendingDocuments: number;
//   totalVerifications: number;
// }

// export interface ActivityItem {
//   id: string;
//   type: 'issued' | 'verified' | 'revoked';
//   documentHash: string;
//   documentType: string;
//   title?: string;  // ← ADDED
//   recipientName: string;
//   recipientId?: string;  // ← ADDED
//   issuanceDate?: string | Date;  // ← ADDED
//   timestamp: Date;
//   transactionHash?: string;
//   status: 'active' | 'verified' | 'revoked' | 'expired';
// }

// export interface DocumentStatsContextType {
//   stats: DashboardStats;
//   recentActivity: ActivityItem[];
//   isLoading: boolean;
//   error: string | null;
//   connectionStatus: 'connected' | 'disconnected' | 'error';
//   lastUpdate: number;
//   refreshStats: () => Promise<void>;
//   clearError: () => void;
// }

// // Create Context
// const DocumentStatsContext = createContext<DocumentStatsContextType | undefined>(undefined);

// // Provider Props
// interface DocumentStatsProviderProps {
//   children: ReactNode;
// }

// // Backend API URL
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export const DocumentStatsProvider: React.FC<DocumentStatsProviderProps> = ({ children }) => {
//   const { isConnected, account } = useWeb3();
  
//   const [stats, setStats] = useState<DashboardStats>({
//     totalDocuments: 0,
//     verifiedDocuments: 0,
//     pendingDocuments: 0,
//     totalVerifications: 0
//   });
  
//   const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
//   const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

//   // Get JWT token from localStorage
//   const getAuthToken = (): string | null => {
//     return localStorage.getItem('token');
//   };

//   // Fetch dashboard stats from backend
//   const fetchStats = useCallback(async (): Promise<void> => {
//     if (!isConnected || !account) {
//       console.log('⚠️  Wallet not connected, skipping stats fetch');
//       return;
//     }

//     const token = getAuthToken();
//     if (!token) {
//       console.log('⚠️  No auth token found, skipping stats fetch');
//       setError('Please log in to view dashboard statistics');
//       setConnectionStatus('error');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       console.log('📊 Fetching dashboard stats from backend...');
      
//       // ← CHANGED: Fetch from /documents endpoint instead
//       const response = await fetch(`${API_BASE_URL}/api/dashboard/documents`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           throw new Error('Authentication failed. Please log in again.');
//         }
//         throw new Error(`Failed to fetch stats: ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       console.log('✅ Stats received:', result);

//       if (result.success && result.data && result.data.documents) {
//         const documents = result.data.documents;
        
//         console.log('📋 Documents:', documents);

//         // Calculate stats from documents
//         const totalDocs = documents.length;
//         const verifiedDocs = documents.filter((d: any) => d.status === 'verified').length;
//         const activeDocs = documents.filter((d: any) => d.status === 'active').length;
        
//         setStats({
//           totalDocuments: totalDocs,
//           verifiedDocuments: verifiedDocs,
//           pendingDocuments: activeDocs,
//           totalVerifications: verifiedDocs
//         });

//         // ← UPDATED: Transform documents to ActivityItem with ALL fields
//         const activities: ActivityItem[] = documents.map((doc: any, index: number) => {
//           console.log('📄 Processing doc for activity:', {
//             title: doc.title,
//             recipientName: doc.recipientName,
//             documentType: doc.documentType
//           });

//           return {
//             id: doc.documentHash || `activity-${index}`,
//             type: doc.isRevoked ? 'revoked' : (doc.status === 'verified' ? 'verified' : 'issued'),
//             documentHash: doc.documentHash || '',
//             documentType: doc.documentType || 'other',
//             title: doc.title || 'Untitled Document',  // ← ADDED
//             recipientName: doc.recipientName || 'Unknown',
//             recipientId: doc.recipientId || '',  // ← ADDED
//             issuanceDate: doc.issuanceDate,  // ← ADDED
//             timestamp: new Date(doc.issuanceDate || Date.now()),
//             transactionHash: doc.transactionHash,
//             status: doc.status || 'active'
//           };
//         });
        
//         console.log('✅ Transformed activities:', activities);
//         setRecentActivity(activities);

//         setConnectionStatus('connected');
//         setLastUpdate(Date.now());
//       } else {
//         throw new Error('Invalid response format from backend');
//       }
//     } catch (error: any) {
//       console.error('❌ Error fetching stats:', error);
//       setError(error.message || 'Failed to fetch dashboard data');
//       setConnectionStatus('error');
      
//       // Set default values on error
//       setStats({
//         totalDocuments: 0,
//         verifiedDocuments: 0,
//         pendingDocuments: 0,
//         totalVerifications: 0
//       });
//       setRecentActivity([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isConnected, account]);

//   // Refresh stats (exposed function)
//   const refreshStats = useCallback(async (): Promise<void> => {
//     await fetchStats();
//   }, [fetchStats]);

//   // Clear error
//   const clearError = useCallback((): void => {
//     setError(null);
//   }, []);

//   // Initial fetch when wallet connects
//   useEffect(() => {
//     if (isConnected && account) {
//       console.log('🔌 Wallet connected, fetching initial stats...');
//       fetchStats();
//     } else {
//       console.log('🔌 Wallet disconnected, resetting stats...');
//       setStats({
//         totalDocuments: 0,
//         verifiedDocuments: 0,
//         pendingDocuments: 0,
//         totalVerifications: 0
//       });
//       setRecentActivity([]);
//       setConnectionStatus('disconnected');
//     }
//   }, [isConnected, account, fetchStats]);

//   // Periodic refresh (every 5 minutes)
//   useEffect(() => {
//     if (isConnected && account) {
//       const interval = setInterval(() => {
//         console.log('🔄 Auto-refresh: Fetching stats...');
//         fetchStats();
//       }, 300000); // 5 minutes

//       return () => clearInterval(interval);
//     }
//   }, [isConnected, account, fetchStats]);

//   const value: DocumentStatsContextType = {
//     stats,
//     recentActivity,
//     isLoading,
//     error,
//     connectionStatus,
//     lastUpdate,
//     refreshStats,
//     clearError
//   };

//   return (
//     <DocumentStatsContext.Provider value={value}>
//       {children}
//     </DocumentStatsContext.Provider>
//   );
// };

// // Hook to use the context
// export const useDocumentStats = (): DocumentStatsContextType => {
//   const context = useContext(DocumentStatsContext);
//   if (!context) {
//     throw new Error('useDocumentStats must be used within DocumentStatsProvider');
//   }
//   return context;
// };


// frontend/src/context/DocumentStatsContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';

// Types
export interface DashboardStats {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  totalVerifications: number;
  revoked?: number; // Added revoked
}

export interface ActivityItem {
  id: string;
  type: 'issued' | 'verified' | 'revoked' | 'pending'; // Added pending
  documentHash: string;
  documentType: string;
  title?: string;  
  recipientName: string;
  recipientId?: string;  
  issuanceDate?: string | Date;  
  timestamp: Date;
  transactionHash?: string;
  status: 'active' | 'verified' | 'revoked' | 'expired' | 'pending'; // Added pending
}

export interface DocumentStatsContextType {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastUpdate: number;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

// Create Context
const DocumentStatsContext = createContext<DocumentStatsContextType | undefined>(undefined);

// Provider Props
interface DocumentStatsProviderProps {
  children: ReactNode;
}

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DocumentStatsProvider: React.FC<DocumentStatsProviderProps> = ({ children }) => {
  const { isConnected, account } = useWeb3();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    verifiedDocuments: 0,
    pendingDocuments: 0,
    totalVerifications: 0,
    revoked: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Get JWT token from localStorage
  const getAuthToken = (): string | null => {
    // Use 'token' as per Web3Context
    return localStorage.getItem('token'); 
  };

  // Fetch dashboard stats from backend
  const fetchStats = useCallback(async (): Promise<void> => {
    if (!isConnected || !account) {
      console.log('⚠️  Wallet not connected, skipping stats fetch');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.log('⚠️  No auth token found, skipping stats fetch');
      setError('Please log in to view dashboard statistics');
      setConnectionStatus('error');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching dashboard analytics from backend...');
      
      // --- MODIFICATION: Fetch from /analytics to get stats AND activity in one call ---
      const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Analytics received:', result);

      if (result.success && result.data) {
        
        // --- MODIFICATION: Set stats directly from backend response ---
        const backendStats = result.data.stats;
        setStats({
          totalDocuments: backendStats.totalDocuments || 0,
          verifiedDocuments: backendStats.verified || 0,
          pendingDocuments: backendStats.pending || 0,
          totalVerifications: backendStats.verifications || 0,
          revoked: backendStats.revoked || 0
        });

        // --- MODIFICATION: Set recent activity directly from backend response ---
        const activities: ActivityItem[] = result.data.recentDocuments.map((doc: any, index: number) => ({
          id: doc.hash || `activity-${index}`,
          type: doc.status, // Status from backend is now correct
          documentHash: doc.hash || '',
          documentType: doc.type || 'other',
          title: doc.title || 'Untitled Document',  
          recipientName: doc.recipient || 'Unknown',
          issuanceDate: doc.issuanceDate,  
          timestamp: new Date(doc.issuanceDate || Date.now()),
          transactionHash: doc.transactionHash,
          status: doc.status || 'pending'
        }));
        
        console.log('✅ Transformed activities:', activities);
        setRecentActivity(activities);

        setConnectionStatus('connected');
        setLastUpdate(Date.now());
      } else {
        throw new Error(result.error || 'Invalid response format from backend');
      }
    } catch (error: any) {
      console.error('❌ Error fetching stats:', error);
      setError(error.message || 'Failed to fetch dashboard data');
      setConnectionStatus('error');
      
      // Set default values on error
      setStats({
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0,
        totalVerifications: 0,
        revoked: 0
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  // Refresh stats (exposed function)
  const refreshStats = useCallback(async (): Promise<void> => {
    await fetchStats();
  }, [fetchStats]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Initial fetch when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      console.log('🔌 Wallet connected, fetching initial stats...');
      fetchStats();
    } else {
      console.log('🔌 Wallet disconnected, resetting stats...');
      setStats({
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0,
        totalVerifications: 0,
        revoked: 0
      });
      setRecentActivity([]);
      setConnectionStatus('disconnected');
    }
  }, [isConnected, account, fetchStats]);

  // Periodic refresh (every 5 minutes)
  useEffect(() => {
    if (isConnected && account) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refresh: Fetching stats...');
        fetchStats();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isConnected, account, fetchStats]);

  const value: DocumentStatsContextType = {
    stats,
    recentActivity,
    isLoading,
    error,
    connectionStatus,
    lastUpdate,
    refreshStats,
    clearError
  };

  return (
    <DocumentStatsContext.Provider value={value}>
      {children}
    </DocumentStatsContext.Provider>
  );
};

// Hook to use the context
export const useDocumentStats = (): DocumentStatsContextType => {
  const context = useContext(DocumentStatsContext);
  if (!context) {
    throw new Error('useDocumentStats must be used within DocumentStatsProvider');
  }
  return context;
};