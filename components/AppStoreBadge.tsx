import React from 'react';
import { trackEvent } from '../utils/analytics';
import { APP_STORE_URL } from '../constants';

interface AppStoreBadgeProps {
  className?: string;
  width?: number;
  height?: number;
}

const AppStoreBadge: React.FC<AppStoreBadgeProps> = ({ 
  className = "",
  width = 120,
  height = 40
}) => {
  const blackBadge = "https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1773792000";
  const whiteBadge = "https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/white/en-us?releaseDate=1773792000";

  const imgStyle = { 
    width: `${width}px`, 
    height: `${height}px`, 
    verticalAlign: 'middle', 
    objectFit: 'contain' as const 
  };

  return (
    <a 
      href={APP_STORE_URL} 
      style={{ display: 'inline-block' }}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('click_app_store_badge')}
    >
      {/* Black badge for light mode */}
      <img 
        src={blackBadge} 
        alt="Download on the App Store" 
        style={imgStyle}
        className="dark:hidden"
        referrerPolicy="no-referrer"
      />
      {/* White badge for dark mode */}
      <img 
        src={whiteBadge} 
        alt="Download on the App Store" 
        style={imgStyle}
        className="hidden dark:block"
        referrerPolicy="no-referrer"
      />
    </a>
  );
};

export default AppStoreBadge;
