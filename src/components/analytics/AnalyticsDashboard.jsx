import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  DocumentIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';

const AnalyticsDashboard = () => {
  const { account, isConnected } = useWeb3();
  const [analytics, setAnalytics] = useState({
    totalDocuments: 0,
    totalVerifications: 0,
    successRate: 0,
    averageFileSize: 0,
    monthlyTrends: [],
    categoryBreakdown: [],
    recentActivity: []
  });
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadAnalytics();
    }
  }, [isConnected, timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with real blockchain/backend data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnalytics = {
        totalDocuments: 156,
        totalVerifications: 423,
        successRate: 94.2,
        averageFileSize: 2.4,
        monthlyTrends: [
          { month: 'Jan', uploads: 12, verifications: 45 },
          { month: 'Feb', uploads: 19, verifications: 67 },
          { month: 'Mar', uploads: 23, verifications: 89 },
          { month: 'Apr', uploads: 31, verifications: 102 },
          { month: 'May', uploads: 28, verifications: 98 },
          { month: 'Jun', uploads: 43, verifications: 134 }
        ],
        categoryBreakdown: [
          { category: 'Legal', count: 45, percentage: 28.8 },
          { category: 'Financial', count: 38, percentage: 24.4 },
          { category: 'Medical', count: 32, percentage: 20.5 },
          { category: 'Educational', count: 25, percentage: 16.0 },
          { category: 'General', count: 16, percentage: 10.3 }
        ],
        recentActivity: [
          { type: 'upload', count: 12, change: +15.3 },
          { type: 'verification', count: 34, change: +8.7 },
          { type: 'success_rate', count: 94.2, change: +2.1 }
        ]
      };

      setAnalytics(mockAnalytics);
      toast.success('Analytics loaded successfully');
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card bg-gradient-to-r from-white to-gray-50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUpIcon className={`w-4 h-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="card">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Connect your wallet to view detailed analytics</p>
        </div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your document activity</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Documents"
            value={analytics.totalDocuments}
            change={analytics.recentActivity[0]?.change}
            icon={DocumentIcon}
            color="blue"
          />
          <StatCard
            title="Total Verifications"
            value={analytics.totalVerifications}
            change={analytics.recentActivity[1]?.change}
            icon={ChartBarIcon}
            color="green"
          />
          <StatCard
            title="Success Rate"
            value={`${analytics.successRate}%`}
            change={analytics.recentActivity[2]?.change}
            icon={TrendingUpIcon}
            color="purple"
          />
          <StatCard
            title="Avg File Size"
            value={`${analytics.averageFileSize}MB`}
            icon={ClockIcon}
            color="yellow"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
            <div className="space-y-4">
              {analytics.monthlyTrends.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Uploads: {item.uploads}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Verifications: {item.verifications}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Document Categories</h3>
            <div className="space-y-3">
              {analytics.categoryBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-600">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Export Analytics</h3>
          <div className="flex space-x-4">
            <Button onClick={() => toast.info('Exporting to CSV...')}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => toast.info('Exporting to PDF...')}>
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => toast.info('Scheduling report...')}>
              Schedule Report
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
