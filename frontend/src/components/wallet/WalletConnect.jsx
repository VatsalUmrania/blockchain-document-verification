import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';
import Button from '../common/Button';
import { 
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  XMarkIcon,
  CubeTransparentIcon,
  SparklesIcon,
  ChevronDownIcon,
  SignalIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const WalletConnect = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, balance, chainId } = useWeb3();
  const [showDetails, setShowDetails] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 5:
        return 'Goerli Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 42161:
        return 'Arbitrum One';
      case 10:
        return 'Optimism';
      default:
        return 'Unknown Network';
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case 1:
        return {
          bg: 'bg-[rgb(var(--color-primary)/0.1)]',
          border: 'border-[rgb(var(--color-primary)/0.3)]',
          text: 'text-[rgb(var(--color-primary))]'
        };
      case 11155111:
        return {
          bg: 'bg-[rgb(var(--color-success)/0.1)]',
          border: 'border-[rgb(var(--color-success)/0.3)]',
          text: 'text-[rgb(var(--color-success))]'
        };
      case 137:
        return {
          bg: 'bg-[rgb(var(--color-accent)/0.1)]',
          border: 'border-[rgb(var(--color-accent)/0.3)]',
          text: 'text-[rgb(var(--color-accent))]'
        };
      default:
        return {
          bg: 'bg-[rgb(var(--color-warning)/0.1)]',
          border: 'border-[rgb(var(--color-warning)/0.3)]',
          text: 'text-[rgb(var(--color-warning))]'
        };
    }
  };

  const isWrongNetwork = chainId && chainId !== 1 && chainId !== 11155111; // Allow mainnet and sepolia
  const networkColors = getNetworkColor(chainId);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        {!isConnected ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={connectWallet}
              loading={isLoading}
              variant="primary"
              icon={WalletIcon}
              className="h-12 px-6"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Wallet Status Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowDetails(!showDetails)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isWrongNetwork 
                  ? 'bg-[rgb(var(--color-error)/0.1)] border-[rgb(var(--color-error)/0.3)] text-[rgb(var(--color-error))]'
                  : 'bg-[rgb(var(--color-success)/0.1)] border-[rgb(var(--color-success)/0.3)] text-[rgb(var(--color-success))]'
              }`}
            >
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-2">
                {isWrongNetwork ? (
                  <div className="w-3 h-3 bg-[rgb(var(--color-error))] rounded-full animate-pulse" />
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-[rgb(var(--color-success))] rounded-full"
                  />
                )}
                {isWrongNetwork ? (
                  <ExclamationTriangleIcon className="w-4 h-4" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
              </div>

              {/* Wallet Info */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <WalletIcon className="w-4 h-4" />
                  <span className="text-sm font-mono font-semibold">
                    {formatAddress(account)}
                  </span>
                </div>
                {balance && (
                  <div className="flex items-center space-x-1 text-xs">
                    <CubeTransparentIcon className="w-3 h-3" />
                    <span>{formatBalance(balance)} ETH</span>
                  </div>
                )}
              </div>

              {/* Dropdown Indicator */}
              <ChevronDownIcon 
                className={`w-4 h-4 transition-transform duration-200 ${
                  showDetails ? 'rotate-180' : ''
                }`} 
              />
            </motion.div>

            {/* Network Info */}
            {chainId && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-3 py-2 rounded-lg text-xs font-medium border ${networkColors.bg} ${networkColors.border} ${networkColors.text}`}
              >
                <div className="flex items-center space-x-1">
                  <GlobeAltIcon className="w-3 h-3" />
                  <span>{getNetworkName(chainId)}</span>
                </div>
              </motion.div>
            )}

            {/* Disconnect Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={disconnectWallet}
                variant="ghost"
                size="sm"
                icon={XMarkIcon}
                className="h-12 px-4"
                title="Disconnect wallet"
              >
                Disconnect
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Detailed Wallet Information Dropdown */}
      <AnimatePresence>
        {isConnected && showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 p-4 bg-[rgb(var(--surface-primary))] border border-[rgb(var(--border-primary))] rounded-xl shadow-lg z-50 min-w-[300px]"
          >
            <div className="space-y-3">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Status</span>
                <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${
                  isWrongNetwork
                    ? 'bg-[rgb(var(--color-error)/0.1)] text-[rgb(var(--color-error))]'
                    : 'bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success))]'
                }`}>
                  <SignalIcon className="w-3 h-3" />
                  <span>{isWrongNetwork ? 'Wrong Network' : 'Connected'}</span>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Address</span>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-xs font-mono text-[rgb(var(--text-primary))] bg-[rgb(var(--surface-secondary))] px-2 py-1 rounded border border-[rgb(var(--border-primary))]">
                    {account}
                  </code>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(account);
                      // You could add a toast here
                    }}
                    variant="ghost"
                    size="xs"
                    className="px-2 py-1"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Balance */}
              {balance && (
                <div>
                  <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Balance</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[rgb(var(--text-primary))] font-semibold">
                      {formatBalance(balance)} ETH
                    </span>
                    <CubeTransparentIcon className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                  </div>
                </div>
              )}

              {/* Network Details */}
              {chainId && (
                <div>
                  <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">Network</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`font-medium ${networkColors.text}`}>
                      {getNetworkName(chainId)}
                    </span>
                    <span className="text-xs text-[rgb(var(--text-tertiary))] bg-[rgb(var(--surface-secondary))] px-2 py-1 rounded">
                      ID: {chainId}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Warning */}
      <AnimatePresence>
        {isConnected && isWrongNetwork && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-full right-0 mt-2 p-4 bg-[rgb(var(--color-error)/0.1)] border border-[rgb(var(--color-error)/0.3)] rounded-xl z-40 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-[rgb(var(--color-error))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-error))] mb-1">
                  Unsupported Network
                </p>
                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">
                  Please switch to Ethereum Mainnet or Sepolia Testnet for full functionality. 
                  Some features may be limited on the current network.
                </p>
                <div className="mt-2 flex space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))]">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    Mainnet
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success))]">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    Sepolia
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnect;
