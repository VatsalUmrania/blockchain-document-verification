import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context Providers
import { Web3Provider } from './context/Web3Context';
import { DocumentStatsProvider } from './context/DocumentStatsContext';
import { AuthProvider } from './context/AuthContext'; 

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

import { AdminRoute } from './components/auth/AdminRoute';
import { AdminPage } from './components/admin/AdminPage'; // Assuming this path is correct

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
  theme: 'light', // Set default to light
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
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors "
          >
            Go Back
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-secondary text-accent-foreground rounded-md"
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
  const [theme, setTheme] = useState<Theme>('light'); // Set default to light

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // [MODIFIED] Default to light unless saved theme or system pref says otherwise
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
        <AuthProvider>
          <DocumentStatsProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
                {/* Navigation */}
                <Navbar />

                {/* Main Content */}
                <main className="">
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
                  
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
                    } 
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                </main>

                {/* Toast Notifications */}
                <Toaster
                  position="top-center"
                  expand={false}
                  richColors
                  toastOptions={{
                    duration: 2000,
                  }}
                />
              </div>
            </Router>
          </DocumentStatsProvider>
        </AuthProvider>
      </Web3Provider>
    </SimpleThemeProvider>
  );
};

export default App;