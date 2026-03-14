import React from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

const LegalFooter: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`text-center space-y-2 ${className}`}>
      <div className="flex justify-center items-center space-x-4">
        <Link 
          to="/privacy" 
          className="text-xs text-gray-400 dark:text-tesla-gray-500 hover:text-gray-600 dark:hover:text-tesla-gray-300 transition-colors underline underline-offset-2"
          onClick={() => trackEvent('click_privacy_policy')}
        >
          Privacy Policy
        </Link>
        <a 
          href="https://apps.apple.com/us/app/delivery-status-for-tesla/id6759204893"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 dark:text-tesla-gray-500 hover:text-gray-600 dark:hover:text-tesla-gray-300 transition-colors underline underline-offset-2"
          onClick={() => trackEvent('click_app_store')}
        >
          App Store
        </a>
      </div>
    </div>
  );
};

export default LegalFooter;
