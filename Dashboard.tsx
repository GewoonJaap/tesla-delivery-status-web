import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Sentry from "@sentry/react";
import { TeslaTokens, CombinedOrder, OrderDiff, HistoricalSnapshot } from '../types';
import { getAllOrderData } from '../services/tesla';
import { compareObjects, safeLocalStorageSetItem } from '../utils/helpers';
import { MAX_HISTORY_ENTRIES } from '../constants';
import OrderCard from './OrderCard';
import Spinner from './Spinner';
import Toast from './Toast';
import { TeslaLogo, LogoutIcon, RefreshIcon, SunIcon, MoonIcon, GithubIcon, ResetIcon } from './icons';
import { GITHUB_REPO_URL } from '../constants';
import BuyMeACoffeeButton from './BuyMeACoffeeButton';
import AdminPanel from './AdminPanel';
import Tooltip from './Tooltip';

interface DashboardProps {
  tokens: TeslaTokens;
  onLogout: () => void;
  handleRefreshAndRetry: <T>(apiRequest: (accessToken: string) => Promise<T>) => Promise<T | null>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tokens, onLogout, handleRefreshAndRetry, theme, toggleTheme }) => {
  const [orders, setOrders] = useState<CombinedOrder[]>([]);
  const [diffs, setDiffs] = useState<Record<string, OrderDiff>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [rainbowMode, setRainbowMode] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [mockOrder, setMockOrder] = useState<CombinedOrder | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  const handleLogoClick = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const newClickCount = logoClicks + 1;
    setLogoClicks(newClickCount);

    if (newClickCount >= 13) {
      setIsAdminPanelOpen(true);
      setLogoClicks(0);
    } else if (newClickCount >= 7) {
      setRainbowMode(prev => !prev);
    }
    
    clickTimeoutRef.current = window.setTimeout(() => {
        setLogoClicks(0);
    }, 1500);
  }, [logoClicks]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const fetchAndCompareOrders = useCallback(async (isManualRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    if (isManualRefresh) {
      setToast(null);
    }
    try {
      const newOrders = await handleRefreshAndRetry((accessToken) => getAllOrderData(accessToken));

      if (!newOrders) {
        setLoading(false);
        return;
      }
      
      const latestDiffs: Record<string, OrderDiff> = {};

      for (const newCombinedOrder of newOrders) {
        const rn = newCombinedOrder.order.referenceNumber;
        const historyKey = `tesla-order-history-${rn}`;
        
        let history: HistoricalSnapshot[] = [];
        try {
            const storedHistoryJson = localStorage.getItem(historyKey);
            if(storedHistoryJson) {
                history = JSON.parse(storedHistoryJson);
            }
        } catch (e) {
            console.error("Failed to parse history from localStorage for", rn, e);
            history = [];
        }

        const lastSnapshotData = history.length > 0 ? history[history.length - 1].data : null;

        if (lastSnapshotData) {
          const diff = compareObjects(lastSnapshotData, newCombinedOrder);
          if (Object.keys(diff).length > 0) {
            history.push({ timestamp: Date.now(), data: newCombinedOrder });
            
            // Prune history to keep storage usage under control
            if (history.length > MAX_HISTORY_ENTRIES) {
              history = history.slice(-MAX_HISTORY_ENTRIES);
            }
            
            const success = safeLocalStorageSetItem(historyKey, JSON.stringify(history));
            if (!success) {
              setToast({ message: 'Warning: Browser storage is full. History may not be saved.', type: 'info' });
            }
            latestDiffs[rn] = diff;
          }
        } else {
          const initialHistory = [{ timestamp: Date.now(), data: newCombinedOrder }];
          safeLocalStorageSetItem(historyKey, JSON.stringify(initialHistory));
        }
      }

      setOrders(newOrders);
      setDiffs(latestDiffs);
      
      if (Object.keys(latestDiffs).length > 0) {
        setToast({ message: 'New changes detected!', type: 'success' });
      } else if (isManualRefresh) {
        setToast({ message: 'No new changes found.', type: 'info' });
      }

    } catch (err) {
      console.error('Failed to fetch orders:', err);
      Sentry.captureException(err);
      setError('Could not retrieve order information. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [handleRefreshAndRetry]);

  useEffect(() => {
    fetchAndCompareOrders(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyMockJson = (json: CombinedOrder) => {
    setMockOrder(json);
    setToast({ message: 'Developer mode: Mock data loaded!', type: 'info' });
  };

  const handleResetToLive = () => {
    setMockOrder(null);
    setToast({ message: 'Switched back to live data. Refreshing...', type: 'info' });
    fetchAndCompareOrders(true);
  };


  const renderContent = () => {
    if (mockOrder) {
      return (
        <>
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-500/40 text-yellow-800 dark:text-yellow-100 rounded-lg text-center font-semibold animate-fade-in-up">
            Developer Mode: Displaying mock data.
          </div>
          <div className="flex justify-center animate-fade-in-up">
            <div className="w-full max-w-4xl">
              <OrderCard
                key={mockOrder.order.referenceNumber}
                combinedOrder={mockOrder}
                diff={{}}
                hasNewChanges={false}
              />
            </div>
          </div>
        </>
      );
    }
    
    if (loading && orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center mt-20">
          <Spinner />
          <p className="mt-4 text-lg text-gray-600 dark:text-tesla-gray-300">Fetching your order data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center mt-10">
            <div className="text-center bg-red-100 dark:bg-tesla-red/10 border border-red-200 dark:border-tesla-red text-red-700 dark:text-tesla-red px-6 py-4 rounded-lg max-w-md">
                <p className="font-bold text-lg">An Error Occurred</p>
                <p className="mt-1">{error}</p>
            </div>
        </div>
      );
    }

    if (orders.length > 0) {
      if (orders.length === 1) {
        const singleOrder = orders[0];
        const hasNewChanges = Object.keys(diffs[singleOrder.order.referenceNumber] || {}).length > 0;
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <OrderCard
                key={singleOrder.order.referenceNumber}
                combinedOrder={singleOrder}
                diff={diffs[singleOrder.order.referenceNumber] || {}}
                hasNewChanges={hasNewChanges}
              />
            </div>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {orders.map((combinedOrder) => {
            const hasNewChanges = Object.keys(diffs[combinedOrder.order.referenceNumber] || {}).length > 0;
            return (
              <OrderCard
                key={combinedOrder.order.referenceNumber}
                combinedOrder={combinedOrder}
                diff={diffs[combinedOrder.order.referenceNumber] || {}}
                hasNewChanges={hasNewChanges}
              />
            );
          })}
        </div>
      );
    }

    return (
        <div className="flex justify-center mt-10">
            <div className="text-center bg-white dark:bg-tesla-gray-800/50 border border-gray-200 dark:border-tesla-gray-700 p-10 rounded-2xl shadow-sm max-w-md">
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">No Orders Found</h2>
                <p className="text-gray-500 dark:text-tesla-gray-400">We couldn't find any orders associated with your account.</p>
            </div>
        </div>
    );
  };

  const iconButtonClasses = "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-tesla-gray-900 active:scale-90 active:bg-gray-300 dark:active:bg-tesla-gray-600";
  
  return (
    <div className="min-h-screen w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
      {toast && <Toast key={Date.now()} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-tesla-gray-700/50">
        <div className="flex items-center space-x-4">
            <div 
              onClick={handleLogoClick}
              className="cursor-pointer p-1 -m-1 rounded-full select-none"
              role="button"
              aria-label="Tesla Logo Easter Egg"
            >
              <TeslaLogo className={`w-8 h-8 transition-colors duration-300 ${rainbowMode ? 'animate-rainbow' : 'text-tesla-red'}`} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Delivery Status</h1>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <BuyMeACoffeeButton />
           <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={iconButtonClasses}
            aria-label="View source on GitHub"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
           <button
            onClick={toggleTheme}
            className={iconButtonClasses}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
          
          {mockOrder ? (
            <Tooltip text="Reset to live data from Tesla API">
              <button
                onClick={handleResetToLive}
                className={iconButtonClasses}
                aria-label="Reset to Live Data"
              >
                <ResetIcon className="w-6 h-6 text-yellow-500" />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => fetchAndCompareOrders(true)}
              disabled={loading}
              className={`${iconButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-transparent dark:disabled:bg-transparent`}
              aria-label="Refresh Orders"
            >
              <RefreshIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={onLogout}
            className={iconButtonClasses}
            aria-label="Logout"
          >
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main>
        {renderContent()}
      </main>

      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onApply={handleApplyMockJson}
      />
    </div>
  );
};

export default Dashboard;