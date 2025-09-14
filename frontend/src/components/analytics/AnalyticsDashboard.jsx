
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  DocumentIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useWeb3 } from '../../context/Web3Context';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

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
          { category: 'Legal', count: 45, percentage: 28.8, color: 'rgb(var(--color-primary))' },
          { category: 'Financial', count: 38, percentage: 24.4, color: 'rgb(var(--color-success))' },
          { category: 'Medical', count: 32, percentage: 20.5, color: 'rgb(var(--color-warning))' },
          { category: 'Educational', count: 25, percentage: 16.0, color: 'rgb(147, 51, 234)' },
          { category: 'General', count: 16, percentage: 10.3, color: 'rgb(var(--color-error))' }
        ],
        recentActivity: [
          { type: 'upload', count: 12, change: +15.3 },
          { type: 'verification', count: 34, change: +8.7 },
          { type: 'success_rate', count: 94.2, change: +2.1 }
        ]
      };

      setAnalytics(mockAnalytics);
      toast.success('📊 Analytics loaded successfully');
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, colorClass = 'primary' }) => {
    const colorConfig = {
      primary: {
        iconBg: 'bg-[rgb(var(--color-primary)/0.1)]',
        iconColor: 'text-[rgb(var(--color-primary))]',
        changeColor: change >= 0 ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'
      },
      success: {
        iconBg: 'bg-[rgb(var(--color-success)/0.1)]',
        iconColor: 'text-[rgb(var(--color-success))]',
        changeColor: change >= 0 ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'
      },
      warning: {
        iconBg: 'bg-[rgb(var(--color-warning)/0.1)]',
        iconColor: 'text-[rgb(var(--color-warning))]',
        changeColor: change >= 0 ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'
      },
      secondary: {
        iconBg: 'bg-[rgb(var(--text-quaternary)/0.1)]',
        iconColor: 'text-[rgb(var(--text-quaternary))]',
        changeColor: change >= 0 ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]'
      }
    };

    const config = colorConfig[colorClass];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="card-stats"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
              {value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center text-sm ${config.changeColor}`}>
                <motion.div
                  animate={{ rotate: change < 0 ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUpIcon className="w-4 h-4 mr-1" />
                </motion.div>
                <span className="font-medium">
                  {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${config.iconBg} ml-4`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
        </div>
      </motion.div>
    );
  };

  const ChartCard = ({ title, children, className = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
          {title}
        </h3>
        <DocumentChartBarIcon className="w-5 h-5 text-[rgb(var(--text-quaternary))]" />
      </div>
      {children}
    </motion.div>
  );

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card text-center">
          <div className="p-8">
            <div className="p-4 bg-[rgb(var(--color-primary)/0.1)] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <ChartBarIcon className="w-10 h-10 text-[rgb(var(--color-primary))]" />
            </div>
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
              Analytics Dashboard
            </h2>
            <p className="text-[rgb(var(--text-secondary))] mb-6">
              Connect your wallet to view detailed analytics and insights
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="card text-center">
          <div className="p-12">
            <LoadingSpinner size="xl" color="primary" text="Loading analytics..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Comprehensive insights into your document activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadAnalytics}
            icon={ArrowDownTrayIcon}
            title="Refresh data"
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Documents"
          value={analytics.totalDocuments.toLocaleString()}
          change={analytics.recentActivity[0]?.change}
          icon={DocumentIcon}
          colorClass="primary"
        />
        <StatCard
          title="Total Verifications"
          value={analytics.totalVerifications.toLocaleString()}
          change={analytics.recentActivity[1]?.change}
          icon={EyeIcon}
          colorClass="success"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          change={analytics.recentActivity[2]?.change}
          icon={CheckCircleIcon}
          colorClass="success"
        />
        <StatCard
          title="Avg File Size"
          value={`${analytics.averageFileSize}MB`}
          icon={ClockIcon}
          colorClass="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <ChartCard title="Monthly Activity Trends">
          <div className="space-y-4">
            {analytics.monthlyTrends.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--surface-hover))] hover:bg-[rgb(var(--surface-secondary))] transition-colors"
              >
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                  {item.month}
                </span>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[rgb(var(--color-primary))] rounded-full"></div>
                    <span className="text-sm text-[rgb(var(--text-secondary))]">
                      Uploads: <span className="font-medium">{item.uploads}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[rgb(var(--color-success))] rounded-full"></div>
                    <span className="text-sm text-[rgb(var(--text-secondary))]">
                      Verifications: <span className="font-medium">{item.verifications}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* Category Breakdown */}
        <ChartCard title="Document Categories">
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[rgb(var(--text-primary))] text-sm">
                    {item.category}
                  </span>
                  <span className="text-[rgb(var(--text-secondary))] text-sm">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[rgb(var(--surface-secondary))] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-1">
              Export Analytics
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Download your analytics data in various formats
            </p>
          </div>
          <CalendarDaysIcon className="w-6 h-6 text-[rgb(var(--text-quaternary))]" />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('📄 Exporting to CSV...')}
            icon={ArrowDownTrayIcon}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.info('📋 Exporting to PDF...')}
            icon={DocumentIcon}
          >
            Export PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info('📅 Scheduling report...')}
            icon={CalendarDaysIcon}
          >
            Schedule Report
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
