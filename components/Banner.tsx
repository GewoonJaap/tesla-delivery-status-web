import React, { useState, useEffect, useRef } from 'react';
import { BannerConfig } from '../types';
import { BANNERS } from '../data/banners';
import { XIcon } from './icons';
import { trackEvent } from '../utils/analytics';

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

const checkCondition = (condition?: BannerConfig['condition']) => {
  if (!condition) return true;

  if (condition.platform) {
    if (condition.platform === 'ios' && !isIOS()) return false;
    if (condition.platform === 'android' && !isAndroid()) return false;
  }

  const now = new Date();
  if (condition.startDate && new Date(condition.startDate) > now) return false;
  if (condition.endDate && new Date(condition.endDate) < now) return false;

  return true;
};

const Banner: React.FC = () => {
  const [activeBanners, setActiveBanners] = useState<BannerConfig[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<string[]>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('dismissedBanners');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const viewedBannersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const validBanners = BANNERS.filter(banner => {
      if (dismissedBanners.includes(banner.id)) return false;
      return checkCondition(banner.condition);
    });
    setActiveBanners(validBanners);

    validBanners.forEach(banner => {
      if (!viewedBannersRef.current.has(banner.id)) {
        trackEvent('banner_impression', { banner_id: banner.id });
        viewedBannersRef.current.add(banner.id);
      }
    });
  }, [dismissedBanners]);

  const handleDismiss = (id: string) => {
    trackEvent('banner_dismissed', { banner_id: id });
    const newDismissed = [...dismissedBanners, id];
    setDismissedBanners(newDismissed);
    localStorage.setItem('dismissedBanners', JSON.stringify(newDismissed));
  };

  const handleBannerClick = (id: string, link?: string) => {
    trackEvent('banner_clicked', { banner_id: id, link: link || '' });
  };

  if (activeBanners.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4 w-full max-w-4xl mx-auto">
      {activeBanners.map(banner => (
        <div
          key={banner.id}
          className={`
            relative flex items-center justify-between p-4 rounded-lg shadow-sm border
            ${banner.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200' : ''}
            ${banner.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200' : ''}
            ${banner.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' : ''}
            ${(!banner.type || banner.type === 'info') ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200' : ''}
          `}
        >
          <div className="flex-1 mr-8">
            <span className="font-medium">{banner.message}</span>
            {banner.link && (
              <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline hover:no-underline font-bold"
                onClick={() => handleBannerClick(banner.id, banner.link)}
              >
                {banner.linkText || 'Learn more'}
              </a>
            )}
          </div>
          <button
            onClick={() => handleDismiss(banner.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Banner;
