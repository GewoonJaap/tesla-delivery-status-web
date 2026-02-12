
import React, { useState, useEffect, useMemo } from 'react';
import { CoffeeIcon } from './icons';
import { trackEvent } from '../utils/analytics';

interface CountdownTimerProps {
  targetDateString: string;
}

const TimeBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-tesla-gray-700/50 rounded-lg p-3 w-20 h-20 shadow-inner">
    <span className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs font-medium text-gray-500 dark:text-tesla-gray-400 uppercase tracking-wider mt-1">
      {label}
    </span>
  </div>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDateString }) => {
  const targetDate = useMemo(() => {
    if (!targetDateString) return null;
    
    // Extracts the first line from multi-line strings and prepares it for parsing.
    // E.g., "September 15, 2025 at 02:00 PM\n\n..." becomes "September 15, 2025 02:00 PM"
    const datePart = targetDateString.split('\n')[0].replace(' at ', ' ');
    const date = new Date(datePart);
    
    // Return null if the parsed date is invalid to prevent rendering errors.
    return isNaN(date.getTime()) ? null : date;
  }, [targetDateString]);

  const calculateTimeLeft = () => {
    if (!targetDate) return null;

    const difference = +targetDate - +new Date();
    let timeLeft: { days: number; hours: number; minutes: number; seconds: number } | null = null;

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const buttonClasses = "group flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700/50 rounded-full transition-all duration-200 shadow-sm hover:shadow text-center";

  if (!timeLeft) {
     if (targetDate && +targetDate <= +new Date()) {
        return (
             <div className="p-5 border-b border-gray-200 dark:border-tesla-gray-700/50 animate-fade-in-up">
                <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-500/30">
                    <h3 className="font-bold text-2xl text-green-800 dark:text-green-200 animate-jiggle">
                        🎉 It's Delivery Day! 🎉
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Congratulations! The wait is over.
                    </p>
                </div>
                
                <div className="mt-6 flex justify-center">
                    <a 
                      href="https://buymeacoffee.com/mrproper" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={buttonClasses}
                      onClick={() => trackEvent('donate_click', { location: 'countdown_timer_success' })}
                    >
                      <CoffeeIcon className="w-4 h-4 mr-2.5 flex-shrink-0 text-yellow-600 dark:text-yellow-500 group-hover:scale-110 transition-transform" />
                      <span>Enjoyed this site? Consider supporting its development and server costs.</span>
                    </a>
                </div>
            </div>
        );
     }
    return null;
  }

  return (
    <div className="p-5 border-b border-gray-200 dark:border-tesla-gray-700/50 animate-fade-in-up">
        <h3 className="text-base font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">Delivery Countdown</h3>
        <div className="flex justify-center items-center space-x-2 sm:space-x-4">
            <TimeBlock value={timeLeft.days} label="Days" />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
        
        <div className="mt-6 flex justify-center">
            <a 
              href="https://buymeacoffee.com/mrproper" 
              target="_blank" 
              rel="noopener noreferrer"
              className={buttonClasses}
              onClick={() => trackEvent('donate_click', { location: 'countdown_timer' })}
            >
              <CoffeeIcon className="w-4 h-4 mr-2.5 flex-shrink-0 text-yellow-600 dark:text-yellow-500 group-hover:scale-110 transition-transform" />
              <span>Enjoying this site? Consider supporting its development and server costs.</span>
            </a>
        </div>
    </div>
  );
};

export default CountdownTimer;
