import api from './api';

// This interface defines the shape of the data we expect from the backend
export interface DashboardStats {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number; // Corresponds to revoked documents on the backend
}

/**
 * Fetches dashboard statistics from the secure /api/dashboard/stats endpoint.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error; // Re-throw the error to be handled by the custom hook
  }
};