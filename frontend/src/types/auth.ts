export interface User {
  id: string;
  address: string;
  role: 'Institute' | 'Individual' | 'Admin';
  ensName?: string;
  lastLoginAt: string;
}
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
  }
  