import React from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';
import Button from '../common/Button';
import { 
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  XMarkIcon,
  CubeTransparentIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const WalletConnect = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, balance, chainId } = useWeb3();

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
      default:
        return 'Unknown Network';
    }
  };

  const isWrongNetwork = chainId && chainId !== 1 && chainId !== 11155111; // Allow mainnet and sepolia

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-4"
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
            className="flex items-center space-x-2 h-12 px-6"
          >
            <WalletIcon className="w-5 h-5" />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
          </Button>
        </motion.div>
      ) : (
        <div className="flex items-center space-x-3">
          {/* Wallet Status Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
              isWrongNetwork 
                ? 'bg-[#FF4C4C]/10 border-[#FF4C4C]/30 text-[#FF4C4C]'
                : 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]'
            }`}
          >
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2">
              {isWrongNetwork ? (
                <div className="w-3 h-3 bg-[#FF4C4C] rounded-full animate-pulse" />
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-[#00C853] rounded-full"
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
          </motion.div>

          {/* Network Info (if connected) */}
          {chainId && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                isWrongNetwork
                  ? 'bg-[#FF4C4C]/10 border-[#FF4C4C]/30 text-[#FF4C4C]'
                  : 'bg-[#296CFF]/10 border-[#296CFF]/30 text-[#296CFF]'
              }`}
            >
              <div className="flex items-center space-x-1">
                <LinkIcon className="w-3 h-3" />
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
              className="flex items-center space-x-2 h-12 px-4"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Disconnect</span>
            </Button>
          </motion.div>
        </div>
      )}

      {/* Network Warning */}
      {isConnected && isWrongNetwork && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-full left-0 mt-2 p-3 bg-[#FF4C4C]/10 border border-[#FF4C4C]/30 rounded-lg z-10"
        >
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-[#FF4C4C] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#FF4C4C]">Wrong Network</p>
              <p className="text-xs text-[#CCCCCC] mt-1">
                Please switch to Ethereum Mainnet or Sepolia Testnet for full functionality.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WalletConnect;
