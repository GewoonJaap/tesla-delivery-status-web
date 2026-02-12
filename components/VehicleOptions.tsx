
import React, { useRef } from 'react';
import { MARKET_OPTIONS_MAP } from '../data/market-options';
import { CheckIcon, PlusCircleIcon, MinusCircleIcon } from './icons';
import { trackEvent } from '../utils/analytics';

interface VehicleOptionsProps {
  optionsString?: string;
  diffValue?: { old?: string | null; new?: string | null };
}

const OptionItem: React.FC<{
  type: 'added' | 'removed' | 'normal';
  description: string;
}> = ({ type, description }) => {
  switch (type) {
    case 'added':
      return (
        <li className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <PlusCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{description}</span>
        </li>
      );
    case 'removed':
      return (
        <li className="flex items-center space-x-2 text-red-500 dark:text-red-400">
          <MinusCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm line-through">{description}</span>
        </li>
      );
    case 'normal':
    default:
      return (
        <li className="flex items-center space-x-2 text-gray-700 dark:text-tesla-gray-200">
          <CheckIcon className="w-4 h-4 flex-shrink-0 text-blue-500" />
          <span className="text-sm">{description}</span>
        </li>
      );
  }
};

const VehicleOptions: React.FC<VehicleOptionsProps> = ({ optionsString, diffValue }) => {
  // Use a ref to keep track of codes we've already logged to analytics 
  // to avoid spamming events on re-renders.
  const trackedCodesRef = useRef<Set<string>>(new Set());

  const decodeOption = (code: string): string => {
    const label = MARKET_OPTIONS_MAP[code];
    if (!label) {
        if (!trackedCodesRef.current.has(code)) {
            console.warn(`Unknown option code detected: ${code}`);
            trackEvent('unknown_market_option', { code });
            trackedCodesRef.current.add(code);
        }
        return `Unknown Option (${code})`;
    }
    return label;
  };

  if (diffValue) {
    const oldString = diffValue.old || '';
    const newString = diffValue.new || '';
    
    // Explicitly type to avoid unknown type inference
    const oldCodes = new Set<string>(oldString ? oldString.split(',').filter((c: string) => c.trim()) : []);
    const newCodes = new Set<string>(newString ? newString.split(',').filter((c: string) => c.trim()) : []);

    const unchanged = [...oldCodes].filter(code => newCodes.has(code));
    const added = [...newCodes].filter(code => !oldCodes.has(code));
    const removed = [...oldCodes].filter(code => !newCodes.has(code));

    if (unchanged.length === 0 && added.length === 0 && removed.length === 0) {
        return <p className="text-sm text-gray-400 dark:text-tesla-gray-500 font-normal mt-2">N/A</p>;
    }

    return (
      <ul className="space-y-1.5 mt-2">
        {unchanged.map(code => (
          <OptionItem key={`unchanged-${code}`} type="normal" description={decodeOption(code)} />
        ))}
        {added.map(code => (
          <OptionItem key={`added-${code}`} type="added" description={decodeOption(code)} />
        ))}
        {removed.map(code => (
          <OptionItem key={`removed-${code}`} type="removed" description={decodeOption(code)} />
        ))}
      </ul>
    );
  }

  const codes = optionsString?.split(',').filter(c => c.trim());

  if (!codes || codes.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-tesla-gray-500 font-normal mt-2">N/A</p>;
  }

  return (
    <ul className="space-y-1.5 mt-2">
      {codes.map(code => (
        <OptionItem key={`normal-${code}`} type="normal" description={decodeOption(code)} />
      ))}
    </ul>
  );
};

export default VehicleOptions;
