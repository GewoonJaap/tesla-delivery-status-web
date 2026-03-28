import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 400); // Match animation duration
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto-close after 4 seconds

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const config = {
    success: {
      Icon: CheckCircle2,
      iconClasses: 'text-green-500',
      bgClasses: 'bg-white dark:bg-tesla-gray-800 border-green-400 dark:border-green-600',
      textClasses: 'text-gray-800 dark:text-white',
    },
    info: {
      Icon: Info,
      iconClasses: 'text-blue-500',
      bgClasses: 'bg-white dark:bg-tesla-gray-800 border-blue-400 dark:border-blue-500',
      textClasses: 'text-gray-800 dark:text-white',
    },
  };

  const { Icon, iconClasses, bgClasses, textClasses } = config[type];

  const animationClass = isExiting ? 'animate-fade-out-right' : 'animate-slide-in-right';

  return (
    <div 
      className={`fixed top-20 right-6 z-[300] flex items-center p-4 rounded-lg shadow-2xl border-l-4 ${bgClasses} ${animationClass}`}
      role="alert"
    >
      <div className="flex items-start">
        <Icon className={`w-6 h-6 mr-3 flex-shrink-0 ${iconClasses}`} />
        <p className={`font-semibold ${textClasses}`}>{message}</p>
      </div>
       <button onClick={handleClose} className="ml-4 -mr-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-colors" aria-label="Close">
        <X className="w-4 h-4 text-gray-500 dark:text-tesla-gray-400"/>
      </button>
    </div>
  );
};

export default Toast;
