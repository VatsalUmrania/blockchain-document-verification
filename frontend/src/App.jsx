// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { Web3Provider } from './context/Web3Context';
// import { DocumentStatsProvider } from './context/DocumentStatsContext';
// import Navbar from './components/layout/Navbar';
// import Dashboard from './components/dashboard/Dashboard';
// import UploadPage from './components/document/DocumentUpload';
// import VerificationPortal from './components/verification/VerificationPortal';
// import ThirdPartyVerification from './components/verification/ThirdPartyVerification';
// import DocumentIssuanceWorkflow from './components/issuance/DocumentIssuanceWorkflow';
// import QRCodeScanner from './components/qr/QRCodeScanner';
// import UserTypeSelection from './components/common/UserTypeSelection';

// function App() {
//   return (
//     <Web3Provider>
//       <DocumentStatsProvider>
//         <Router>
//           <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212]">
//             {/* Navigation */}
//             <Navbar />

//             {/* Main Content Area */}
//             <main className="pt-20 min-h-screen">
//               <Routes>
//                 <Route path="/" element={<UserTypeSelection />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/upload" element={<UploadPage />} />
//                 <Route path="/verify" element={<VerificationPortal />} />
//                 <Route path="/third-party-verify" element={<ThirdPartyVerification />} />
//                 <Route path="/issue-document" element={<DocumentIssuanceWorkflow />} />
//                 <Route path="/qr-scanner" element={<QRCodeScanner />} />
//               </Routes>
//             </main>

//             {/* Toast Notifications */}
//             <ToastContainer
//               position="bottom-right"
//               autoClose={4000}
//               hideProgressBar={false}
//               newestOnTop={true}
//               closeOnClick
//               rtl={false}
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="dark"
//               className="toast-container"
//               toastClassName="!bg-[#1A1A1A] !border-2 !border-[#296CFF] !text-[#E0E0E0] !rounded-xl !shadow-lg"
//               bodyClassName="text-sm font-medium"
//               progressClassName="!bg-gradient-to-r !from-[#296CFF] !to-[#00C853]"
//             />
//           </div>
//         </Router>
//       </DocumentStatsProvider>
//     </Web3Provider>
//   );
// }

// export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Web3Provider } from './context/Web3Context';
import { DocumentStatsProvider } from './context/DocumentStatsContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import UploadPage from './components/document/DocumentUpload';
import VerificationPortal from './components/verification/VerificationPortal';
import ThirdPartyVerification from './components/verification/ThirdPartyVerification';
import DocumentIssuanceWorkflow from './components/issuance/DocumentIssuanceWorkflow';
import QRCodeScanner from './components/qr/QRCodeScanner';
import UserTypeSelection from './components/common/UserTypeSelection';

function App() {
  const [theme, setTheme] = useState('dark');

  // Initialize theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setTheme(shouldUseDark ? 'dark' : 'light');
    applyTheme(shouldUseDark);
  }, []);

  const applyTheme = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  };

  // Listen for theme changes from localStorage (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue === 'light' ? 'light' : 'dark';
        setTheme(newTheme);
        applyTheme(newTheme === 'dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Web3Provider>
      <DocumentStatsProvider>
        <Router>
          <div 
            className="min-h-screen transition-colors duration-300"
            style={{
              background: `linear-gradient(135deg, 
                rgb(var(--bg-primary)), 
                rgb(var(--surface-primary)), 
                rgb(var(--surface-secondary))
              )`
            }}
          >
            {/* Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="pt-20 min-h-screen">
              <Routes>
                <Route path="/" element={<UserTypeSelection />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/verify" element={<VerificationPortal />} />
                <Route path="/third-party-verify" element={<ThirdPartyVerification />} />
                <Route path="/issue-document" element={<DocumentIssuanceWorkflow />} />
                <Route path="/qr-scanner" element={<QRCodeScanner />} />
              </Routes>
            </main>

            {/* Toast Notifications */}
            <ToastContainer
              position="bottom-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme}
              className="toast-container"
              toastClassName="!bg-[rgb(var(--surface-primary))] !border-2 !border-[rgb(var(--color-primary))] !text-[rgb(var(--text-primary))] !rounded-xl !shadow-lg"
              bodyClassName="text-sm font-medium"
              progressClassName="!bg-gradient-to-r !from-[rgb(var(--color-primary))] !to-[rgb(var(--color-success))]"
            />
          </div>
        </Router>
      </DocumentStatsProvider>
    </Web3Provider>
  );
}

export default App;
