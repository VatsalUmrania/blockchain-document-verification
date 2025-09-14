import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  ReactNode,
  useRef
} from 'react';
import { ethers, BrowserProvider, JsonRpcSigner, TransactionResponse } from 'ethers';
import { toast } from 'sonner';

// Types and Interfaces
interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  type: 'sent' | 'received';
  status: 'confirmed' | 'pending' | 'failed';
}

interface WalletStatus {
  isConnected: boolean;
  account: string | null;
  balance: string;
  chainId: number | null;
  networkName: string | null;
  isLoading: boolean;
  connectionError: string | null;
  isMetaMaskInstalled: boolean;
}

interface Web3ContextType {
  // State
  isConnected: boolean;
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  balance: string;
  chainId: number | null;
  isLoading: boolean;
  connectionError: string | null;

  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getTransactionHistory: (limit?: number) => Promise<Transaction[]>;
  signMessage: (message: string) => Promise<string>;
  verifySignature: (message: string, signature: string, expectedAddress: string) => Promise<boolean>;
  switchNetwork: (chainId: number) => Promise<void>;
  addNetwork: (networkConfig: NetworkConfig) => Promise<void>;
  getNetworkName: (chainId: number | null) => string;
  isMetaMaskInstalled: () => boolean;
  clearError: () => void;
  getWalletStatus: () => WalletStatus;
}

interface Web3ProviderProps {
  children: ReactNode;
}

// Ethereum Error Interface
interface EthereumError extends Error {
  code: number;
  message: string;
}

// Ethereum Window Interface
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

// Create Context
const Web3Context = createContext<Web3ContextType | null>(null);

// Custom Hook
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Provider Component
export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Refs to prevent duplicate operations and toasts
  const isInitializing = useRef<boolean>(false);
  const hasShownConnectionToast = useRef<boolean>(false);
  const isReconnecting = useRef<boolean>(false);
  const lastToastTime = useRef<number>(0);

  // Debounce function to prevent spam toasts
  const debounceToast = useCallback((callback: () => void, delay: number = 1000) => {
    const now = Date.now();
    if (now - lastToastTime.current > delay) {
      lastToastTime.current = now;
      callback();
    }
  }, []);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback((): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           Boolean(window.ethereum.isMetaMask);
  }, []);

  // Get network name for user-friendly display
  const getNetworkName = useCallback((chainId: number | null): string => {
    if (!chainId) return 'Unknown Network';
    
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
      case 42161:
        return 'Arbitrum One';
      case 10:
        return 'Optimism';
      case 8453:
        return 'Base Mainnet';
      default:
        return `Network ${chainId}`;
    }
  }, []);

  // Update balance with enhanced error handling
  const updateBalance = useCallback(async (address: string, currentProvider: BrowserProvider): Promise<void> => {
    if (!currentProvider || !address) return;
    
    try {
      const balance = await currentProvider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      // Don't show toast for balance update errors to avoid spam
    }
  }, []);

  // Handle account changes with error handling and toast prevention
  const handleAccountsChanged = useCallback(async (accounts: string[]): Promise<void> => {
    // Prevent handling during initialization or reconnection
    if (isInitializing.current || isReconnecting.current) {
      return;
    }

    try {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        setIsConnected(false);
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setBalance('0');
        setChainId(null);
        setConnectionError(null);
        hasShownConnectionToast.current = false;
        
        debounceToast(() => {
          toast.info('Wallet Disconnected', {
            description: 'Please connect to MetaMask',
          });
        });
      } else if (accounts[0] !== account) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        
        if (provider) {
          await updateBalance(newAccount, provider);
        }
        
        // Only show account switch toast if we're not in the initial connection phase
        if (account && !hasShownConnectionToast.current) {
          debounceToast(() => {
            toast.success('Account Switched', {
              description: `Account switched to ${newAccount.substring(0, 6)}...${newAccount.substring(newAccount.length - 4)}`,
            });
          });
        }
      }
    } catch (error) {
      console.error('❌ Error handling account change:', error);
      debounceToast(() => {
        toast.error('Account Switch Error', {
          description: 'Error switching accounts',
        });
      });
    }
  }, [account, provider, updateBalance, debounceToast]);

  // Handle chain changes with error handling
  const handleChainChanged = useCallback((chainIdHex: string): void => {
    try {
      const newChainId = parseInt(chainIdHex, 16);
      const networkName = getNetworkName(newChainId);
      
      setChainId(newChainId);
      
      // Only show network change toast if we're not initializing
      if (!isInitializing.current && !isReconnecting.current) {
        debounceToast(() => {
          toast.info('Network Changed', {
            description: `Network changed to ${networkName}`,
          });
        });
        
        // Reload the page to avoid any errors with the current provider
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error handling chain change:', error);
      if (!isInitializing.current) {
        debounceToast(() => {
          toast.error('Network Change Error', {
            description: 'Error handling network change',
          });
        });
      }
    }
  }, [getNetworkName, debounceToast]);

  // Internal connect function without toasts (for reconnection)
  const connectWalletInternal = useCallback(async (showToast: boolean = true): Promise<boolean> => {
    if (!isMetaMaskInstalled()) {
      if (showToast) {
        toast.error('MetaMask Required', {
          description: 'Please install MetaMask extension first',
        });
      }
      setConnectionError('MetaMask not installed');
      return false;
    }

    setIsLoading(true);
    setConnectionError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      // Request account access if needed
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider using ethers v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setBalance(ethers.formatEther(balance));
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      if (showToast && !hasShownConnectionToast.current) {
        hasShownConnectionToast.current = true;
        debounceToast(() => {
          toast.success('Wallet Connected', {
            description: `Successfully connected to ${getNetworkName(Number(network.chainId))}`,
          });
        });
      }
      
      // Store connection status in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      
      return true;
    } catch (error) {
      console.error('❌ Error connecting to wallet:', error);
      const ethError = error as EthereumError;
      
      let errorMessage = 'Failed to connect wallet';
      if (ethError.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (ethError.code === -32002) {
        errorMessage = 'Connection request pending. Please check MetaMask.';
      } else if (ethError.code === -32603) {
        errorMessage = 'Internal MetaMask error. Please try again.';
      }
      
      setConnectionError(errorMessage);
      if (showToast) {
        debounceToast(() => {
          toast.error('Connection Failed', {
            description: errorMessage,
          });
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, getNetworkName, debounceToast]);

  // Public connect wallet method
  const connectWallet = useCallback(async (): Promise<void> => {
    await connectWalletInternal(true);
  }, [connectWalletInternal]);

  // Disconnect wallet
  const disconnectWallet = useCallback((): void => {
    try {
      setIsConnected(false);
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setBalance('0');
      setChainId(null);
      setConnectionError(null);
      hasShownConnectionToast.current = false;
      
      // Remove from localStorage
      localStorage.removeItem('walletConnected');
      
      debounceToast(() => {
        toast.info('Wallet Disconnected', {
          description: 'Successfully disconnected from wallet',
        });
      });
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      debounceToast(() => {
        toast.error('Disconnection Error', {
          description: 'Error disconnecting wallet',
        });
      });
    }
  }, [debounceToast]);

  // Get transaction history with improved error handling
  const getTransactionHistory = useCallback(async (limit: number = 10): Promise<Transaction[]> => {
    if (!provider || !account) {
      return [];
    }

    try {
      const transactions: Transaction[] = [];
      const currentBlock = await provider.getBlockNumber();
      
      // Look through recent blocks (simplified approach)
      for (let i = 0; i < Math.min(20, currentBlock) && transactions.length < limit; i++) {
        try {
          const block = await provider.getBlock(currentBlock - i, true);
          if (!block || !block.transactions) continue;
          
          const userTxs = block.transactions.filter((tx) => {
            const transaction = tx as TransactionResponse;
            return transaction.from?.toLowerCase() === account.toLowerCase() || 
                   transaction.to?.toLowerCase() === account.toLowerCase();
          });

          for (const tx of userTxs) {
            if (transactions.length >= limit) break;
            
            const transaction = tx as TransactionResponse;
            transactions.push({
              id: transaction.hash,
              hash: transaction.hash,
              from: transaction.from,
              to: transaction.to || 'Contract Creation',
              value: ethers.formatEther(transaction.value || '0'),
              timestamp: (block.timestamp || 0) * 1000,
              blockNumber: transaction.blockNumber || 0,
              type: transaction.from?.toLowerCase() === account.toLowerCase() ? 'sent' : 'received',
              status: 'confirmed'
            });
          }
        } catch {
          // Skip problematic blocks silently
          continue;
        }
      }
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error);
      debounceToast(() => {
        toast.error('Transaction History Error', {
          description: 'Failed to fetch transaction history',
        });
      });
      return [];
    }
  }, [provider, account, debounceToast]);

  // Sign message with enhanced error handling
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    try {
      const signature = await signer.signMessage(message);
      
      debounceToast(() => {
        toast.success('Message Signed', {
          description: 'Message signed successfully',
        });
      });
      
      return signature;
    } catch (error) {
      console.error('❌ Error signing message:', error);
      const ethError = error as EthereumError;
      
      let errorMessage = 'Failed to sign message';
      if (ethError.code === 4001) {
        errorMessage = 'Message signing rejected by user';
      } else if (ethError.code === -32603) {
        errorMessage = 'Internal error while signing message';
      }
      
      debounceToast(() => {
        toast.error('Signing Error', {
          description: errorMessage,
        });
      });
      
      throw error;
    }
  }, [signer, debounceToast]);

  // Verify signature with error handling
  const verifySignature = useCallback(async (
    message: string, 
    signature: string, 
    expectedAddress: string
  ): Promise<boolean> => {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('❌ Error verifying signature:', error);
      return false;
    }
  }, []);

  // Switch network with error handling
  const switchNetwork = useCallback(async (targetChainId: number): Promise<void> => {
    if (!window.ethereum) {
      debounceToast(() => {
        toast.error('MetaMask Required', {
          description: 'MetaMask not available',
        });
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      debounceToast(() => {
        toast.success('Network Switched', {
          description: `Switched to ${getNetworkName(targetChainId)}`,
        });
      });
    } catch (error) {
      console.error('❌ Error switching network:', error);
      const ethError = error as EthereumError;
      
      let errorMessage = 'Failed to switch network';
      if (ethError.code === 4902) {
        errorMessage = 'Network not added to MetaMask. Please add it first.';
      } else if (ethError.code === 4001) {
        errorMessage = 'Network switch rejected by user';
      }
      
      debounceToast(() => {
        toast.error('Network Switch Error', {
          description: errorMessage,
        });
      });
    }
  }, [getNetworkName, debounceToast]);

  // Add network with error handling
  const addNetwork = useCallback(async (networkConfig: NetworkConfig): Promise<void> => {
    if (!window.ethereum) {
      debounceToast(() => {
        toast.error('MetaMask Required', {
          description: 'MetaMask not available',
        });
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
      
      debounceToast(() => {
        toast.success('Network Added', {
          description: `Network ${networkConfig.chainName} added successfully`,
        });
      });
    } catch (error) {
      console.error('❌ Error adding network:', error);
      const ethError = error as EthereumError;
      
      let errorMessage = 'Failed to add network';
      if (ethError.code === 4001) {
        errorMessage = 'Network addition rejected by user';
      }
      
      debounceToast(() => {
        toast.error('Add Network Error', {
          description: errorMessage,
        });
      });
    }
  }, [debounceToast]);

  // Clear error state
  const clearError = useCallback((): void => {
    setConnectionError(null);
  }, []);

  // Get wallet status
  const getWalletStatus = useCallback((): WalletStatus => {
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

  // Setup event listeners with error handling
  useEffect(() => {
    if (window.ethereum) {
      try {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
          try {
            if (window.ethereum) {
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
              window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
          } catch (error) {
            console.error('❌ Error removing Web3 event listeners:', error);
          }
        };
      } catch (error) {
        console.error('❌ Error setting up Web3 event listeners:', error);
      }
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Check if already connected on mount with error handling - FIXED TO PREVENT DOUBLE TOASTS
  useEffect(() => {
    const checkConnection = async (): Promise<void> => {
      if (isInitializing.current) return; // Prevent multiple initialization
      
      isInitializing.current = true;
      isReconnecting.current = true;

      try {
        if (isMetaMaskInstalled()) {
          const wasConnected = localStorage.getItem('walletConnected');
          
          if (wasConnected) {
            try {
              if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
                if (accounts.length > 0) {
                  // Reconnect silently without showing toast
                  await connectWalletInternal(false);
                } else {
                  // Clean up localStorage if no accounts
                  localStorage.removeItem('walletConnected');
                }
              }
            } catch (error) {
              console.error('❌ Error checking wallet connection:', error);
              localStorage.removeItem('walletConnected');
            }
          }
        }
      } finally {
        // Reset initialization flags after a short delay
        setTimeout(() => {
          isInitializing.current = false;
          isReconnecting.current = false;
        }, 1000);
      }
    };
    
    checkConnection();
  }, [isMetaMaskInstalled, connectWalletInternal]);

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

  // Context value
  const value: Web3ContextType = {
    // State
    isConnected,
    account,
    provider,
    signer,
    balance,
    chainId,
    isLoading,
    connectionError,
    
    // Methods
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
