import { MetaMaskProvider } from '../types/wallet';

export const getMetaMaskProvider = (): MetaMaskProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum as MetaMaskProvider;
  }
  return null;
};

export const isMetaMaskInstalled = (): boolean => {
  return Boolean(getMetaMaskProvider());
};

export const requestAccounts = async (): Promise<string[]> => {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error('MetaMask is not installed');
  }

  return await provider.request({
    method: 'eth_requestAccounts'
  });
};

export const getChainId = async (): Promise<string> => {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error('MetaMask is not installed');
  }

  return await provider.request({
    method: 'eth_chainId'
  });
};

export const signMessage = async (message: string, address: string): Promise<string> => {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error('MetaMask is not installed');
  }

  return await provider.request({
    method: 'personal_sign',
    params: [message, address]
  });
};
