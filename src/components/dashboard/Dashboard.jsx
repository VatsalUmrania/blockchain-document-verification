import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';

const Dashboard = () => {
  const { isConnected, account } = useWeb3();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    verifiedDocuments: 0,
    pendingDocuments: 0,
    totalVerifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadDashboardData();
    }
  }, [isConnected, account]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to load dashboard data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from your backend/blockchain
      const mockStats = {
        totalDocuments: 24,
        verifiedDocuments: 20,
        pendingDocuments: 4,
        totalVerifications: 156
      };

      const mockActivity = [
        {
          id: 1,
          type: 'upload',
          message: 'Document "Contract_2024.pdf" uploaded successfully',
          timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
          hash: '0x123...abc'
        },
        {
          id: 2,
          type: 'verification',
          message: 'Document verified by 0x456...def',
          timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
          hash: '0x789...ghi'
        },
        {
          id: 3,
          type: 'upload',
          message: 'Document "Invoice_001.pdf" uploaded successfully',
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
          hash: '0xabc...123'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your document dashboard
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's an overview of your document activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={DocumentIcon}
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Verified"
            value={stats.verifiedDocuments}
            icon={CheckCircleIcon}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Pending"
            value={stats.pendingDocuments}
            icon={ClockIcon}
            color="yellow"
            loading={isLoading}
          />
          <StatCard
            title="Total Verifications"
            value={stats.totalVerifications}
            icon={ChartBarIcon}
            color="purple"
            loading={isLoading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={recentActivity} loading={isLoading} />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => toast.info('Navigate to Upload page')}
                className="w-full p-3 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-primary-700">Upload Document</div>
                <div className="text-sm text-primary-600">Add new documents to blockchain</div>
              </button>
              <button
                onClick={() => toast.info('Navigate to Verify page')}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-700">Verify Document</div>
                <div className="text-sm text-green-600">Check document authenticity</div>
              </button>
              <button
                onClick={() => toast.info('Feature coming soon!')}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-700">View Analytics</div>
                <div className="text-sm text-gray-600">Detailed usage statistics</div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
