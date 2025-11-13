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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F7FAFF] to-[#EEF2FF] px-6 py-10">
      <div className="max-w-5xl w-full mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Welcome to <span className="text-blue-600">DocVerify</span>
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto leading-relaxed">
            Cryptographic proof based document verification — choose how you want to interact with the chain.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Individual Section */}
          <div 
            className="group p-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-blue-200 hover:border-blue-500 shadow-md hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 transition rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Individual User</h3>
            <p className="text-gray-600 text-sm text-center mb-4">
              Upload, track and manage your personal verified documents
            </p>
            <p className="text-blue-600 font-semibold text-center group-hover:underline tracking-wide">
              Access Dashboard →
            </p>
          </div>

          {/* Institution */}
          <div 
            className="group p-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-green-200 hover:border-green-500 shadow-md hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/issue-document')}
          >
            <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 transition rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Institution</h3>
            <p className="text-gray-600 text-sm text-center mb-4">
              Issue tamper-proof documents backed by chain integrity
            </p>
            <p className="text-green-600 font-semibold text-center group-hover:underline tracking-wide">
              Issue Documents →
            </p>
          </div>

          {/* Third Party */}
          <div 
            className="group p-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-200 hover:border-purple-500 shadow-md hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/third-party-verify')}
          >
            <div className="w-16 h-16 bg-purple-100 group-hover:bg-purple-200 transition rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Third Party</h3>
            <p className="text-gray-600 text-sm text-center mb-4">
              Verify authenticity cryptographically in seconds
            </p>
            <p className="text-purple-600 font-semibold text-center group-hover:underline tracking-wide">
              Verify Documents →
            </p>
          </div>

        </div>
      </div>
    </div>  
  );
};

export default UserTypeSelection;
