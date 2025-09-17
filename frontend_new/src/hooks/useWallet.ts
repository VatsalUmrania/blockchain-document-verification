import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types/wallet';
import { getMetaMaskProvider, isMetaMaskInstalled, requestAccounts, getChainId } from '../utils/wallet';

const initialState: WalletState = {
  accounts: [],
  chainId: null,
  isConnected: false,
  isInstalled: isMetaMaskInstalled()
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const updateWallet = useCallback((accounts: string[], chainId?: string) => {
    setWallet(prev => ({
      ...prev,
      accounts,
      chainId: chainId || prev.chainId,
      isConnected: accounts.length > 0
    }));
  }, []);

  const connectWallet = async () => {
    if (!wallet.isInstalled) {
      alert('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await requestAccounts();
      const chainId = await getChainId();
      updateWallet(accounts, chainId);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(prev => ({
      ...prev,
      accounts: [],
      isConnected: false
    }));
  };

  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      updateWallet(accounts);
    };

    const handleChainChanged = (chainId: string) => {
      setWallet(prev => ({ ...prev, chainId }));
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [updateWallet]);

  return {
    wallet,
    isLoading,
    connectWallet,
    disconnectWallet
  };
};
