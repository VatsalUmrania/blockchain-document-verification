import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  PresentationChartLineIcon,
  WalletIcon,
  ArrowPathIcon,
  LinkIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';
import { useDocumentStats } from '../../context/DocumentStatsContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import Button from '../common/Button';

const Dashboard = () => {
  const { isConnected, account, balance } = useWeb3();
  const { stats, recentActivity, isLoading, refreshStats, lastUpdate, connectionStatus } = useDocumentStats();

  // Debug logging
  useEffect(() => {
    console.log('📊 Dashboard stats updated:', stats);
    console.log('📊 Connection status:', connectionStatus);
  }, [stats, connectionStatus]);

  // Manual refresh function
  const handleRefreshStats = async () => {
    console.log('🔄 Manual refresh triggered');
    try {
      await refreshStats();
      toast.success('📊 Dashboard refreshed successfully!', {
        icon: '🔄'
      });
    } catch (error) {
      toast.error('❌ Failed to refresh dashboard', {
        icon: '⚠️'
      });
    }
  };

  // Auto-refresh every 30 seconds when connected
  useEffect(() => {
    if (isConnected && account) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing Dashboard...');
        refreshStats();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, account, refreshStats]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 bg-[rgb(var(--surface-primary))] rounded-2xl flex items-center justify-center mx-auto mb-8 border-2 border-[rgb(var(--border-primary))] shadow-lg"
          >
            <WalletIcon className="w-12 h-12 text-[rgb(var(--color-primary))]" />
          </motion.div>
          <h2 className="text-4xl font-bold text-[rgb(var(--text-primary))] mb-4">Connect Your Wallet</h2>
          <p className="text-[rgb(var(--text-secondary))] mb-12 max-w-md mx-auto text-lg">
            Connect your MetaMask wallet to access your MongoDB-powered document verification dashboard with real-time sync.
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-[rgb(var(--text-quaternary))]">
            <div className="flex items-center space-x-2">
              <ServerIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span>MongoDB Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
              <span>Secure Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-bold mb-4"
            style={{
              background: `rgb(var(--color-primary))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Document Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[rgb(var(--text-secondary))] text-xl mb-6"
          >
            Track your verified documents with MongoDB persistence and blockchain security
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 items-start lg:items-center flex-wrap"
          >
            {/* Wallet Info */}
            <div className="flex items-center space-x-2 bg-[rgb(var(--surface-primary))] px-4 py-2 rounded-xl border border-[rgb(var(--border-primary))]">
              <WalletIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span className="text-[rgb(var(--color-primary))] font-mono text-sm">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
            
            {/* Balance */}
            <div className="flex items-center space-x-2 text-sm text-[rgb(var(--text-secondary))]">
              <span className="font-medium">Balance:</span>
              <span className="text-[rgb(var(--color-success))] font-mono">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 text-xs px-3 py-1 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] border border-[rgb(var(--color-success)/0.3)]' :
              connectionStatus === 'error' 
                ? 'bg-[rgb(var(--color-error)/0.2)] text-[rgb(var(--color-error))] border border-[rgb(var(--color-error)/0.3)]' : 
                'bg-[rgb(var(--surface-secondary))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-primary))]'
            }`}>
              {connectionStatus === 'connected' ? (
                <>
                  <ServerIcon className="w-3 h-3" />
                  <span>MongoDB Connected</span>
                </>
              ) : connectionStatus === 'error' ? (
                <>
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span>Database Error</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
            
            {/* Last Update */}
            <div className="flex items-center space-x-2 text-xs text-[rgb(var(--text-quaternary))]">
              <ArrowPathIcon className="w-3 h-3" />
              <span>Updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        </div>

        {/* Connection Error Alert */}
        {connectionStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--color-error)/0.1)] border-l-4 border-[rgb(var(--color-error))] p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-[rgb(var(--color-error))] mr-3" />
                <div>
                  <p className="text-[rgb(var(--color-error))] font-semibold">
                    MongoDB Connection Issue
                  </p>
                  <p className="text-[rgb(var(--text-secondary))] text-sm mt-1">
                    Unable to connect to database. Please check if the backend server is running.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRefreshStats}
                variant="danger"
                size="sm"
                icon={ArrowPathIcon}
              >
                Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={DocumentIcon}
            color="primary"
            loading={isLoading}
            subtitle="Stored in MongoDB"
          />
          <StatCard
            title="Verified"
            value={stats.verifiedDocuments}
            icon={CheckCircleIcon}
            color="success"
            loading={isLoading}
            subtitle="Successfully verified"
            change={stats.verifiedDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}
            changeType="percentage"
          />
          <StatCard
            title="Pending"
            value={stats.pendingDocuments}
            icon={ClockIcon}
            color="warning"
            loading={isLoading}
            subtitle="Awaiting verification"
          />
          <StatCard
            title="Verifications"
            value={stats.totalVerifications}
            icon={ChartBarIcon}
            color="purple"
            loading={isLoading}
            subtitle="Total verification events"
          />
        </motion.div>

        {/* Content Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ActivityFeed 
              activities={recentActivity} 
              loading={isLoading}
              emptyMessage="No document activity yet. Upload or verify documents to see activity here."
            />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                <PresentationChartLineIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Quick Actions</h3>
            </div>
            <div className="space-y-4">
              {/* Upload Document */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/upload'}
                className="w-full p-4 text-left bg-[rgb(var(--color-primary)/0.1)] hover:bg-[rgb(var(--color-primary)/0.2)] rounded-xl transition-all duration-300 border border-[rgb(var(--color-primary)/0.3)] hover:border-[rgb(var(--color-primary))] group shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-[rgb(var(--color-primary)/0.2)] group-hover:bg-[rgb(var(--color-primary)/0.3)] transition-colors border border-[rgb(var(--color-primary)/0.3)]">
                    <CloudArrowUpIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[rgb(var(--color-primary))] text-lg">Upload Document</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">Store securely in MongoDB</div>
                  </div>
                </div>
              </motion.button>

              {/* Verify Document */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/verify'}
                className="w-full p-4 text-left bg-[rgb(var(--color-success)/0.1)] hover:bg-[rgb(var(--color-success)/0.2)] rounded-xl transition-all duration-300 border border-[rgb(var(--color-success)/0.3)] hover:border-[rgb(var(--color-success))] group shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-[rgb(var(--color-success)/0.2)] group-hover:bg-[rgb(var(--color-success)/0.3)] transition-colors border border-[rgb(var(--color-success)/0.3)]">
                    <ShieldCheckIcon className="w-5 h-5 text-[rgb(var(--color-success))]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[rgb(var(--color-success))] text-lg">Verify Document</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">Check authenticity & update status</div>
                  </div>
                </div>
              </motion.button>

              {/* Browse Documents */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/dashboard'}
                className="w-full p-4 text-left bg-[rgb(var(--text-quaternary)/0.1)] hover:bg-[rgb(var(--text-quaternary)/0.2)] rounded-xl transition-all duration-300 border border-[rgb(var(--text-quaternary)/0.3)] hover:border-[rgb(var(--text-quaternary))] group shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-[rgb(var(--text-quaternary)/0.2)] group-hover:bg-[rgb(var(--text-quaternary)/0.3)] transition-colors border border-[rgb(var(--text-quaternary)/0.3)]">
                    <EyeIcon className="w-5 h-5 text-[rgb(var(--text-quaternary))]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[rgb(var(--text-quaternary))] text-lg">Browse Documents</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">View all uploaded documents</div>
                  </div>
                </div>
              </motion.button>

              {/* Refresh Data */}
              <Button
                onClick={handleRefreshStats}
                disabled={isLoading}
                variant="secondary"
                size="sm"
                fullWidth
                icon={ArrowPathIcon}
                className="h-16 justify-start text-left"
              >
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg">
                    {isLoading ? 'Refreshing...' : 'Refresh MongoDB'}
                  </div>
                  <div className="text-sm opacity-70">
                    Update statistics from database
                  </div>
                </div>
              </Button>

              {/* Database Status */}
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                connectionStatus === 'connected'
                  ? 'border-[rgb(var(--color-success)/0.3)] bg-[rgb(var(--color-success)/0.1)]'
                  : 'border-[rgb(var(--border-primary))] bg-[rgb(var(--surface-primary))]'
              }`}>
                <div className="flex items-center space-x-3">
                  <ServerIcon className={`w-5 h-5 ${
                    connectionStatus === 'connected' ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--text-quaternary))]'
                  }`} />
                  <div>
                    <div className={`font-semibold ${
                      connectionStatus === 'connected' ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--text-quaternary))]'
                    }`}>
                      MongoDB Status
                    </div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                      {connectionStatus === 'connected' ? 'Database connected' : 'Database offline'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {stats.totalDocuments > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Analytics Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-[rgb(var(--color-primary)/0.1)] rounded-xl border border-[rgb(var(--color-primary)/0.3)]">
                <div className="text-3xl font-bold text-[rgb(var(--color-primary))] mb-2">
                  {stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}%
                </div>
                <div className="text-sm text-[rgb(var(--text-secondary))]">Verification Rate</div>
              </div>
              <div className="text-center p-6 bg-[rgb(var(--color-success)/0.1)] rounded-xl border border-[rgb(var(--color-success)/0.3)]">
                <div className="text-3xl font-bold text-[rgb(var(--color-success))] mb-2">
                  {recentActivity.length}
                </div>
                <div className="text-sm text-[rgb(var(--text-secondary))]">Recent Activities</div>
              </div>
              <div className="text-center p-6 bg-[rgba(147,51,234,0.1)] rounded-xl border border-[rgba(147,51,234,0.3)]">
                <div className="text-3xl font-bold text-[rgb(147,51,234)] mb-2">
                  {new Date(lastUpdate).toLocaleDateString()}
                </div>
                <div className="text-sm text-[rgb(var(--text-secondary))]">Last Sync Date</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
