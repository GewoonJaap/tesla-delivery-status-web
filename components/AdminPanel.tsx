
import React, { useState, useRef } from 'react';
import { CombinedOrder } from '../types';
import { XIcon, CoffeeIcon, TrashIcon } from './icons';
import * as Sentry from "@sentry/react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: CombinedOrder, asHistory: boolean) => void;
  onToggleDebugBanner: () => void;
  isDebugBannerOpen: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    isOpen, 
    onClose, 
    onApply, 
    onToggleDebugBanner, 
    isDebugBannerOpen 
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveAsHistory, setSaveAsHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    setError(null);
    if (!jsonInput.trim()) {
      setError('JSON input cannot be empty.');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      // Basic validation to check if it looks like the expected object
      if (parsed.order && parsed.details && parsed.order.referenceNumber) {
        onApply(parsed, saveAsHistory);
        onClose();
        setJsonInput(''); // Clear on successful apply
        setSaveAsHistory(false); // Reset checkbox
      } else {
        setError('Invalid JSON structure. The root object should contain "order" and "details" keys.');
      }
    } catch (e: any) {
      setError(`JSON Parse Error: ${e.message}`);
      Sentry.captureException(e);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetDonation = () => {
    try {
        localStorage.removeItem('tesla-donation-banner-dismissed');
        localStorage.removeItem('tesla-dashboard-visit-count');
        localStorage.removeItem('hasClickedBuyMeACoffee');
        localStorage.removeItem('hasVisitedDashboard');
        // We do not reload automatically to avoid breaking dev flow, but we alert.
        alert('Donation local storage flags have been reset. Reload the page to test natural recurrence behavior.');
    } catch(e) {
        alert('Failed to reset storage');
        Sentry.captureException(e);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setJsonInput(content); // Populate textarea
      } else {
        setError('File content is empty or could not be read.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
    };
    reader.readAsText(file);

    // Reset input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
  };
  
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-panel-title"
    >
      <div
        className="relative flex flex-col w-full max-w-3xl h-[80vh] bg-white dark:bg-tesla-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-tesla-gray-700 flex-shrink-0">
          <h2 id="admin-panel-title" className="text-xl font-bold text-gray-900 dark:text-white">Developer Panel</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-all duration-150 active:scale-90"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6 text-gray-600 dark:text-tesla-gray-300" />
          </button>
        </header>
        <main className="flex-grow p-5 overflow-y-auto flex flex-col">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json,.json"
            className="hidden"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-600 dark:text-tesla-gray-300 mb-2">
            Paste the full JSON response for a single order here to preview how it renders, or upload a file. This is for development purposes only.
          </p>
          <button
            onClick={handleUploadClick}
            className="mb-4 w-full sm:w-auto self-start px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-tesla-gray-700 border border-gray-300 dark:border-tesla-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-tesla-gray-600 transition-all duration-150 active:scale-95"
          >
            Upload JSON File
          </button>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste your {"order": {...}, "details": {...}} JSON here...'
            className="w-full flex-grow bg-gray-50 dark:bg-tesla-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-tesla-gray-600 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition resize-none"
            aria-label="JSON input for mock order data"
          />
          {error && (
            <div className="mt-4 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-tesla-red text-red-800 dark:text-white text-sm rounded-lg p-3" role="alert">
              {error}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-tesla-gray-700">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Debug Tools</h3>
             <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-tesla-gray-900 rounded-lg border border-gray-200 dark:border-tesla-gray-700">
                    <div className="flex items-center gap-3">
                        <CoffeeIcon className="w-5 h-5 text-yellow-600" />
                        <div>
                             <p className="text-sm font-medium text-gray-900 dark:text-white">Donation Banner</p>
                             <p className="text-xs text-gray-500 dark:text-tesla-gray-400">Toggle the sticky donation banner visibility.</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleDebugBanner}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            isDebugBannerOpen 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'bg-gray-200 dark:bg-tesla-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {isDebugBannerOpen ? 'Force Shown' : 'Default Behavior'}
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-tesla-gray-900 rounded-lg border border-gray-200 dark:border-tesla-gray-700">
                    <div className="flex items-center gap-3">
                        <TrashIcon className="w-5 h-5 text-red-500" />
                        <div>
                             <p className="text-sm font-medium text-gray-900 dark:text-white">Reset Donation State</p>
                             <p className="text-xs text-gray-500 dark:text-tesla-gray-400">Clear dismissal and visit count flags.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleResetDonation}
                        className="px-3 py-1.5 text-xs font-semibold bg-gray-200 dark:bg-tesla-gray-700 hover:bg-gray-300 dark:hover:bg-tesla-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                        Reset Storage
                    </button>
                 </div>
             </div>
          </div>

        </main>
        <footer className="p-5 border-t border-gray-200 dark:border-tesla-gray-700 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer select-none self-start sm:self-auto">
                <input 
                    type="checkbox" 
                    checked={saveAsHistory}
                    onChange={(e) => setSaveAsHistory(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-tesla-gray-700 dark:border-tesla-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-tesla-gray-800 transition"
                />
                <span>Add to History Log</span>
            </label>
            <div className="flex gap-4 w-full sm:w-auto justify-end">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-tesla-gray-700 border border-gray-300 dark:border-tesla-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-tesla-gray-600 transition-all duration-150 active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50"
                  disabled={!jsonInput.trim()}
                >
                  Apply Mock Data
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminPanel;
