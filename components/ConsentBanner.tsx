
import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, XIcon } from './icons';
import { getUserPreferences, setUserPreferences } from '../services/teslaStatus';
import { motion, AnimatePresence } from 'motion/react';

const ConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefs = getUserPreferences();
    if (prefs.dataCollectionOptIn === null) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOptIn = () => {
    setUserPreferences({ dataCollectionOptIn: true });
    setIsVisible(false);
  };

  const handleOptOut = () => {
    setUserPreferences({ dataCollectionOptIn: false });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:right-6 sm:max-w-md"
        >
          <div className="bg-white dark:bg-tesla-gray-800 border border-gray-200 dark:border-tesla-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Help improve estimations?</h3>
                    <button 
                      onClick={() => setIsVisible(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-tesla-gray-400 leading-relaxed">
                    We collect anonymized order data (no personal info) to provide better delivery predictions for everyone. Would you like to contribute?
                  </p>
                </div>
              </div>
              
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  onClick={handleOptOut}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-tesla-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  No thanks
                </button>
                <button
                  onClick={handleOptIn}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Yes, I'll help
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentBanner;
