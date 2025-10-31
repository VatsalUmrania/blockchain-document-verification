import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText,
  Shield,
  CheckCircle,
  TrendingUp,
  Wallet,
  RefreshCw,
  Server,
  AlertTriangle,
  Eye,
  Database,
  Clock,
  BarChart3,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { useDocumentStats } from '../../context/DocumentStatsContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Types
// interface DashboardStats {
//   totalDocuments: number;
//   verifiedDocuments: number;
//   pendingDocuments: number;
//   totalVerifications: number;
// }

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  hoverBorderClass: string;
}

const Dashboard: React.FC = () => {
  const { isConnected, account, balance } = useWeb3();
  const { 
    stats, 
    recentActivity, 
    isLoading, 
    refreshStats, 
    lastUpdate, 
    connectionStatus, 
    error 
  } = useDocumentStats();
  
  // Fixed: Use useNavigate hook correctly
  const navigate = useNavigate();

  // Navigation handler
  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Debug logging
  useEffect(() => {
    console.log('📊 Dashboard stats updated:', stats);
    console.log('📊 Connection status:', connectionStatus);
  }, [stats, connectionStatus]);

  // Manual refresh function
  const handleRefreshStats = useCallback(async (): Promise<void> => {
    console.log('🔄 Manual refresh triggered');
    try {
      await refreshStats();
      toast.success('Dashboard Refreshed', {
        description: 'Statistics updated successfully',
      });
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      toast.error('Refresh Failed', {
        description: 'Failed to refresh dashboard data',
      });
    }
  }, [refreshStats]);

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

  // Quick Action Component
  const QuickAction: React.FC<QuickActionProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    colorClass,
    bgClass,
    borderClass,
    hoverBorderClass
  }) => (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 text-left ${bgClass} hover:${bgClass}/80 rounded-xl transition-all duration-300 border ${borderClass} hover:${hoverBorderClass} group shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgClass} group-hover:opacity-80 transition-opacity border ${borderClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div>
          <div className={`font-semibold ${colorClass} text-lg`}>{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </motion.button>
  );

  // Not connected state
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
            className="w-24 h-24 bg-card rounded-2xl flex items-center justify-center mx-auto mb-8 border-2 shadow-lg"
          >
            <Wallet className="w-12 h-12 text-primary" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto text-lg">
            Connect your MetaMask wallet to access your document verification dashboard with real-time sync.
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-primary" />
              <span>Database Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Map ActivityItem to Activity for compatibility with ActivityFeed
  const mapActivityItemToActivity = (item: any): any => {
    // Map the type field
    let type = item.type;
    if (type === 'issued') type = 'issue';
    if (type === 'verified') type = 'verification';
    if (type === 'revoked') type = 'delete';
    
    // Map the status field
    let status = item.status || 'active';
    if (status === 'verified') status = 'verified';
    if (status === 'pending') status = 'pending';
    if (status === 'failed') status = 'failed';
    
    return {
      ...item,
      type,
      status
    };
  };

  // Map recentActivity to compatible Activity array
  const mappedActivities = recentActivity.map(mapActivityItemToActivity);

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
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            Document Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-xl mb-6"
          >
            Track your verified documents with secure storage and blockchain verification
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 items-start lg:items-center flex-wrap"
          >
            {/* Wallet Info */}
            <Badge variant="outline" className="px-4 py-2">
              <Wallet className="w-4 h-4 mr-2 text-primary" />
              <span className="font-mono text-sm">
                {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </span>
            </Badge>
            
            {/* Balance */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="font-medium">Balance:</span>
              <span className="text-green-600 font-mono">{parseFloat(balance || '0').toFixed(4)} ETH</span>
            </div>
            
            {/* Connection Status */}
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {connectionStatus === 'connected' ? (
                <>
                  <Server className="w-3 h-3 mr-1" />
                  Database Connected
                </>
              ) : connectionStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Database Error
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Connecting...
                </>
              )}
            </Badge>
            
            {/* Last Update */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3" />
              <span>Updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        </div>

        {/* Connection Error Alert */}
        {(connectionStatus === 'error' || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Database Connection Issue</p>
                  <p className="text-sm mt-1">
                    {error || "Unable to connect to database. Please check if the backend server is running."}
                  </p>
                </div>
                <Button
                  onClick={handleRefreshStats}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
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
            icon={FileText}
            color="primary"
            loading={isLoading}
            subtitle="Stored securely"
          />
          <StatCard
            title="Verified"
            value={stats.verifiedDocuments}
            icon={CheckCircle}
            color="success"
            loading={isLoading}
            subtitle="Successfully verified"
            change={stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}
            changeType="percentage"
          />
          <StatCard
            title="Pending"
            value={stats.pendingDocuments}
            icon={Clock}
            color="warning"
            loading={isLoading}
            subtitle="Awaiting verification"
          />
          <StatCard
            title="Verifications"
            value={stats.totalVerifications}
            icon={BarChart3}
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
              activities={mappedActivities} 
              loading={isLoading}
              emptyMessage="No document activity yet. Upload or verify documents to see activity here."
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Document */}
              <QuickAction
                title="Upload Document"
                description="Store securely with verification"
                icon={Upload}
                onClick={() => navigateTo('/upload')}
                colorClass="text-primary"
                bgClass="bg-primary/10"
                borderClass="border-primary/20"
                hoverBorderClass="border-primary"
              />

              {/* Verify Document */}
              <QuickAction
                title="Verify Document"
                description="Check authenticity & update status"
                icon={Shield}
                onClick={() => navigateTo('/verify')}
                colorClass="text-green-600"
                bgClass="bg-green-50 dark:bg-green-900/20"
                borderClass="border-green-200 dark:border-green-800"
                hoverBorderClass="border-green-500"
              />

              {/* Browse Documents */}
              <QuickAction
                title="Browse Documents"
                description="View all uploaded documents"
                icon={Eye}
                onClick={() => navigateTo('/documents')}
                colorClass="text-blue-600"
                bgClass="bg-blue-50 dark:bg-blue-900/20"
                borderClass="border-blue-200 dark:border-blue-800"
                hoverBorderClass="border-blue-500"
              />

              {/* Refresh Data */}
              <Button
                onClick={handleRefreshStats}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="w-full h-16 justify-start text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Update statistics from database
                    </div>
                  </div>
                </div>
              </Button>

              <Separator />

              {/* Database Status */}
              <Card className={`transition-all duration-300 ${
                connectionStatus === 'connected'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-border bg-card'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Database className={`w-5 h-5 ${
                      connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <div className={`font-semibold ${
                        connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                        Database Status
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {connectionStatus === 'connected' ? 'Database connected' : 'Database offline'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        {stats.totalDocuments > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <span>Analytics Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center p-6 bg-primary/5 border-primary/20">
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Verification Rate</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {recentActivity.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Recent Activities</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {new Date(lastUpdate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Last Sync Date</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
