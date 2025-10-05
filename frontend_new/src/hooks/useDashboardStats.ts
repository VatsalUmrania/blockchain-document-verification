import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, DashboardStats } from '../services/dashboardService';
import { useWeb3 } from '../context/Web3Context';

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const { isAuthenticated } = useWeb3();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    // Only fetch if the user is authenticated
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedStats = await getDashboardStats();
      setStats(fetchedStats);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching stats.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refreshStats: fetchStats };
};