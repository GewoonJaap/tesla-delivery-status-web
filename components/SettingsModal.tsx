
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, ShieldCheckIcon, TrashIcon, InfoIcon, CarIcon, BugIcon, HeartIcon } from './icons';
import { getUserPreferences, setUserPreferences, deleteTeslaOrder, donateTeslaOrder } from '../services/teslaStatus';
import { motion, AnimatePresence } from 'motion/react';
import { CombinedOrder } from '../types';
import { trackEvent, deleteUserData } from '../utils/analytics';
import Toast from './Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CombinedOrder[];
  accessToken: string;
  onDeleteMock?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, orders, accessToken, onDeleteMock }) => {
  const [optIn, setOptIn] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingOrders, setDeletingOrders] = useState<Record<string, boolean>>({});
  const [donatingOrders, setDonatingOrders] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'info' } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    actionLabel: string;
    isDestructive?: boolean;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  useEffect(() => {
    if (isOpen) {
      const prefs = getUserPreferences();
      setOptIn(prefs.dataCollectionOptIn === true);
    }
  }, [isOpen]);

  const handleToggle = (checked: boolean) => {
    trackEvent('data_collection_consent', { status: checked ? 'opt_in' : 'opt_out', source: 'settings' });
    setOptIn(checked);
    setUserPreferences({ dataCollectionOptIn: checked });
  };

  const handleClearAllData = () => {
    setConfirmConfig({
      title: 'Clear Local Data',
      message: 'Are you sure you want to clear all locally stored data? This will sign you out and remove your delivery history.',
      actionLabel: 'Clear Data',
      isDestructive: true,
      onConfirm: () => {
        trackEvent('clear_local_data');
        deleteUserData();
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  const handleDeleteAllFromEstimations = async () => {
    setConfirmConfig({
      title: 'Remove All from Estimations',
      message: 'Are you sure you want to remove all your orders from the community estimation database? This will not affect your Tesla account.',
      actionLabel: 'Remove All',
      isDestructive: true,
      onConfirm: async () => {
        trackEvent('delete_all_orders_from_estimations', { count: orders.length });
        deleteUserData();
        setIsDeletingAll(true);
        let successCount = 0;
        for (const order of orders) {
          const result = await deleteTeslaOrder(order.order.referenceNumber, accessToken);
          if (result.success) successCount++;
        }
        
        if (successCount > 0 && onDeleteMock) {
          onDeleteMock();
        }
        
        if (successCount === orders.length) {
          showToast('All orders removed from estimations successfully.', 'success');
        } else {
          showToast(`Successfully removed ${successCount} out of ${orders.length} orders. Some might have failed.`, 'info');
        }
        setIsDeletingAll(false);
        setConfirmConfig(null);
      }
    });
  };

  const handleDeleteOrder = async (rn: string) => {
    setConfirmConfig({
      title: 'Remove Order',
      message: `Are you sure you want to remove order ${rn} from the community estimation database?`,
      actionLabel: 'Remove Order',
      isDestructive: true,
      onConfirm: async () => {
        trackEvent('delete_single_order_from_estimations', { referenceNumber: rn });
        setDeletingOrders(prev => ({ ...prev, [rn]: true }));
        const result = await deleteTeslaOrder(rn, accessToken);
        showToast(result.message || `Order ${rn} removed successfully.`, result.success ? 'success' : 'info');
        
        // If it's a mock order, clear it from UI
        if (result.success && onDeleteMock) {
          onDeleteMock();
        }
        
        setDeletingOrders(prev => ({ ...prev, [rn]: false }));
        setConfirmConfig(null);
      }
    });
  };

  const handleDonateOrder = async (rn: string) => {
    trackEvent('donate_order_data', { referenceNumber: rn });
    setDonatingOrders(prev => ({ ...prev, [rn]: true }));
    const result = await donateTeslaOrder(rn, accessToken);
    showToast(result.message, result.success ? 'success' : 'info');
    setDonatingOrders(prev => ({ ...prev, [rn]: false }));
  };

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Scrollable Content Container */}
            <div className="absolute inset-0 overflow-y-auto flex items-start justify-center p-4 pt-10 sm:pt-20 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="relative flex flex-col w-full max-w-md bg-white dark:bg-tesla-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-tesla-gray-700">
                  <h2 id="settings-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-all duration-150 active:scale-90"
                    aria-label="Close"
                  >
                    <XIcon className="w-6 h-6 text-gray-600 dark:text-tesla-gray-300" />
                  </button>
                </header>
                
                <main className="p-6 space-y-8">
                  {/* Data Collection Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Privacy & Data</h3>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-tesla-gray-900 rounded-xl border border-gray-200 dark:border-tesla-gray-700">
                      <div className="flex-grow pr-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Contribute to Estimations</p>
                        <p className="text-xs text-gray-500 dark:text-tesla-gray-400">
                          Share anonymized order data to help provide better delivery predictions for the community.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={optIn}
                          onChange={(e) => handleToggle(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        No personal information is ever collected. We only sync order dates and status changes.
                      </p>
                    </div>
                  </section>

                  {/* Manage Orders Section */}
                  {orders.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <CarIcon className="w-5 h-5 text-gray-600 dark:text-tesla-gray-300" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Manage Orders</h3>
                      </div>
                      <div className="space-y-2">
                        {orders.map(order => (
                          <div key={order.order.referenceNumber} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-tesla-gray-900 rounded-xl border border-gray-200 dark:border-tesla-gray-700">
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Model {order.order.modelCode}</p>
                              <p className="text-xs font-mono text-gray-500 dark:text-tesla-gray-400">{order.order.referenceNumber}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDonateOrder(order.order.referenceNumber)}
                                disabled={donatingOrders[order.order.referenceNumber]}
                                className="p-2 text-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Donate for debugging"
                              >
                                <BugIcon className={`w-5 h-5 ${donatingOrders[order.order.referenceNumber] ? 'animate-pulse' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.order.referenceNumber)}
                                disabled={deletingOrders[order.order.referenceNumber]}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Remove from estimations"
                              >
                                <TrashIcon className={`w-5 h-5 ${deletingOrders[order.order.referenceNumber] ? 'animate-pulse' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2 mb-2">
                          <BugIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Help Improve Predictions</h4>
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                          Encountering issues with your delivery dates? Use the <BugIcon className="inline w-3 h-3" /> button to donate your anonymized order data. This helps us identify and fix parsing issues for the community.
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Danger Zone */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <TrashIcon className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Danger Zone</h3>
                    </div>
                    
                    <button
                      onClick={handleDeleteAllFromEstimations}
                      disabled={isDeletingAll || orders.length === 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 mb-3"
                    >
                      <TrashIcon className={`w-4 h-4 ${isDeletingAll ? 'animate-pulse' : ''}`} />
                      {isDeletingAll ? 'Removing...' : 'Remove All Data from Estimations'}
                    </button>

                    <button
                      onClick={handleClearAllData}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Clear All Local Data
                    </button>
                    <p className="mt-2 text-center text-[10px] text-gray-500 dark:text-tesla-gray-500">
                      This will remove all delivery history and sign you out.
                    </p>
                  </section>
                </main>
                
                <footer className="p-5 bg-gray-50 dark:bg-tesla-gray-900/50 border-t border-gray-200 dark:border-tesla-gray-700">
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-tesla-gray-800 border border-gray-300 dark:border-tesla-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-tesla-gray-700 transition-all active:scale-[0.98]"
                  >
                    Done
                  </button>
                </footer>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmConfig && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setConfirmConfig(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white dark:bg-tesla-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-tesla-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{confirmConfig.title}</h3>
              <p className="text-sm text-gray-600 dark:text-tesla-gray-300 mb-6">{confirmConfig.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmConfig(null)}
                  className="flex-1 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-tesla-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-tesla-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmConfig.onConfirm}
                  className={`flex-1 py-2 text-sm font-bold text-white rounded-xl transition-colors ${confirmConfig.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {confirmConfig.actionLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>,
    document.body
  );
};

export default SettingsModal;
