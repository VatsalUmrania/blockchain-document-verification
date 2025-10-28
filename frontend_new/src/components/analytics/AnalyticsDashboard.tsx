import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  FileText,
  Clock,
  Eye,
  CheckCircle,
  Download,
  Calendar,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types and Interfaces
interface MonthlyTrend {
  month: string;
  uploads: number;
  verifications: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface RecentActivity {
  type: 'upload' | 'verification' | 'success_rate';
  count: number;
  change: number;
}

interface Analytics {
  totalDocuments: number;
  totalVerifications: number;
  successRate: number;
  averageFileSize: number;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  recentActivity: RecentActivity[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  colorClass?: 'primary' | 'success' | 'warning' | 'secondary';
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const AnalyticsDashboard: React.FC = () => {
  const { isConnected } = useWeb3();
  
  // State
  const [analytics, setAnalytics] = useState<Analytics>({
    totalDocuments: 0,
    totalVerifications: 0,
    successRate: 0,
    averageFileSize: 0,
    monthlyTrends: [],
    categoryBreakdown: [],
    recentActivity: []
  });
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  const loadAnalytics = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call - replace with real blockchain/backend data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnalytics: Analytics = {
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
          { category: 'Legal', count: 45, percentage: 28.8, color: 'hsl(var(--primary))' },
          { category: 'Financial', count: 38, percentage: 24.4, color: 'hsl(142, 76%, 36%)' },
          { category: 'Medical', count: 32, percentage: 20.5, color: 'hsl(38, 92%, 50%)' },
          { category: 'Educational', count: 25, percentage: 16.0, color: 'hsl(262, 83%, 58%)' },
          { category: 'General', count: 16, percentage: 10.3, color: 'hsl(0, 84%, 60%)' }
        ],
        recentActivity: [
          { type: 'upload', count: 12, change: 15.3 },
          { type: 'verification', count: 34, change: 8.7 },
          { type: 'success_rate', count: 94.2, change: 2.1 }
        ]
      };

      setAnalytics(mockAnalytics);
      toast.success('Analytics Updated', {
        description: 'Analytics data loaded successfully',
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics data';
      setError(errorMessage);
      toast.error('Analytics Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  // Effects
  useEffect(() => {
    if (isConnected) {
      loadAnalytics();
    }
  }, [isConnected, loadAnalytics]);

  // StatCard Component
  const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    colorClass = 'primary' 
  }) => {
    const getColorClasses = (colorClass: string) => {
      switch (colorClass) {
        case 'success':
          return {
            iconBg: 'bg-green-100 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
          };
        case 'warning':
          return {
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
          };
        case 'secondary':
          return {
            iconBg: 'bg-gray-100 dark:bg-gray-800',
            iconColor: 'text-gray-600 dark:text-gray-400',
          };
        default:
          return {
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
          };
      }
    };

    const colorClasses = getColorClasses(colorClass);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {title}
                </p>
                <p className="text-3xl font-bold text-foreground mb-2">
                  {value}
                </p>
                {change !== undefined && (
                  <div className={`flex items-center text-sm ${
                    change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <motion.div
                      animate={{ rotate: change < 0 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                    </motion.div>
                    <span className="font-medium">
                      {Math.abs(change).toFixed(1)}% {change >= 0 ? 'increase' : 'decrease'}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${colorClasses.iconBg} ml-4`}>
                <Icon className={`w-6 h-6 ${colorClasses.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ChartCard Component
  const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            {title}
            <PieChart className="w-5 h-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Export handlers
  const handleExportCSV = useCallback((): void => {
    toast.info('Exporting Data', {
      description: 'Generating CSV export...',
    });
    // TODO: Implement actual CSV export
  }, []);

  const handleExportPDF = useCallback((): void => {
    toast.info('Exporting Report', {
      description: 'Generating PDF report...',
    });
    // TODO: Implement actual PDF export
  }, []);

  const handleScheduleReport = useCallback((): void => {
    toast.info('Schedule Report', {
      description: 'Opening report scheduler...',
    });
    // TODO: Implement report scheduling
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not Connected State
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  Connect your wallet to view detailed analytics and insights
                </p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Connect Wallet
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                loadAnalytics();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
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
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your document activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Documents"
          value={analytics.totalDocuments.toLocaleString()}
          change={analytics.recentActivity[0]?.change}
          icon={FileText}
          colorClass="primary"
        />
        <StatCard
          title="Total Verifications"
          value={analytics.totalVerifications.toLocaleString()}
          change={analytics.recentActivity[1]?.change}
          icon={Eye}
          colorClass="success"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          change={analytics.recentActivity[2]?.change}
          icon={CheckCircle}
          colorClass="success"
        />
        <StatCard
          title="Avg File Size"
          value={`${analytics.averageFileSize}MB`}
          icon={Clock}
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
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium">{item.month}</span>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      Uploads: <span className="font-medium text-foreground">{item.uploads}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      Verifications: <span className="font-medium text-foreground">{item.verifications}</span>
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
                  <span className="font-medium text-sm">{item.category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </Badge>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                />
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
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Export Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Download your analytics data in various formats
                </p>
              </div>
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportCSV} variant="default">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleScheduleReport} variant="ghost">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;