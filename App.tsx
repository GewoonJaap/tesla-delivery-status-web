
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TeslaTokens } from './types';
import { exchangeCodeForTokens, refreshAccessToken, TokenExpiredError } from './services/tesla';
import { isTokenValid, safeLocalStorageSetItem } from './utils/helpers';
import { trackEvent } from './utils/analytics';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Spinner from './components/Spinner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import * as Sentry from "@sentry/react";

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [tokens, setTokens] = useState<TeslaTokens | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    trackEvent('toggle_theme', { theme: newTheme });
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = useCallback(() => {
    // Only clear session-specific data. Order history and checklist progress
    // will be preserved in localStorage for a better user experience across sessions.
    trackEvent('logout');
    localStorage.removeItem('tesla-tokens');
    sessionStorage.removeItem('tesla-auth-state');
    sessionStorage.removeItem('tesla-code-verifier');
    setTokens(null);
  }, []);

  const handleRefreshAndRetry = useCallback(async <T,>(apiRequest: (accessToken: string) => Promise<T>): Promise<T | null> => {
    if (!tokens) {
      handleLogout();
      return null;
    }

    try {
      // First attempt with the current token
      return await apiRequest(tokens.access_token);
    } catch (error: any) {
      // If the token is expired, try to refresh it
      if (error instanceof TokenExpiredError) {
        console.log("Access token expired, attempting to refresh...");
        try {
          const newTokens = await refreshAccessToken(tokens.refresh_token);
          safeLocalStorageSetItem('tesla-tokens', JSON.stringify(newTokens));
          setTokens(newTokens);
          console.log("Token refresh successful, retrying API request...");
          trackEvent('token_refresh_success');
          // Retry the request with the new token
          return await apiRequest(newTokens.access_token);
        } catch (refreshError: any) {
          console.error("Failed to refresh token:", refreshError);
          Sentry.captureException(refreshError);
          setAuthError('Your session has expired. Please log in again.');
          trackEvent('token_refresh_failure');
          handleLogout();
          return null; // Stop execution, logout is happening
        }
      }
      // Re-throw other types of errors that are not related to token expiry
      Sentry.captureException(error);
      throw error;
    }
  }, [tokens, setTokens, handleLogout, setAuthError]);


  const handleUrlSubmit = async (url: string) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const urlParams = new URL(url).searchParams;
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('tesla-auth-state');

      if (!code || !state) {
        throw new Error('The pasted URL does not contain the required authentication code.');
      }
      
      if (state !== storedState) {
        throw new Error('Authentication state mismatch. Please try logging in again.');
      }

      const codeVerifier = sessionStorage.getItem('tesla-code-verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found. Please try logging in again.');
      }

      const newTokens = await exchangeCodeForTokens(code, codeVerifier);
      safeLocalStorageSetItem('tesla-tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
      trackEvent('login_success');
      
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.warn("Could not clean up URL, continuing operation.", e);
        Sentry.captureException(e);
      }
      
    } catch (error: any) {
        console.error('Error handling submitted URL:', error);
        Sentry.captureException(error);
        const errorMessage = error.message || 'An unknown error occurred during authentication.';
        setAuthError(`Authentication failed: ${errorMessage}`);
        trackEvent('login_failure', { error: errorMessage });
        // Do not auto-logout, let user see the error and try again
    } finally {
        setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const checkExistingSession = async () => {
      setLoading(true);
      const storedTokensJson = localStorage.getItem('tesla-tokens');
      if (storedTokensJson) {
        try {
          const storedTokens: TeslaTokens = JSON.parse(storedTokensJson);
          if (isTokenValid(storedTokens.access_token)) {
            setTokens(storedTokens);
            trackEvent('session_restore_success');
          } else {
            const newTokens = await refreshAccessToken(storedTokens.refresh_token);
            safeLocalStorageSetItem('tesla-tokens', JSON.stringify(newTokens));
            setTokens(newTokens);
            trackEvent('session_restore_refresh_success');
          }
        } catch (error) {
          console.error('Failed to validate or refresh token on initial load:', error);
          Sentry.captureException(error);
          setAuthError('Your session has expired. Please log in again.');
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkExistingSession();
  }, [handleLogout]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner />
        <p className="mt-4 text-lg text-gray-600 dark:text-tesla-gray-300">Loading Session...</p>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            tokens ? (
              <Dashboard 
                tokens={tokens} 
                onLogout={handleLogout}
                handleRefreshAndRetry={handleRefreshAndRetry}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ) : (
              <LoginScreen 
                error={authError} 
                onUrlSubmit={handleUrlSubmit}
                isSubmitting={isSubmitting} 
              />
            )
          } 
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
