import React from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

const LegalFooter: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`text-center ${className}`}>
      <Link 
        to="/privacy" 
        className="text-xs text-gray-400 dark:text-tesla-gray-500 hover:text-gray-600 dark:hover:text-tesla-gray-300 transition-colors underline underline-offset-2"
        onClick={() => trackEvent('click_privacy_policy')}
      >
        Privacy Policy
      </Link>
    </div>
  );
};

export default LegalFooter;
