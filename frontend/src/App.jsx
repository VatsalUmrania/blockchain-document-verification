// import React, { useState } from 'react';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Web3Provider } from './context/Web3Context';
// import Navbar from './components/layout/Navbar';
// import DocumentUpload from './components/document/DocumentUpload';
// import VerificationPortal from './components/verification/VerificationPortal';
// import Dashboard from './components/dashboard/Dashboard';
// import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

// function App() {
//   const [activeTab, setActiveTab] = useState('dashboard');

//   const renderActiveComponent = () => {
//     switch (activeTab) {
//       case 'upload':
//         return <DocumentUpload />;
//       case 'verify':
//         return <VerificationPortal />;
//       case 'analytics':
//         return <AnalyticsDashboard />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <Web3Provider>
//       <div className="min-h-screen"> {/* Removed bg-gray-50 */}
//         <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
//         <main className="py-8">
//           {renderActiveComponent()}
//         </main>
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="dark" // Changed from "light" to "dark"
//           className="toast-container"
//           toastClassName="bg-surface/95 backdrop-blur-sm border border-primary-500/20 text-foreground"
//           bodyClassName="text-sm"
//           progressClassName="bg-accent-500"
//         />
//       </div>
//     </Web3Provider>
//   );
// }

// export default App;

// App.jsx (Corrected routing)
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { Web3Provider } from './context/Web3Context';
// import { DocumentStatsProvider } from './context/DocumentStatsContext';
// import Navbar from './components/layout/Navbar';
// import Dashboard from './components/dashboard/Dashboard';
// import DocumentUpload from './components/document/DocumentUpload';
// import VerificationPortal from './components/verification/VerificationPortal';
// // import Analytics from './components/analytics/Analytics';


// function App() {
//   return (
//     <Web3Provider>
//       <DocumentStatsProvider>
//         <Router>
//           <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
//             <Navbar />
//             <main className="pt-20">
//               <Routes>
//                 {/* Fix the route paths - they were all pointing to "/" */}
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/upload" element={<DocumentUpload />} />
//                 <Route path="/verify" element={<VerificationPortal />} />
//                 {/* <Route path="/analytics" element={<Analytics />} /> */}
//               </Routes>
//             </main>
//             <ToastContainer
//               position="top-right"
//               autoClose={3000}
//               hideProgressBar={false}
//               newestOnTop={false}
//               closeOnClick
//               rtl={false}
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="dark"
//               className="toast-container"
//               toastClassName="bg-surface/95 backdrop-blur-sm border border-primary-500/20 text-foreground"
//               bodyClassName="text-sm"
//               progressClassName="bg-accent-500"
//             />
//           </div>
//         </Router>
//       </DocumentStatsProvider>
//     </Web3Provider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Web3Provider } from './context/Web3Context';
import { DocumentStatsProvider } from './context/documentStatsContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import UploadPage from './components/document/DocumentUpload';
import VerificationPortal from './components/verification/VerificationPortal';

function App() {
  return (
    <Web3Provider>
      <DocumentStatsProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212]">
            {/* Navigation */}
            <Navbar />
            
            {/* Main Content Area */}
            <main className="pt-20 min-h-screen">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/verify" element={<VerificationPortal />} />
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
              theme="dark"
              className="toast-container"
              toastClassName="!bg-[#1A1A1A] !border-2 !border-[#296CFF] !text-[#E0E0E0] !rounded-xl !shadow-lg"
              bodyClassName="text-sm font-medium"
              progressClassName="!bg-gradient-to-r !from-[#296CFF] !to-[#00C853]"
            />
          </div>
        </Router>
      </DocumentStatsProvider>
    </Web3Provider>
  );
}

export default App;
