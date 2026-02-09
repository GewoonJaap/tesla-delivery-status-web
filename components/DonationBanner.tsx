
import React, { useState, useEffect } from 'react';
import { CoffeeIcon, XIcon } from './icons';

interface DonationBannerProps {
  hasSignificantChanges: boolean;
  forceOpen?: boolean;
}

const DONATION_URL = "https://buymeacoffee.com/mrproper";

const DonationBanner: React.FC<DonationBannerProps> = ({ hasSignificantChanges, forceOpen = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // If forced open by debug panel, override all logic
    if (forceOpen) {
        setIsVisible(true);
        setIsDismissed(false);
        return;
    }

    // Check if previously dismissed forever
    const dismissed = localStorage.getItem('tesla-donation-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Logic: Visit Counting
    let visitCount = 0;
    try {
      const storedCount = localStorage.getItem('tesla-dashboard-visit-count');
      visitCount = storedCount ? parseInt(storedCount, 10) : 0;
      
      // Increment visit count (session storage check ensures we only count new sessions, not refreshes)
      if (!sessionStorage.getItem('tesla-session-counted')) {
        visitCount += 1;
        localStorage.setItem('tesla-dashboard-visit-count', visitCount.toString());
        sessionStorage.setItem('tesla-session-counted', 'true');
      }
    } catch (e) {
      console.warn("LocalStorage access failed", e);
    }

    // Show if:
    // 1. Significant changes occurred (Celebration mode)
    // 2. OR Visit count > 5 (Loyal user mode)
    if (hasSignificantChanges || visitCount > 5) {
      // Small delay to not startle the user immediately on load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSignificantChanges, forceOpen]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      // Only persist dismissal if we are NOT in forced debug mode
      if (!forceOpen) {
        localStorage.setItem('tesla-donation-banner-dismissed', 'true');
      }
    }, 300); // Wait for animation
  };

  const handleOpen = () => {
    window.open(DONATION_URL, '_blank', 'noopener,noreferrer');
    handleDismiss(); // Dismiss after clicking
  };

  if (isDismissed && !forceOpen) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 transition-transform duration-500 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white dark:bg-tesla-gray-800 border border-gray-200 dark:border-tesla-gray-700 shadow-2xl rounded-xl p-4 max-w-md w-full flex items-center justify-between gap-4 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full flex-shrink-0">
             <CoffeeIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {hasSignificantChanges ? "Exciting updates!" : "Enjoying the app?"}
            </p>
            <p className="text-xs text-gray-500 dark:text-tesla-gray-400 leading-tight mt-0.5">
              {hasSignificantChanges 
                ? "If this tracker helped, consider buying me a coffee to celebrate! ☕" 
                : "Support development with a coffee! It keeps the updates coming."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={handleOpen}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm active:scale-95"
            >
                Donate
            </button>
            <button 
                onClick={handleDismiss}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-tesla-gray-500 dark:hover:text-tesla-gray-300 hover:bg-gray-100 dark:hover:bg-tesla-gray-700 rounded-full transition-colors"
                aria-label="Dismiss donation banner"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default DonationBanner;
