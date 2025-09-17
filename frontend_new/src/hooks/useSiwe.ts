import { useState, useCallback } from 'react';
import { SiweMessage } from 'siwe';
import { siweService } from '../services/siweService';
import { signMessage } from '../utils/wallet';
import { SIWE_STATEMENT } from '../utils/constants';
import { LoginResponse } from '../types/auth';

export const useSiwe = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithEthereum = useCallback(async (address: string): Promise<LoginResponse> => {
    setIsLoading(true);

    try {
      // Get nonce from backend
      const { nonce } = await siweService.getNonce();

      // Create SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: SIWE_STATEMENT,
        uri: window.location.origin,
        version: '1',
        chainId: parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16),
        nonce
      });

      const message = siweMessage.prepareMessage();

      // Sign message with MetaMask
      const signature = await signMessage(message, address);

      // Send to backend for verification
      const loginResponse = await siweService.login(message, signature, address);

      return loginResponse;
    } catch (error) {
      console.error('SIWE login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    signInWithEthereum,
    isLoading
  };
};
