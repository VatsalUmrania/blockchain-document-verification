export const API_BASE_URL = import.meta.env.VITE_API_URL + "/api" || 'http://localhost:5000/api';

export const SIWE_STATEMENT = 'Sign in to Blockchain Document Verification';

export const ETHEREUM_METHODS = {
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  GET_ACCOUNTS: 'eth_accounts',
  GET_CHAIN_ID: 'eth_chainId',
  PERSONAL_SIGN: 'personal_sign'
} as const;
