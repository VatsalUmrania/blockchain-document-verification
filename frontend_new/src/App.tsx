// import React, { useEffect, useState, useCallback } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Toaster } from 'sonner';

// // Context Providers
// import { Web3Provider } from './context/Web3Context';
// import { DocumentStatsProvider } from './context/DocumentStatsContext';

// // Components
// import Navbar from './components/layout/Navbar';
// import Dashboard from './components/dashboard/Dashboard';
// import UploadPage from './components/document/DocumentUpload';
// import VerificationPortal from './components/verification/VerificationPortal';
// import ThirdPartyVerification from './components/verification/ThirdPartyVerification';
// import DocumentIssuanceWorkflow from './components/issuance/DocumentIssuanceWorkflow';
// import QRCodeScanner from './components/qr/QRCodeScanner';
// import UserTypeSelection from './components/common/UserTypeSelection';

// // Types and Interfaces
// type Theme = 'light' | 'dark';

// interface AppState {
//   isInitialized: boolean;
//   hasError: boolean;
// }

// // Simple Theme Context (without external dependencies)
// const ThemeContext = React.createContext<{
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
// }>({
//   theme: 'dark',
//   setTheme: () => {},
// });

// // Simple Error Boundary Hook
// const useErrorHandler = () => {
//   const [hasError, setHasError] = useState(false);
  
//   const handleError = useCallback((error: Error) => {
//     console.error('App Error:', error);
//     setHasError(true);
//   }, []);
  
//   return { hasError, handleError, clearError: () => setHasError(false) };
// };

// // Loading Screen Component
// const LoadingScreen: React.FC = () => {
//   return (
//     <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
//       <div className="text-center space-y-6">
//         <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
//           <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">DocVerify System</h1>
//           <p className="text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // 404 Not Found Component
// const NotFoundPage: React.FC = () => {
//   return (
//     <div className="min-h-[60vh] flex items-center justify-center p-4">
//       <div className="text-center space-y-6 max-w-md">
//         <div className="text-6xl font-bold text-muted-foreground">404</div>
//         <div>
//           <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
//           <p className="text-muted-foreground mb-6">
//             The page you're looking for doesn't exist.
//           </p>
//         </div>
//         <div className="flex gap-4 justify-center">
//           <button 
//             onClick={() => window.history.back()}
//             className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
//           >
//             Go Back
//           </button>
//           <a 
//             href="/"
//             className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
//           >
//             Go Home
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Simple Theme Provider
// const SimpleThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [theme, setTheme] = useState<Theme>('dark');

//   // Initialize theme
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme') as Theme | null;
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
//     setTheme(initialTheme);
//     document.documentElement.classList.toggle('dark', initialTheme === 'dark');
//   }, []);

//   // Apply theme changes
//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', theme === 'dark');
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// const App: React.FC = () => {
//   // State
//   const [appState, setAppState] = useState<AppState>({
//     isInitialized: false,
//     hasError: false
//   });

//   const { hasError, handleError } = useErrorHandler();

//   // Initialize app
//   useEffect(() => {
//     const initializeApp = async (): Promise<void> => {
//       try {
//         // Small delay for better UX
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         console.log('🚀 DocVerify System initialized');
        
//         setAppState({
//           isInitialized: true,
//           hasError: false
//         });
//       } catch (error) {
//         console.error('❌ App initialization error:', error);
//         handleError(error as Error);
//         setAppState({
//           isInitialized: true,
//           hasError: true
//         });
//       }
//     };

//     initializeApp();
//   }, [handleError]);

//   // Show loading screen
//   if (!appState.isInitialized) {
//     return <LoadingScreen />;
//   }

//   // Show error state
//   if (appState.hasError || hasError) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center p-4">
//         <div className="text-center space-y-4 max-w-md">
//           <div className="text-4xl text-destructive">⚠️</div>
//           <div>
//             <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
//             <p className="text-muted-foreground mb-6">
//               Please refresh the page and try again.
//             </p>
//           </div>
//           <button 
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <SimpleThemeProvider>
//       <Web3Provider>
//         <DocumentStatsProvider>
//           <Router>
//             <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
//               {/* Navigation */}
//               <Navbar />

//               {/* Main Content */}
//               <main className="pt-20 min-h-screen">
//                 <Routes>
//                   <Route path="/" element={<UserTypeSelection />} />
//                   <Route path="/dashboard" element={<Dashboard />} />
//                   <Route path="/upload" element={<UploadPage />} />
//                   <Route path="/verify" element={<VerificationPortal />} />
//                   <Route path="/third-party-verify" element={<ThirdPartyVerification />} />
//                   <Route path="/issue-document" element={<DocumentIssuanceWorkflow />} />
//                   <Route path="/qr-scanner" element={<QRCodeScanner />} />
//                   <Route path="*" element={<NotFoundPage />} />
//                 </Routes>
//               </main>

//               {/* Toast Notifications */}
//               <Toaster
//                 position="bottom-right"
//                 expand={false}
//                 richColors
//                 closeButton
//                 toastOptions={{
//                   duration: 4000,
//                 }}
//               />
//             </div>
//           </Router>
//         </DocumentStatsProvider>
//       </Web3Provider>
//     </SimpleThemeProvider>
//   );
// };

// export default App;

import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context Providers
import { Web3Provider } from './context/Web3Context';
import { DocumentStatsProvider } from './context/DocumentStatsContext';

// Components
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import UploadPage from './components/document/DocumentUpload';
import VerificationPortal from './components/verification/VerificationPortal';
import ThirdPartyVerification from './components/verification/ThirdPartyVerification';
import DocumentIssuanceWorkflow from './components/issuance/DocumentIssuanceWorkflow';
import QRCodeScanner from './components/qr/QRCodeScanner';
import UserTypeSelection from './components/common/UserTypeSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Types and Interfaces
type Theme = 'light' | 'dark';

interface AppState {
  hasError: boolean;
}

// Simple Theme Context (without external dependencies)
const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'dark',
  setTheme: () => {},
});

// Simple Error Boundary Hook
const useErrorHandler = () => {
  const [hasError, setHasError] = useState(false);
  
  const handleError = useCallback((error: Error) => {
    console.error('App Error:', error);
    setHasError(true);
  }, []);
  
  return { hasError, handleError, clearError: () => setHasError(false) };
};

// 404 Not Found Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl font-bold text-muted-foreground">404</div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            Go Back
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

// Simple Theme Provider
const SimpleThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>({
    hasError: false
  });

  const { hasError, handleError } = useErrorHandler();

  // Initialize app without loading delay
  useEffect(() => {
    try {
      console.log('🚀 DocVerify System initialized');
      
      setAppState({
        hasError: false
      });
    } catch (error) {
      console.error('❌ App initialization error:', error);
      handleError(error as Error);
      setAppState({
        hasError: true
      });
    }
  }, [handleError]);

  // Show error state
  if (appState.hasError || hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl text-destructive">⚠️</div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              Please refresh the page and try again.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimpleThemeProvider>
      <Web3Provider>
        <DocumentStatsProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
              {/* Navigation */}
              <Navbar />

              {/* Main Content */}
              <main className="pt-20 min-h-screen">
              <Routes>
  <Route path="/" element={<UserTypeSelection />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/upload" element={
    <ProtectedRoute>
      <UploadPage />
    </ProtectedRoute>
  } />
  <Route path="/verify" element={<VerificationPortal />} />
  <Route path="/third-party-verify" element={<ThirdPartyVerification />} />
  <Route path="/issue-document" element={
    <ProtectedRoute>
      <DocumentIssuanceWorkflow />
    </ProtectedRoute>
  } />
  <Route path="/qr-scanner" element={<QRCodeScanner />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
              </main>

              {/* Toast Notifications */}
              <Toaster
                position="bottom-right"
                expand={false}
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                }}
              />
            </div>
          </Router>
        </DocumentStatsProvider>
      </Web3Provider>
    </SimpleThemeProvider>
  );
};

export default App;
