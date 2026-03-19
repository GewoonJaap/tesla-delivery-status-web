import React from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import AppStoreBadge from './AppStoreBadge';

const LegalFooter: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex justify-center items-center space-x-4">
          <Link 
            to="/privacy" 
            className="text-xs text-gray-400 dark:text-tesla-gray-500 hover:text-gray-600 dark:hover:text-tesla-gray-300 transition-colors underline underline-offset-2"
            onClick={() => trackEvent('click_privacy_policy')}
          >
            Privacy Policy
          </Link>
        </div>
        
        <div className="flex flex-col items-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-tesla-gray-500 font-semibold">
            Available on iOS
          </p>
          <AppStoreBadge width={135} height={45} />
        </div>
      </div>
    </div>
  );
};

export default LegalFooter;
