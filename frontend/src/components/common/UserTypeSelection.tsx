import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import SiweLoginButton from '../auth/SiweLoginButton';

const UserTypeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useWeb3();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">DocVerify System</h1>
            <p className="text-gray-600">
              Secure blockchain-based document verification
            </p>
          </div>
          <SiweLoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to DocVerify</h1>
          <p className="text-xl text-gray-600">
            Choose your role to access the appropriate features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Individual User */}
          <div 
            className="p-8 border-2 border-blue-200 rounded-xl hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => navigate('/dashboard')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Individual User</h3>
              <p className="text-gray-600 mb-4">
                Upload, verify, and manage your personal documents
              </p>
              <div className="text-sm text-blue-600 font-medium">
                Access Dashboard →
              </div>
            </div>
          </div>

          {/* Institution */}
          <div 
            className="p-8 border-2 border-green-200 rounded-xl hover:border-green-400 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => navigate('/issue-document')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Institution</h3>
              <p className="text-gray-600 mb-4">
                Issue and manage official documents for your organization
              </p>
              <div className="text-sm text-green-600 font-medium">
                Issue Documents →
              </div>
            </div>
          </div>

          {/* Third Party */}
          <div 
            className="p-8 border-2 border-purple-200 rounded-xl hover:border-purple-400 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => navigate('/third-party-verify')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Third Party</h3>
              <p className="text-gray-600 mb-4">
                Verify document authenticity and access verification tools
              </p>
              <div className="text-sm text-purple-600 font-medium">
                Verify Documents →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
