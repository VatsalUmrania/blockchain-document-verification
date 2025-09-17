import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import SiweLoginButton from './SiweLoginButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isAuthenticating } = useWeb3();

  if (isAuthenticating) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="max-w-md mx-auto mt-8">
        <SiweLoginButton />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
