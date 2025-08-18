// context/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // Get network name for user-friendly display
  const getNetworkName = useCallback((chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 5:
        return 'Goerli Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai Testnet';
      default:
        return `Network ${chainId}`;
    }
  }, []);

  // Update balance with enhanced error handling
  const updateBalance = useCallback(async (address, currentProvider) => {
    if (!currentProvider || !address) return;
    
    try {
      const balance = await currentProvider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      // Don't show toast for balance update errors to avoid spam
    }
  }, []);

  // Handle account changes with error handling
  const handleAccountsChanged = useCallback(async (accounts) => {
    try {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        setIsConnected(false);
        setAccount('');
        setProvider(null);
        setSigner(null);
        setBalance('0');
        setChainId(null);
        setConnectionError(null);
        
        toast.info('🔒 Please connect to MetaMask', {
          icon: '🔒'
        });
      } else if (accounts[0] !== account) {
        const newAccount = accounts;
        setAccount(newAccount);
        
        if (provider) {
          await updateBalance(newAccount, provider);
        }
        
        toast.success(`🔄 Account switched to ${newAccount.substring(0, 6)}...${newAccount.substring(newAccount.length - 4)}`, {
          icon: '🔄'
        });
      }
    } catch (error) {
      console.error('❌ Error handling account change:', error);
      toast.error('❌ Error switching accounts');
    }
  }, [account, provider, updateBalance]);

  // Handle chain changes with error handling
  const handleChainChanged = useCallback((chainId) => {
    try {
      const newChainId = parseInt(chainId, 16);
      const networkName = getNetworkName(newChainId);
      
      setChainId(newChainId);
      
      toast.info(`🔗 Network changed to ${networkName}`, {
        icon: '🔗'
      });
      
      // Reload the page to avoid any errors with the current provider
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Error handling chain change:', error);
      toast.error('❌ Error handling network change');
    }
  }, [getNetworkName]);

  // Connect to MetaMask with comprehensive error handling
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('🦊 Please install MetaMask extension first', {
        icon: '🦊'
      });
      setConnectionError('MetaMask not installed');
      return;
    }

    setIsLoading(true);
    setConnectionError(null);
    
    try {
      // Request account access if needed
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider using ethers v5 syntax
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setBalance(ethers.utils.formatEther(balance));
      setChainId(network.chainId);
      setIsConnected(true);
      
      toast.success(`🎉 Wallet connected successfully on ${getNetworkName(network.chainId)}`, {
        autoClose: 5000,
        icon: '🎉'
      });
      
      // Store connection status in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      
    } catch (error) {
      console.error('❌ Error connecting to wallet:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request pending. Please check MetaMask.';
      } else if (error.code === -32603) {
        errorMessage = 'Internal MetaMask error. Please try again.';
      }
      
      setConnectionError(errorMessage);
      toast.error(`❌ ${errorMessage}`, {
        icon: '❌'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, getNetworkName]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    try {
      setIsConnected(false);
      setAccount('');
      setProvider(null);
      setSigner(null);
      setBalance('0');
      setChainId(null);
      setConnectionError(null);
      
      // Remove from localStorage
      localStorage.removeItem('walletConnected');
      
      toast.info('👋 Wallet disconnected', {
        icon: '👋'
      });
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      toast.error('❌ Error disconnecting wallet');
    }
  }, []);

  // Get transaction history with improved error handling
  const getTransactionHistory = useCallback(async (limit = 10) => {
    if (!provider || !account) {
      return [];
    }

    try {
      const transactions = [];
      const currentBlock = await provider.getBlockNumber();
      
      // Look through recent blocks (simplified approach)
      for (let i = 0; i < Math.min(20, currentBlock) && transactions.length < limit; i++) {
        try {
          const block = await provider.getBlockWithTransactions(currentBlock - i);
          
          const userTxs = block.transactions.filter(tx => 
            tx.from?.toLowerCase() === account.toLowerCase() || 
            tx.to?.toLowerCase() === account.toLowerCase()
          );

          for (const tx of userTxs) {
            if (transactions.length >= limit) break;
            
            transactions.push({
              id: tx.hash,
              hash: tx.hash,
              from: tx.from,
              to: tx.to || 'Contract Creation',
              value: ethers.utils.formatEther(tx.value || '0'),
              timestamp: block.timestamp * 1000,
              blockNumber: tx.blockNumber,
              type: tx.from?.toLowerCase() === account.toLowerCase() ? 'sent' : 'received',
              status: 'confirmed'
            });
          }
        } catch (blockError) {
          // Skip problematic blocks silently
          continue;
        }
      }
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error);
      toast.error('❌ Failed to fetch transaction history');
      return [];
    }
  }, [provider, account]);

  // Sign message with enhanced error handling
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    try {
      const signature = await signer.signMessage(message);
      
      toast.success('✅ Message signed successfully', {
        icon: '✍️'
      });
      
      return signature;
    } catch (error) {
      console.error('❌ Error signing message:', error);
      
      if (error.code === 4001) {
        toast.error('❌ Message signing rejected by user');
      } else if (error.code === -32603) {
        toast.error('❌ Internal error while signing message');
      } else {
        toast.error('❌ Failed to sign message');
      }
      
      throw error;
    }
  }, [signer]);

  // Verify signature with error handling
  const verifySignature = useCallback(async (message, signature, expectedAddress) => {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
      
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying signature:', error);
      return false;
    }
  }, []);

  // Switch network with error handling
  const switchNetwork = useCallback(async (chainId) => {
    if (!window.ethereum) {
      toast.error('❌ MetaMask not available');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      toast.success(`🔗 Switched to ${getNetworkName(chainId)}`, {
        icon: '🔗'
      });
    } catch (error) {
      console.error('❌ Error switching network:', error);
      
      if (error.code === 4902) {
        toast.error('❌ Network not added to MetaMask. Please add it first.');
      } else if (error.code === 4001) {
        toast.error('❌ Network switch rejected by user');
      } else {
        toast.error('❌ Failed to switch network');
      }
    }
  }, [getNetworkName]);

  // Add network with error handling
  const addNetwork = useCallback(async (networkConfig) => {
    if (!window.ethereum) {
      toast.error('❌ MetaMask not available');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
      
      toast.success(`✅ Network ${networkConfig.chainName} added successfully`, {
        icon: '🔗'
      });
    } catch (error) {
      console.error('❌ Error adding network:', error);
      
      if (error.code === 4001) {
        toast.error('❌ Network addition rejected by user');
      } else {
        toast.error('❌ Failed to add network');
      }
    }
  }, []);

  // Setup event listeners with error handling
  useEffect(() => {
    if (window.ethereum) {
      try {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
          try {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
          } catch (error) {
            console.error('❌ Error removing Web3 event listeners:', error);
          }
        };
      } catch (error) {
        console.error('❌ Error setting up Web3 event listeners:', error);
      }
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Check if already connected on mount with error handling
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        const wasConnected = localStorage.getItem('walletConnected');
        
        if (wasConnected) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              await connectWallet();
            } else {
              // Clean up localStorage if no accounts
              localStorage.removeItem('walletConnected');
            }
          } catch (error) {
            console.error('❌ Error checking wallet connection:', error);
            localStorage.removeItem('walletConnected');
          }
        }
      }
    };
    
    checkConnection();
  }, [isMetaMaskInstalled, connectWallet]);

  // Update balance periodically when connected with error handling
  useEffect(() => {
    if (isConnected && provider && account) {
      const interval = setInterval(() => {
        try {
          updateBalance(account, provider);
        } catch (error) {
          console.error('❌ Error during periodic balance update:', error);
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, provider, account, updateBalance]);

  // Clear error state
  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  // Get wallet status
  const getWalletStatus = useCallback(() => {
    return {
      isConnected,
      account,
      balance,
      chainId,
      networkName: chainId ? getNetworkName(chainId) : null,
      isLoading,
      connectionError,
      isMetaMaskInstalled: isMetaMaskInstalled()
    };
  }, [isConnected, account, balance, chainId, isLoading, connectionError, isMetaMaskInstalled, getNetworkName]);

  const value = {
    isConnected,
    account,
    provider,
    signer,
    balance,
    chainId,
    isLoading,
    connectionError,
    connectWallet,
    disconnectWallet,
    getTransactionHistory,
    signMessage,
    verifySignature,
    switchNetwork,
    addNetwork,
    getNetworkName,
    isMetaMaskInstalled,
    clearError,
    getWalletStatus
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
