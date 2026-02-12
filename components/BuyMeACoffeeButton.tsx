
import React, { useState, useEffect } from 'react';
import { CoffeeIcon } from './icons';
import Tooltip from './Tooltip';
import { trackEvent } from '../utils/analytics';

const BuyMeACoffeeButton: React.FC = () => {
  const [shouldJiggle, setShouldJiggle] = useState(false);

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const hasClicked = localStorage.getItem('hasClickedBuyMeACoffee') === 'true';
      if (hasClicked) {
        return; // Don't jiggle if they've already clicked
      }

      const hasVisited = localStorage.getItem('hasVisitedDashboard') === 'true';
      if (hasVisited) {
        // Subsequent visit, apply random chance
        if (Math.random() < 0.3) {
          setShouldJiggle(true);
        }
      } else {
        // First visit, set the flag but don't jiggle
        localStorage.setItem('hasVisitedDashboard', 'true');
      }
    } catch (e) {
      console.error("Could not access localStorage for jiggle animation logic", e);
    }
  }, []); // Run only on mount

  const handleCoffeeClick = () => {
    try {
      trackEvent('donate_click', { location: 'header' });
      localStorage.setItem('hasClickedBuyMeACoffee', 'true');
      setShouldJiggle(false); // Stop any jiggling
    } catch (e) {
      console.error("Could not write to localStorage", e);
    }
  };

  // Adjusted classes: padding is smaller on mobile (p-2) to make it a circle with the icon, 
  // and expands on sm screens (px-3 py-2) to fit text.
  const coffeeLinkClasses = `flex items-center justify-center p-2 sm:px-4 sm:py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-yellow-400/20 dark:bg-yellow-500/20 hover:bg-yellow-400/40 dark:hover:bg-yellow-500/30 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-tesla-gray-900 active:scale-95 ${shouldJiggle ? 'animate-jiggle' : ''}`;

  return (
    <Tooltip text="Support development">
      <a
        href="https://buymeacoffee.com/mrproper"
        target="_blank"
        rel="noopener noreferrer"
        className={coffeeLinkClasses}
        onClick={handleCoffeeClick}
        aria-label="Support the developer by buying them a coffee"
      >
        <CoffeeIcon className="w-5 h-5 sm:mr-2" />
        <span className="hidden sm:inline">Buy me a coffee</span>
      </a>
    </Tooltip>
  );
};

export default BuyMeACoffeeButton;
