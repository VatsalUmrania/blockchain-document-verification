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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';
import { useDocumentStats } from '../../context/DocumentStatsContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';

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
            className="w-24 h-24 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto mb-8 border-2 border-[#333333] shadow-lg"
          >
            <WalletIcon className="w-12 h-12 text-[#296CFF]" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-[#999999] mb-12 max-w-md mx-auto text-lg">
            Connect your MetaMask wallet to access your MongoDB-powered document verification dashboard with real-time sync.
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-[#666666]">
            <div className="flex items-center space-x-2">
              <ServerIcon className="w-4 h-4 text-[#296CFF]" />
              <span>MongoDB Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#00C853]" />
              <span>Secure Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-[#296CFF]" />
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
            className="text-5xl font-bold bg-gradient-to-r from-[#296CFF] to-[#00C853] bg-clip-text text-transparent mb-4"
          >
            Document Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#CCCCCC] text-xl mb-6"
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
            <div className="flex items-center space-x-2 bg-[#1A1A1A] px-4 py-2 rounded-xl border border-[#333333]">
              <WalletIcon className="w-4 h-4 text-[#296CFF]" />
              <span className="text-[#296CFF] font-mono text-sm">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
            
            {/* Balance */}
            <div className="flex items-center space-x-2 text-sm text-[#999999]">
              <span className="font-medium">Balance:</span>
              <span className="text-[#00C853] font-mono">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 text-xs px-3 py-1 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30' :
              connectionStatus === 'error' 
                ? 'bg-[#FF4C4C]/20 text-[#FF4C4C] border border-[#FF4C4C]/30' : 
                'bg-[#333333] text-[#999999] border border-[#444444]'
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
            <div className="flex items-center space-x-2 text-xs text-[#666666]">
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
            className="bg-[#FF4C4C]/10 border-l-4 border-[#FF4C4C] p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-[#FF4C4C] mr-3" />
                <div>
                  <p className="text-[#FF4C4C] font-semibold">
                    MongoDB Connection Issue
                  </p>
                  <p className="text-[#999999] text-sm mt-1">
                    Unable to connect to database. Please check if the backend server is running.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefreshStats}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#FF4C4C]/20 hover:bg-[#FF4C4C]/30 text-[#FF4C4C] rounded-lg border border-[#FF4C4C]/30 hover:border-[#FF4C4C] transition-all duration-300"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Retry</span>
              </button>
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
            color="electric"
            loading={isLoading}
            subtitle="Stored in MongoDB"
          />
          <StatCard
            title="Verified"
            value={stats.verifiedDocuments}
            icon={CheckCircleIcon}
            color="cyan"
            loading={isLoading}
            subtitle="Successfully verified"
          />
          <StatCard
            title="Pending"
            value={stats.pendingDocuments}
            icon={ClockIcon}
            color="purple"
            loading={isLoading}
            subtitle="Awaiting verification"
          />
          <StatCard
            title="Verifications"
            value={stats.totalVerifications}
            icon={ChartBarIcon}
            color="violet"
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
              <PresentationChartLineIcon className="w-5 h-5 text-[#296CFF]" />
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-4">
              {/* Upload Document */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/upload'}
                className="w-full p-4 text-left bg-[#296CFF]/10 hover:bg-[#296CFF]/20 rounded-xl transition-all duration-300 border border-[#296CFF]/30 hover:border-[#296CFF] group shadow-lg hover:shadow-[#296CFF]/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-[#296CFF]/20 group-hover:bg-[#296CFF]/30 transition-colors border border-[#296CFF]/30">
                    <CloudArrowUpIcon className="w-5 h-5 text-[#296CFF]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#296CFF] text-lg">Upload Document</div>
                    <div className="text-sm text-[#999999]">Store securely in MongoDB</div>
                  </div>
                </div>
              </motion.button>

              {/* Verify Document */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/verify'}
                className="w-full p-4 text-left bg-[#00C853]/10 hover:bg-[#00C853]/20 rounded-xl transition-all duration-300 border border-[#00C853]/30 hover:border-[#00C853] group shadow-lg hover:shadow-[#00C853]/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-[#00C853]/20 group-hover:bg-[#00C853]/30 transition-colors border border-[#00C853]/30">
                    <ShieldCheckIcon className="w-5 h-5 text-[#00C853]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#00C853] text-lg">Verify Document</div>
                    <div className="text-sm text-[#999999]">Check authenticity & update status</div>
                  </div>
                </div>
              </motion.button>

              {/* Refresh Data */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefreshStats}
                disabled={isLoading}
                className={`w-full p-4 text-left rounded-xl transition-all duration-300 border group shadow-lg ${
                  isLoading
                    ? 'bg-[#333333]/50 border-[#444444] cursor-not-allowed opacity-50'
                    : 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border-[#8B5CF6]/30 hover:border-[#8B5CF6] hover:shadow-[#8B5CF6]/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg transition-colors border ${
                    isLoading
                      ? 'bg-[#333333] border-[#444444]'
                      : 'bg-[#8B5CF6]/20 group-hover:bg-[#8B5CF6]/30 border-[#8B5CF6]/30'
                  }`}>
                    <ArrowPathIcon className={`w-5 h-5 ${
                      isLoading 
                        ? 'text-[#666666] animate-spin' 
                        : 'text-[#8B5CF6]'
                    }`} />
                  </div>
                  <div>
                    <div className={`font-semibold text-lg ${
                      isLoading ? 'text-[#666666]' : 'text-[#8B5CF6]'
                    }`}>
                      {isLoading ? 'Refreshing...' : 'Refresh MongoDB'}
                    </div>
                    <div className="text-sm text-[#999999]">
                      Update statistics from database
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Database Status */}
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                connectionStatus === 'connected'
                  ? 'border-[#00C853]/30 bg-[#00C853]/10'
                  : 'border-[#333333] bg-[#1A1A1A]'
              }`}>
                <div className="flex items-center space-x-3">
                  <ServerIcon className={`w-5 h-5 ${
                    connectionStatus === 'connected' ? 'text-[#00C853]' : 'text-[#666666]'
                  }`} />
                  <div>
                    <div className={`font-semibold ${
                      connectionStatus === 'connected' ? 'text-[#00C853]' : 'text-[#666666]'
                    }`}>
                      MongoDB Status
                    </div>
                    <div className="text-sm text-[#999999]">
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
              <ChartBarIcon className="w-5 h-5 text-[#296CFF]" />
              <h3 className="text-lg font-semibold text-white">Analytics Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-[#296CFF]/10 rounded-xl border border-[#296CFF]/30">
                <div className="text-3xl font-bold text-[#296CFF] mb-2">
                  {stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}%
                </div>
                <div className="text-sm text-[#999999]">Verification Rate</div>
              </div>
              <div className="text-center p-6 bg-[#00C853]/10 rounded-xl border border-[#00C853]/30">
                <div className="text-3xl font-bold text-[#00C853] mb-2">
                  {recentActivity.length}
                </div>
                <div className="text-sm text-[#999999]">Recent Activities</div>
              </div>
              <div className="text-center p-6 bg-[#8B5CF6]/10 rounded-xl border border-[#8B5CF6]/30">
                <div className="text-3xl font-bold text-[#8B5CF6] mb-2">
                  {new Date(lastUpdate).toLocaleDateString()}
                </div>
                <div className="text-sm text-[#999999]">Last Sync Date</div>
              </div>
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};

export default Dashboard;
