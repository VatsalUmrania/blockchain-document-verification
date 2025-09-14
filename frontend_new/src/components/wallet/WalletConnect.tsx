import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet,
  CheckCircle,
  AlertTriangle,
  Copy,
  X,
  ChevronDown,
  Signal,
  Globe,
  Sparkles,
  LogOut,
  CircleDot
} from 'lucide-react';

// Types
interface NetworkInfo {
  name: string;
  color: 'default' | 'destructive' | 'secondary' | 'outline';
  bgClass: string;
}

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  balance: string | null;
  chainId: number | null;
}

const WalletConnect: React.FC = () => {
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    isLoading, 
    balance, 
    chainId 
  } = useWeb3() as Web3ContextType;
  
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const { toast } = useToast();

  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string | null): string => {
    if (!balance) return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  const getNetworkInfo = (chainId: number | null): NetworkInfo => {
    switch (chainId) {
      case 1:
        return {
          name: 'Ethereum Mainnet',
          color: 'default',
          bgClass: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 11155111:
        return {
          name: 'Sepolia Testnet',
          color: 'secondary',
          bgClass: 'bg-green-50 text-green-700 border-green-200'
        };
      case 5:
        return {
          name: 'Goerli Testnet',
          color: 'secondary',
          bgClass: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      case 137:
        return {
          name: 'Polygon Mainnet',
          color: 'outline',
          bgClass: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 42161:
        return {
          name: 'Arbitrum One',
          color: 'outline',
          bgClass: 'bg-cyan-50 text-cyan-700 border-cyan-200'
        };
      case 10:
        return {
          name: 'Optimism',
          color: 'outline',
          bgClass: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          name: 'Unknown Network',
          color: 'destructive',
          bgClass: 'bg-orange-50 text-orange-700 border-orange-200'
        };
    }
  };

  const isWrongNetwork = chainId && chainId !== 1 && chainId !== 11155111;
  const networkInfo = getNetworkInfo(chainId);

  const handleCopyAddress = async (): Promise<void> => {
    if (!account) return;
    
    try {
      await navigator.clipboard.writeText(account);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (): Promise<void> => {
    try {
      await connectWallet();
      toast({
        title: "Wallet connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = (): void => {
    disconnectWallet();
    setShowDetails(false);
    toast({
      title: "Wallet disconnected",
      description: "Successfully disconnected from wallet",
    });
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="h-10 px-6"
            size="default"
          >
            {isLoading ? (
              <>
                <CircleDot className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="relative flex items-center space-x-3">
      {/* Network Warning Alert */}
      <AnimatePresence>
        {isWrongNetwork && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-full right-0 mt-2 z-50 w-80"
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Unsupported Network</p>
                  <p className="text-sm">
                    Please switch to Ethereum Mainnet or Sepolia Testnet for full functionality.
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Mainnet
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Sepolia
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Badge */}
      {chainId && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant={networkInfo.color}
                  className={`${networkInfo.bgClass} cursor-help`}
                >
                  <Globe className="w-3 h-3 mr-1" />
                  {networkInfo.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Network ID: {chainId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}

      {/* Main Wallet Dropdown */}
      <DropdownMenu open={showDetails} onOpenChange={setShowDetails}>
        <DropdownMenuTrigger asChild>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Button
              variant="outline"
              className={`h-10 px-4 ${
                isWrongNetwork
                  ? 'border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10'
                  : 'border-green-500/50 bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                {/* Status Indicator */}
                <motion.div
                  animate={!isWrongNetwork ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${
                    isWrongNetwork ? 'bg-destructive animate-pulse' : 'bg-green-500'
                  }`}
                />
                
                {/* Wallet Icon */}
                {isWrongNetwork ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                
                {/* Address */}
                <span className="font-mono text-sm font-medium">
                  {formatAddress(account)}
                </span>
                
                {/* Balance */}
                {balance && (
                  <Badge variant="secondary" className="text-xs">
                    {formatBalance(balance)} ETH
                  </Badge>
                )}
                
                {/* Dropdown Arrow */}
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showDetails ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Connection Status */}
          <div className="px-2 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge 
                variant={isWrongNetwork ? "destructive" : "default"} 
                className="text-xs"
              >
                <Signal className="w-3 h-3 mr-1" />
                {isWrongNetwork ? 'Wrong Network' : 'Connected'}
              </Badge>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Full Address */}
          <div className="px-2 py-2 space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Address</span>
            <Card className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-foreground break-all">
                    {account}
                  </code>
                  <Button
                    onClick={handleCopyAddress}
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance */}
          {balance && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Balance</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{formatBalance(balance)} ETH</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Network Info */}
          {chainId && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Network</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      ID: {chainId}
                    </Badge>
                  </div>
                </div>
                <p className={`text-sm font-medium mt-1 ${
                  isWrongNetwork ? 'text-destructive' : 'text-foreground'
                }`}>
                  {networkInfo.name}
                </p>
              </div>
            </>
          )}

          <DropdownMenuSeparator />
          
          {/* Disconnect Button */}
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WalletConnect;
