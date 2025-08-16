// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { toast } from 'react-toastify';

// const Web3Context = createContext();

// export const useWeb3 = () => {
//   const context = useContext(Web3Context);
//   if (!context) {
//     throw new Error('useWeb3 must be used within a Web3Provider');
//   }
//   return context;
// };

// export const Web3Provider = ({ children }) => {
//   const [account, setAccount] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [chainId, setChainId] = useState(null);

//   const connectWallet = async () => {
//     // Check if MetaMask is installed
//     if (typeof window.ethereum === 'undefined') {
//       toast.error('MetaMask is not installed. Please install MetaMask to continue.');
//       return false;
//     }

//     setIsLoading(true);
//     try {
//       // Request account access
//       const accounts = await window.ethereum.request({
//         method: 'eth_requestAccounts',
//       });

//       if (accounts.length > 0) {
//         setAccount(accounts[0]);
//         setIsConnected(true);
        
//         // Get chain ID
//         const chainId = await window.ethereum.request({
//           method: 'eth_chainId',
//         });
//         setChainId(chainId);
        
//         toast.success('Wallet connected successfully!');
//         return true;
//       }
//     } catch (error) {
//       console.error('Error connecting wallet:', error);
//       if (error.code === 4001) {
//         toast.error('Please connect to MetaMask.');
//       } else {
//         toast.error('Failed to connect wallet. Please try again.');
//       }
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const disconnectWallet = () => {
//     setAccount(null);
//     setIsConnected(false);
//     setChainId(null);
//     toast.info('Wallet disconnected');
//   };

//   // Auto-connect if previously connected
//   useEffect(() => {
//     const checkConnection = async () => {
//       if (typeof window.ethereum !== 'undefined') {
//         try {
//           const accounts = await window.ethereum.request({
//             method: 'eth_accounts',
//           });
          
//           if (accounts.length > 0) {
//             setAccount(accounts[0]);
//             setIsConnected(true);
            
//             const chainId = await window.ethereum.request({
//               method: 'eth_chainId',
//             });
//             setChainId(chainId);
//           }
//         } catch (error) {
//           console.error('Error checking connection:', error);
//         }
//       }
//     };

//     checkConnection();
//   }, []);

//   // Listen for account changes
//   useEffect(() => {
//     if (typeof window.ethereum !== 'undefined') {
//       const handleAccountsChanged = (accounts) => {
//         if (accounts.length === 0) {
//           disconnectWallet();
//         } else {
//           setAccount(accounts[0]);
//           toast.info('Account changed');
//         }
//       };

//       const handleChainChanged = (chainId) => {
//         setChainId(chainId);
//         toast.info('Network changed');
//       };

//       window.ethereum.on('accountsChanged', handleAccountsChanged);
//       window.ethereum.on('chainChanged', handleChainChanged);

//       return () => {
//         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//         window.ethereum.removeListener('chainChanged', handleChainChanged);
//       };
//     }
//   }, []);

//   const value = {
//     account,
//     isConnected,
//     isLoading,
//     chainId,
//     connectWallet,
//     disconnectWallet,
//   };

//   return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
// };


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

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setIsConnected(false);
      setAccount('');
      setProvider(null);
      setSigner(null);
      setBalance('0');
      setChainId(null);
      toast.info('Please connect to MetaMask');
    } else if (accounts[0] !== account) {
      setAccount(accounts);
      if (provider) {
        try {
          const balance = await provider.getBalance(accounts);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      }
      toast.info('Account changed');
    }
  }, [account, provider]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainId) => {
    setChainId(parseInt(chainId, 16));
    // Reload the page to avoid any errors with the current provider
    window.location.reload();
  }, []);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask extension');
      return;
    }

    setIsLoading(true);
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

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
      
      toast.success('Wallet connected successfully');
      
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAccount('');
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setChainId(null);
    toast.info('Wallet disconnected');
  }, []);

  // Get transaction history
  const getTransactionHistory = useCallback(async (limit = 10) => {
    if (!provider || !account) return [];

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
              type: tx.from?.toLowerCase() === account.toLowerCase() ? 'sent' : 'received'
            });
          }
        } catch (blockError) {
          // Skip problematic blocks
          continue;
        }
      }
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }, [provider, account]);

  // Sign message
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error('No signer available');
    }
    
    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }, [signer]);

  // Verify signature
  const verifySignature = useCallback(async (message, signature, expectedAddress) => {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Auto-connect if already authorized
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };
    
    checkConnection();
  }, [isMetaMaskInstalled, connectWallet]);

  const value = {
    isConnected,
    account,
    provider,
    signer,
    balance,
    chainId,
    isLoading,
    connectWallet,
    disconnectWallet,
    getTransactionHistory,
    signMessage,
    verifySignature
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
