import React, { useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
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
  Clock,
  BarChart3,
  Upload,
  ChevronRight,
  RadioTower,
  Hourglass,
  Coins, // Added for balance
  Link as LinkIcon, // Added for network
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { useDocumentStats, ActivityItem } from '../../context/DocumentStatsContext';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay'; // Import HashDisplay

// --- Types ---
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  variant?: 'primary' | 'secondary'; // Simplified variants
}

interface StatusItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string | React.ReactNode;
  status?: 'online' | 'offline' | 'warning';
}

// --- Animation Variants ---
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// --- Sub-Components ---

// [REFACTORED] Status Item Component (now uses theme colors)
const StatusItem: React.FC<StatusItemProps> = ({ icon: Icon, title, value, status = 'online' }) => {
  const statusColors = {
    online: 'text-primary', // Use theme primary for "success"
    offline: 'text-destructive',
    warning: 'text-accent-foreground' // Use theme accent for "warning"
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className={cn(
        "flex-shrink-0 p-2 rounded-lg border",
        status === 'online' && 'border-primary/20 bg-primary/10',
        status === 'offline' && 'border-destructive/20 bg-destructive/10',
        status === 'warning' && 'border-accent/20 bg-accent/10'
      )}>
        <Icon className={cn("w-4 h-4", statusColors[status])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-base font-semibold truncate">{value}</div>
      </div>
    </div>
  );
};

// [REFACTORED] Quick Action Component (now uses theme colors)
const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'secondary'
}) => {
  const variantStyles = {
    primary: {
      container: 'bg-primary/5 border-primary/20 hover:bg-primary/10',
      icon: 'bg-primary text-primary-foreground',
      text: 'text-primary'
    },
    secondary: {
      container: 'bg-muted/50 border-border hover:bg-muted',
      icon: 'bg-secondary text-secondary-foreground ',
      text: 'text-foreground'
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="w-full"
    >
      <Card 
        onClick={onClick} 
        className={cn(
          "cursor-pointer h-full transition-all duration-200 border group overflow-hidden",
          styles.container
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              styles.icon
            )}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className={cn(
                "font-medium text-sm transition-colors",
                styles.text
              )}>
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
  const { isConnected, account, balance, user, connectWallet, chainId } = useWeb3();
  const { 
    stats, 
    recentActivity, 
    isLoading, 
    refreshStats, 
    lastUpdate, 
    connectionStatus, 
    error 
  } = useDocumentStats();
  
  const navigate = useNavigate();

  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    // console.log('Dashboard stats updated:', stats);
  }, [stats, connectionStatus]);

  const handleRefreshStats = useCallback(async (): Promise<void> => {
    // console.log('Manual refresh triggered');
    try {
      await refreshStats();
      toast.success('Dashboard Refreshed', {
        description: 'Statistics updated successfully',
      });
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      toast.error('Refresh Failed', {
        description: (error as Error).message || 'Failed to refresh dashboard data',
      });
    }
  }, [refreshStats]);

  // Map ActivityItem to compatible Activity type for ActivityFeed
  const mapActivityItemToActivity = useCallback((item: ActivityItem) => {
    const timestamp = item.timestamp instanceof Date 
      ? item.timestamp.getTime() 
      : typeof item.timestamp === 'string'
      ? new Date(item.timestamp).getTime()
      : item.timestamp;

    return {
      id: item.id || item.documentHash,
      type: item.type as 'issued' | 'verified' | 'revoked',
      status: item.status as 'verified' | 'pending' | 'completed' | 'failed' | 'error' | 'processing' | 'active',
      timestamp: timestamp, 
      hash: item.documentHash,
      title: item.title || 'Untitled Document',
      recipientName: item.recipientName,
      issuanceDate: item.issuanceDate,
      documentType: item.documentType,
      documentHash: item.documentHash
    };
  }, []);

  const mappedActivities = recentActivity.map(mapActivityItemToActivity);

  // [NEW] Helper to get network name
  const getNetworkName = (id: bigint | null) => {
    if (id === null) return 'N/A';
    switch (id.toString()) {
      case '1': return 'Ethereum Mainnet';
      case '11155111': return 'Sepolia Testnet';
      case '137': return 'Polygon Mainnet';
      case '80001': return 'Polygon Mumbai';
      case '31337': return 'Local Hardhat';
      default: return `Unknown (ID: ${id})`;
    }
  };

  // [MODIFIED] Not connected state
  if (!isConnected || !account) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-2 border-primary/20"
              >
                <Wallet className="w-10 h-10 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access your secure document dashboard by connecting your wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={connectWallet} // [MODIFIED] Calls connectWallet directly
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span>Secure Backend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Blockchain Verified</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // [NEW] Connection status badge logic
  const connectionBadge = {
    connected: (
      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
        <RadioTower className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    ),
    error: (
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Error
      </Badge>
    ),
    disconnected: (
      <Badge variant="secondary">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Connecting...
      </Badge>
    )
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* [MODIFIED] Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome, {user?.role || 'User'}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectionBadge[connectionStatus]}
            <Button variant="outline" size="sm" onClick={handleRefreshStats} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {(connectionStatus === 'error' || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Database Connection Issue</AlertTitle>
              <AlertDescription>
                {error || "Failed to fetch dashboard data. Please check your connection."}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* [MODIFIED] Stats Grid - updated colors */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments}
              icon={FileText}
              color="primary" // Stays primary
              loading={isLoading}
              subtitle="All documents issued"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Verified"
              value={stats.verifiedDocuments}
              icon={CheckCircle}
              color="primary" // Changed from 'success'
              loading={isLoading}
              subtitle="Successfully verified"
              change={stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}
              changeType="percentage"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Pending"
              value={stats.pendingDocuments}
              icon={Hourglass}
              color="secondary" // Changed from 'warning'
              loading={isLoading}
              subtitle="Awaiting action"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Verifications"
              value={stats.totalVerifications}
              icon={BarChart3}
              color="primary" // Changed from 'purple'
              loading={isLoading}
              subtitle="Total events"
            />
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed 
              activities={mappedActivities}
              loading={isLoading}
              emptyMessage="No document activity yet. Upload or verify documents to see activity here."
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuickAction
                    title="Upload Document"
                    description="Issue a new secure document"
                    icon={Upload}
                    onClick={() => navigateTo('/upload')}
                    variant="secondary"
                  />
                  <QuickAction
                    title="Verify Document"
                    description="Check document authenticity"
                    icon={Shield}
                    onClick={() => navigateTo('/verify')}
                    variant="secondary"
                  />
                  <QuickAction
                    title="Browse Documents"
                    description="View all your documents"
                    icon={Eye}
                    onClick={() => navigateTo('/documents')}
                    variant="secondary"
                  />
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;