import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TeslaTask } from '../types';
import { XIcon, CalendarIcon, ClockIcon, PinIcon, MapIcon } from './icons';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedulingTask?: TeslaTask;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ isOpen, onClose, schedulingTask }) => {
  const details = useMemo(() => {
    const fullString = schedulingTask?.apptDateTimeAddressStr;
    if (!fullString) {
      return null;
    }

    // Example: "August 15, 2024 at 10:00 AM - Tesla Delivery Center, 123 Electric Ave, Fremont, CA"
    const parts = fullString.split(' at ');
    const date = parts[0] || 'N/A';
    
    const timeAndAddress = parts[1] ? parts[1].split(' - ') : [];
    const time = timeAndAddress[0] || 'N/A';
    const address = timeAndAddress.slice(1).join(' - ') || schedulingTask?.deliveryAddressTitle || 'N/A';
    
    // Create a Google Maps link from the address
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return { date, time, address, mapsLink };
  }, [schedulingTask]);

  if (!isOpen || !details) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
    >
      <div
        className="relative flex flex-col w-full max-w-lg bg-white dark:bg-tesla-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-tesla-gray-700">
          <h2 id="appointment-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Delivery Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-all duration-150 active:scale-90"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6 text-gray-600 dark:text-tesla-gray-300" />
          </button>
        </header>
        <main className="p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-tesla-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">Date</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{details.date}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <ClockIcon className="w-6 h-6 text-gray-400 dark:text-tesla-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">Time</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{details.time}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <PinIcon className="w-6 h-6 text-gray-400 dark:text-tesla-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">Location</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{details.address}</p>
            </div>
          </div>
        </main>
        <footer className="p-4 bg-gray-50 dark:bg-tesla-gray-800/50 border-t border-gray-200 dark:border-tesla-gray-700/50">
          <a
            href={details.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 active:scale-95"
          >
            <MapIcon className="w-5 h-5 mr-2" />
            <span>Get Directions</span>
          </a>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default AppointmentDetailsModal;