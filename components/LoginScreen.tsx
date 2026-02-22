
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { handleTeslaLogin } from '../services/tesla';
import { trackEvent } from '../utils/analytics';
import { TeslaLogo, GithubIcon } from './icons';
import { GITHUB_REPO_URL } from '../constants';
import * as Sentry from "@sentry/react";

interface LoginScreenProps {
  error?: string | null;
  onUrlSubmit: (url: string) => Promise<void>;
  isSubmitting: boolean;
}

const GithubLink: React.FC = () => (
    <div className="mt-8 text-center">
        <a 
            href={GITHUB_REPO_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-500 dark:text-tesla-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            aria-label="View source on GitHub"
            onClick={() => trackEvent('click_github_link', { location: 'login_screen' })}
        >
            <GithubIcon className="w-4 h-4" />
            <span className="text-sm">View on GitHub</span>
        </a>
    </div>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ error, onUrlSubmit, isSubmitting }) => {
  const [loginStep, setLoginStep] = useState<'initial' | 'paste_url'>('initial');
  const [pastedUrl, setPastedUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loginUrlForFallback, setLoginUrlForFallback] = useState<string | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [rainbowMode, setRainbowMode] = useState(false);
  const clickTimeoutRef = useRef<number | null>(null);

  const handleLogoClick = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const newClickCount = logoClicks + 1;
    setLogoClicks(newClickCount);

    if (newClickCount >= 7) {
      setRainbowMode(prev => !prev);
      trackEvent('easter_egg_rainbow_login', { enabled: true });
      setLogoClicks(0);
    } else {
      clickTimeoutRef.current = window.setTimeout(() => {
        setLogoClicks(0);
      }, 1500); // Reset if not clicked again within 1.5 seconds
    }
  }, [logoClicks]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const onLoginClick = async () => {
    setLocalError(null);
    trackEvent('login_start');
    const authUrl = await handleTeslaLogin();
    setLoginUrlForFallback(authUrl);
    setLoginStep('paste_url');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!pastedUrl.trim()) {
      setLocalError('Please paste the URL from the Tesla login page.');
      return;
    }
    try {
      const url = new URL(pastedUrl);
      if (!url.searchParams.has('code')) {
        setLocalError('The pasted URL does not contain a valid authentication code.');
        trackEvent('login_error', { reason: 'invalid_url_no_code' });
        return;
      }
    } catch (e) {
      setLocalError('The pasted text is not a valid URL.');
      trackEvent('login_error', { reason: 'invalid_url_format' });
      Sentry.captureException(e);
      return;
    }
    trackEvent('login_submit_url');
    await onUrlSubmit(pastedUrl);
  };
  
  const commonButtonClasses = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 active:scale-95 active:brightness-90 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:dark:bg-tesla-gray-600 disabled:dark:hover:bg-tesla-gray-600 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none";

  if (loginStep === 'paste_url') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-lg w-full bg-white/60 dark:bg-tesla-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-tesla-gray-700 p-8 rounded-2xl shadow-xl">
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer p-1 -m-1 rounded-full select-none inline-block mb-6"
            role="button"
            aria-label="Tesla Logo Easter Egg"
          >
            <TeslaLogo className={`w-24 h-24 mx-auto text-gray-900 dark:text-white transition-colors duration-300 ${rainbowMode ? 'animate-rainbow' : ''}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Complete Sign-In</h2>
          <p className="text-gray-600 dark:text-tesla-gray-300 mb-6">
            A new tab was opened for you to sign in. After logging in, you'll see a blank page. <strong>Copy the full URL</strong> from that page's address bar and paste it below.
          </p>
          
          {loginUrlForFallback && (
              <div className="text-sm bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-500/40 text-yellow-800 dark:text-yellow-100 rounded-lg p-3 mb-6 text-left space-y-2">
                <p className="font-bold">Login window didn't open?</p>
                <p>Your browser might have blocked it. You can manually copy the link below to sign in.</p>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={loginUrlForFallback} 
                    className="w-full bg-yellow-200/50 dark:bg-tesla-gray-900/50 p-2 rounded text-xs truncate border border-yellow-400/50" 
                    onClick={e => (e.target as HTMLInputElement).select()}
                    aria-label="Manual login URL"
                  />
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(loginUrlForFallback);
                        trackEvent('login_copy_manual_url');
                    }} 
                    className="ml-2 px-3 py-1 text-xs bg-yellow-400/50 hover:bg-yellow-400/80 text-yellow-900 dark:text-yellow-100 rounded-md font-semibold transition-all duration-150 active:scale-95"
                    aria-label="Copy login URL"
                  >
                    Copy
                  </button>
                </div>
              </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="relative">
              <input
                id="url-input"
                type="text"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="https://auth.tesla.com/void/callback?code=..."
                className="w-full bg-gray-50 dark:bg-tesla-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-tesla-gray-600 rounded-lg py-3 px-4 mb-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                aria-label="Pasted URL from Tesla"
                required
                disabled={isSubmitting}
              />
            </div>
            
            {(error || localError) && (
              <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-tesla-red text-red-800 dark:text-white text-sm rounded-lg p-3 mb-4 text-left" role="alert">
                <p className="font-bold">Authentication Error</p>
                <p>{error || localError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !pastedUrl}
              className={commonButtonClasses}
            >
              {isSubmitting ? 'Verifying...' : 'Submit & Check Status'}
            </button>
          </form>
           <p className="text-xs text-gray-500 dark:text-tesla-gray-500 mt-6">
            This manual copy-paste step is required by Tesla's authentication flow for third-party apps.
          </p>
          <GithubLink />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md w-full bg-white/60 dark:bg-tesla-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-tesla-gray-700 p-8 rounded-2xl shadow-xl">
        <div 
          onClick={handleLogoClick}
          className="mx-auto mb-6 cursor-pointer p-1 -m-1 rounded-full select-none inline-block"
          role="button"
          aria-label="Tesla Logo Easter Egg"
        >
          <TeslaLogo className={`w-24 h-24 mx-auto text-gray-900 dark:text-white transition-colors duration-300 ${rainbowMode ? 'animate-rainbow' : ''}`}/>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Delivery Status
        </h1>
        <p className="text-gray-600 dark:text-tesla-gray-300 mb-6">
          Log in with your Tesla account to track your vehicle order.
        </p>

        <div className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-200 rounded-lg p-3 mb-6 text-left">
            <p className="font-semibold">Important Login Steps:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Clicking "Sign In" opens Tesla's official site in a <strong>new tab</strong>.</li>
                <li>After logging in, you'll see a blank page. <strong>Copy that page's URL</strong> and paste it on the next screen here.</li>
            </ol>
        </div>

        {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-tesla-red text-red-800 dark:text-white text-sm rounded-lg p-3 mb-6" role="alert">
                {error}
            </div>
        )}

        <button
          onClick={onLoginClick}
          className={commonButtonClasses}
        >
          Sign In with Tesla
        </button>
        <div className="text-xs text-gray-500 dark:text-tesla-gray-500 mt-6 space-y-2">
            <p>
                This is a third-party application and is not affiliated with Tesla, Inc. Your credentials are handled securely by Tesla's official login page.
            </p>
            <p>
                To function, this app stores authentication tokens in your browser. Your password is never seen by this app. For full transparency, the project is open-source.
            </p>
        </div>
        <GithubLink />
      </div>
    </main>
  );
};

export default LoginScreen;
