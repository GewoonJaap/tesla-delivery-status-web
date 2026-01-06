import React, { useState, useEffect, useMemo } from 'react';
import { DELIVERY_CHECKLIST } from '../constants';
import { safeLocalStorageSetItem } from '../utils/helpers';

interface DeliveryChecklistProps {
  orderReferenceNumber: string;
}

type CheckedState = Record<string, boolean>;

const ChecklistProgressBar: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 dark:bg-tesla-gray-700 rounded-full h-2 my-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const DeliveryChecklist: React.FC<DeliveryChecklistProps> = ({ orderReferenceNumber }) => {
  const storageKey = `checklist-state-${orderReferenceNumber}`;

  const [checkedItems, setCheckedItems] = useState<CheckedState>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedState = localStorage.getItem(storageKey);
        return storedState ? JSON.parse(storedState) : {};
      }
    } catch (error) {
      console.error("Error reading checklist state from localStorage", error);
    }
    return {};
  });

  useEffect(() => {
    try {
        if (typeof localStorage !== 'undefined') {
            safeLocalStorageSetItem(storageKey, JSON.stringify(checkedItems));
        }
    } catch (error) {
      console.error("Error saving checklist state to localStorage", error);
    }
  }, [checkedItems, storageKey]);

  const handleToggle = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="p-5 space-y-8 flex-grow">
      {DELIVERY_CHECKLIST.map(section => {
        const completedCount = useMemo(() => section.items.filter(item => checkedItems[item.id]).length, [section.items, checkedItems]);
        const totalCount = section.items.length;

        return (
          <div key={section.title}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{section.title}</h4>
              <span className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">
                {completedCount} / {totalCount} Complete
              </span>
            </div>
            <ChecklistProgressBar completed={completedCount} total={totalCount} />
            <ul className="space-y-3 mt-4">
              {section.items.map(item => (
                <li key={item.id}>
                  <label className="flex items-center space-x-3 cursor-pointer group" htmlFor={`checklist-item-${item.id}`}>
                    <input
                      id={`checklist-item-${item.id}`}
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => handleToggle(item.id)}
                      className="h-5 w-5 rounded border-gray-300 dark:border-tesla-gray-500 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-tesla-gray-800 bg-white dark:bg-tesla-gray-700 transition"
                    />
                    <span className={`flex-1 text-gray-700 dark:text-tesla-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition ${checkedItems[item.id] ? 'line-through text-gray-400 dark:text-tesla-gray-500' : ''}`}>
                      {item.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryChecklist;