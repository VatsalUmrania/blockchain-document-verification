import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/layout/Navbar';
import DocumentUpload from './components/document/DocumentUpload';
import VerificationPortal from './components/verification/VerificationPortal';
import Dashboard from './components/dashboard/Dashboard';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'upload':
        return <DocumentUpload />;
      case 'verify':
        return <VerificationPortal />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'upload', label: 'Upload Documents' },
                { id: 'verify', label: 'Verify Documents' },
                { id: 'analytics', label: 'Analytics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="py-8">
          {renderActiveComponent()}
        </main>

        {/* Single ToastContainer - Fixed duplicate issue */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
        />
      </div>
    </Web3Provider>
  );
}

export default App;
