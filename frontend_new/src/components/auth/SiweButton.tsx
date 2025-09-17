import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useSiwe } from '../../hooks/useSiwe';
import { useAuth } from '../../context/AuthContext';

const SiweButton: React.FC = () => {
  const { wallet, connectWallet, isLoading: walletLoading } = useWallet();
  const { signInWithEthereum, isLoading: siweLoading } = useSiwe();
  const { login } = useAuth();

  const handleSignIn = async () => {
    try {
      if (!wallet.isConnected) {
        await connectWallet();
        return;
      }

      const address = wallet.accounts[0];
      const response = await signInWithEthereum(address);
      
      if (response.success) {
        login(response.token, response.user);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Sign in failed. Please try again.');
    }
  };

  if (!wallet.isInstalled) {
    return (
      <div className="siwe-container">
        <p>Please install MetaMask to continue</p>
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="install-button"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  const isLoading = walletLoading || siweLoading;
  const buttonText = wallet.isConnected 
    ? 'Sign-In with Ethereum' 
    : 'Connect Wallet';

  return (
    <div className="siwe-container">
      <button 
        onClick={handleSignIn}
        disabled={isLoading}
        className="siwe-button"
      >
        {isLoading ? 'Loading...' : buttonText}
      </button>
      
      {wallet.isConnected && (
        <p className="connected-address">
          Connected: {wallet.accounts[0].substring(0, 6)}...{wallet.accounts[0].substring(38)}
        </p>
      )}
    </div>
  );
};

export default SiweButton;
