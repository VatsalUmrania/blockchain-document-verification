import React from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';
import Button from '../common/Button';
import { WalletIcon } from '@heroicons/react/24/outline';

const WalletConnect = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-4"
    >
      {!isConnected ? (
        <Button
          onClick={connectWallet}
          loading={isLoading}
          className="flex items-center space-x-2"
        >
          <WalletIcon className="w-5 h-5" />
          <span>Connect Wallet</span>
        </Button>
      ) : (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{formatAddress(account)}</span>
          </div>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
          >
            Disconnect
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default WalletConnect;
