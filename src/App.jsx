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
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="py-8">
          {renderActiveComponent()}
        </main>
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
