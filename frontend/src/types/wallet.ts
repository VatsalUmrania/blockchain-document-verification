export interface WalletState {
    accounts: string[];
    chainId: string | null;
    isConnected: boolean;
    isInstalled: boolean;
  }
  
  export interface MetaMaskProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
  }
  