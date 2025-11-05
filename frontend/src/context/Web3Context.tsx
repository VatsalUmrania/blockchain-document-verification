import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers, BrowserProvider, Eip1193Provider, getAddress } from 'ethers';
import { SiweMessage } from 'siwe';
import { toast } from 'sonner';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Extended User type with name and username
interface User {
  id: string;
  address: string;
  role: string;
  name?: string; // Added optional name property
  username?: string; // Added optional username property
  email?: string; // Added optional email property
  createdAt?: string;
  updatedAt?: string;
}

// Augment the Window interface to include the standard Ethereum provider
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

// Define the shape of the context value
interface Web3ContextType {
  // Wallet state
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: bigint | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  
  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signInWithEthereum: () => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>; // Added method to update user profile
}

// Create the context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Custom hook for easy access to the context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Wallet state
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Disconnect wallet and clear all state
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setIsConnected(false);
    
    // Clear session from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('walletConnected');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    console.log('🔌 Wallet disconnected');
    toast.info('Wallet Disconnected', {
      description: 'Your wallet has been disconnected'
    });
  }, []);

  // Connect to MetaMask wallet
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask Not Found', {
        description: 'Please install MetaMask to use this application'
      });
      return;
    }

    setIsConnecting(true);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const web3Signer = await web3Provider.getSigner();
        const userAccount = await web3Signer.getAddress();
        const network = await web3Provider.getNetwork();
        const userBalance = await web3Provider.getBalance(userAccount);

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(getAddress(userAccount));
        setChainId(network.chainId);
        setBalance(ethers.formatEther(userBalance));
        setIsConnected(true);

        localStorage.setItem('walletConnected', 'true');

        console.log('✅ Wallet connected:', userAccount);
        console.log('   Network:', network.name, `(Chain ID: ${network.chainId})`);
        console.log('   Balance:', ethers.formatEther(userBalance), 'ETH');
        
        toast.success('Wallet Connected', {
          description: `Connected to ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`
        });
      } else {
        throw new Error("No accounts found.");
      }

    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      disconnectWallet();
      
      if (error.code !== 4001) {
        toast.error('Connection Failed', {
          description: error.message || 'Failed to connect wallet. Please try again.'
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [disconnectWallet]);

  // Restore wallet connection on page load
  useEffect(() => {
    const restoreSession = async () => {
      const walletWasConnected = localStorage.getItem('walletConnected');
      const savedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      // Restore auth session
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Session restored from localStorage');
          console.log('   User:', userData.address);
          console.log('   Role:', userData.role);
        } catch (error) {
          console.error('❌ Failed to restore session:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }

      // Restore wallet connection
      if (walletWasConnected === 'true' && window.ethereum) {
        try {
          console.log('🔄 Restoring wallet connection...');
          
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          
          // Check if already connected
          const accounts = await web3Provider.send('eth_accounts', []);
          
          if (accounts.length > 0) {
            const web3Signer = await web3Provider.getSigner();
            const userAccount = await web3Signer.getAddress();
            const network = await web3Provider.getNetwork();
            const userBalance = await web3Provider.getBalance(userAccount);

            setProvider(web3Provider);
            setSigner(web3Signer);
            setAccount(getAddress(userAccount));
            setChainId(network.chainId);
            setBalance(ethers.formatEther(userBalance));
            setIsConnected(true);

            console.log('✅ Wallet reconnected automatically:', userAccount);
          } else {
            // Wallet not connected anymore, clear flag
            localStorage.removeItem('walletConnected');
          }
        } catch (error) {
          console.error('❌ Failed to restore wallet:', error);
          localStorage.removeItem('walletConnected');
        }
      }
    };

    restoreSession();
  }, []);

  // Sign in with Ethereum (SIWE)
  const signInWithEthereum = useCallback(async () => {
    if (!signer || !account || !chainId) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your wallet first'
      });
      return;
    }

    setIsAuthenticating(true);
    try {
      console.log('🔐 Starting SIWE authentication...');

      // Step 1: Get nonce from backend
      console.log('📝 Requesting nonce from backend...');
      const nonceResponse = await fetch(`${API_BASE_URL}/api/auth/nonce`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!nonceResponse.ok) {
        throw new Error(`Failed to get nonce: ${nonceResponse.statusText}`);
      }

      const nonceData = await nonceResponse.json();
      const nonce = nonceData.nonce;
      console.log('✅ Nonce received:', nonce);
      
      const checksumAddress = getAddress(account);

      // Step 2: Create the SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: checksumAddress,
        statement: 'Sign in to Blockchain Document Verification with Ethereum',
        uri: window.location.origin,
        version: '1',
        chainId: Number(chainId),
        nonce: nonce,
      });

      // Step 3: Prepare and sign the message
      const messageToSign = siweMessage.prepareMessage();
      console.log('📄 SIWE message prepared');

      toast.info('Signature Required', {
        description: 'Please sign the message in MetaMask'
      });

      const signature = await signer.signMessage(messageToSign);
      console.log('✍️ Message signed successfully');

      // Step 4: Verify with backend
      console.log('🔄 Sending verification to backend...');
      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          message: messageToSign,
          signature 
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      // Step 5: Save session
      const responseData = await verifyResponse.json();
      console.log('✅ Verification response received');

      if (responseData.success && responseData.token) {
        const authToken = responseData.token;
        const userData = responseData.user;

        // Ensure user data has name/username fields
        const enhancedUserData: User = {
          ...userData,
          name: userData.name || `User_${userData.address.substring(2, 8)}`, // Default name
          username: userData.username || userData.address.substring(2, 8), // Default username
        };

        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(enhancedUserData));
        
        setToken(authToken);
        setUser(enhancedUserData);
        setIsAuthenticated(true);

        console.log('✅ Authentication successful!');
        console.log('   User ID:', enhancedUserData.id);
        console.log('   Address:', enhancedUserData.address);
        console.log('   Role:', enhancedUserData.role);
        console.log('   Name:', enhancedUserData.name);
        console.log('   Username:', enhancedUserData.username);
        
        toast.success('Signed In Successfully', {
          description: `Welcome back, ${enhancedUserData.name || enhancedUserData.role}!`
        });
      } else {
        throw new Error('Invalid verification response');
      }

    } catch (error: any) {
      console.error('❌ SIWE authentication error:', error);
      
      if (error.code === 4001) {
        toast.error('Signature Rejected', {
          description: 'You rejected the signature request'
        });
      } else if (error.name === 'SyntaxError') {
        toast.error('Backend Error', {
          description: 'Invalid response from server. Please check backend logs.'
        });
      } else {
        toast.error('Authentication Failed', {
          description: error.message || 'Failed to authenticate'
        });
      }
      
      // Don't disconnect wallet on auth failure, just reset auth state
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setIsAuthenticating(false);
    }
  }, [signer, account, chainId]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    if (!token || !user) {
      toast.error('Not Authenticated', {
        description: 'Please sign in to update your profile'
      });
      return;
    }

    try {
      console.log('🔄 Updating user profile...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUserData = await response.json();
      
      // Update local state
      const enhancedUserData: User = {
        ...updatedUserData,
        name: updatedUserData.name || user.name,
        username: updatedUserData.username || user.username,
      };

      setUser(enhancedUserData);
      localStorage.setItem('user', JSON.stringify(enhancedUserData));

      console.log('✅ Profile updated successfully');
      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully'
      });

    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      toast.error('Update Failed', {
        description: error.message || 'Failed to update profile'
      });
    }
  }, [token, user]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (token) {
        console.log('🔓 Logging out from backend...');
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        console.log('✅ Logged out from backend');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      disconnectWallet();
    }
  }, [token, disconnectWallet]);

  // Effect to handle wallet events like account or network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('🔄 Account changed:', accounts);
      if (accounts.length === 0) {
        console.log('   User disconnected wallet');
        logout();
      } else {
        // Account changed, need to re-authenticate
        console.log('   Switching to account:', accounts[0]);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        toast.warning('Account Changed', {
          description: 'Please sign in again with your new account'
        });
        connectWallet();
      }
    };

    const handleChainChanged = (newChainId: string) => {
      console.log('🔄 Chain changed to:', newChainId);
      toast.info('Network Changed', {
        description: 'Page will reload to update network...'
      });
      setTimeout(() => window.location.reload(), 1000);
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [connectWallet, logout]);

  // The value provided to consuming components
  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    balance,
    isConnected,
    isConnecting,
    user,
    token,
    isAuthenticated,
    isAuthenticating,
    connectWallet,
    disconnectWallet,
    signInWithEthereum,
    logout,
    updateUserProfile // Added the new method
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};