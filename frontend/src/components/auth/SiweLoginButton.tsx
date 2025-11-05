import React from 'react';
import { useWeb3 } from '../../context/Web3Context';

const SiweLoginButton: React.FC = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    isAuthenticated, 
    isAuthenticating, 
    user,
    connectWallet, 
    signInWithEthereum, 
    logout 
  } = useWeb3();

  // If already authenticated, show user info
  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col gap-4 p-6 border-2 border-green-200 rounded-xl bg-green-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">Authenticated</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-green-800">Welcome Back!</h3>
          <div className="text-sm text-green-600 space-y-1">
            <p>
              <span className="font-medium">Address:</span>{' '}
              {user.address.substring(0, 6)}...{user.address.substring(38)}
            </p>
            {user.ensName && (
              <p>
                <span className="font-medium">ENS:</span> {user.ensName}
              </p>
            )}
            <p>
              <span className="font-medium">Last Login:</span>{' '}
              {new Date(user.lastLoginAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </div>
    );
  }

  // If wallet connected but not authenticated
  if (isConnected && account) {
    return (
      <div className="flex flex-col gap-4 p-6 border-2 border-blue-200 rounded-xl bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-700">Wallet Connected</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-blue-600">
            <span className="font-medium">Connected:</span>{' '}
            {account.substring(0, 6)}...{account.substring(38)}
          </p>
          <p className="text-xs text-blue-500">
            Click below to sign in with your Ethereum account
          </p>
        </div>
        
        <button
          onClick={signInWithEthereum}
          disabled={isAuthenticating}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium"
        >
          {isAuthenticating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing Message...
            </div>
          ) : (
            'Sign-In with Ethereum'
          )}
        </button>
      </div>
    );
  }

  // If MetaMask not detected
  if (!window.ethereum) {
    return (
      <div className="text-center p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🦊</span>
          </div>
          <h3 className="font-semibold mb-2 text-orange-800">MetaMask Required</h3>
          <p className="text-sm text-orange-600 mb-4">
            Please install MetaMask to continue with Web3 authentication
          </p>
        </div>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  // Default: Connect Wallet
  return (
    <div className="text-center p-6 border-2 border-gray-200 rounded-xl bg-gray-50">
      <div className="mb-4 ">
        <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="font-semibold mb-2 ">Connect Your Wallet</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your Ethereum wallet to access the document verification system
        </p>
      </div>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full px-6 py-3 bg-blue-600 text-accent-foreground rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
      >
        {isConnecting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
    </div>
  );
};

export default SiweLoginButton;
