import React from 'react';
import { XCircle, CheckCircle2, User, Server } from 'lucide-react';

interface Gate {
  actionOwner: 'Customer' | 'Tesla' | null;
  isBlocker: boolean;
  gate: string;
}

interface DeliveryGatesProps {
  gates?: Record<string, Gate>;
}

const GATE_LABELS: Record<string, string> = {
  REGISTRATION_TASK: "Complete Registration Details",
  DELIVERY_TASK: "Internal Delivery Prep",
  FINANCING_TASK: "Finalize Financing",
  SCHEDULING_TASK: "Schedule Delivery Appointment",
  ORDER_ACKNOWLEDGEMENT: "Acknowledge Order",
  FINAL_INVOICE: "Final Invoice Generation",
  FACTORY_GATE: "Vehicle Exited Factory",
  CONTAINMENT_HOLD: "Quality Containment Hold",
  SERVICE_VISIT: "Pre-delivery Service Visit",
  FINAL_PAYMENT: "Complete Final Payment",
  STAGING: "Vehicle Staging for Delivery",
  FINISHED_GOODS: "Vehicle Ready for Transport",
  VEHICLE_REGISTRATION_TASK: "Vehicle Registration Processing",
};

// A logical order for the delivery process gates.
const GATE_SORT_ORDER: string[] = [
  // Customer-facing tasks, in a typical sequence
  'ORDER_ACKNOWLEDGEMENT',
  'FINANCING_TASK',
  'REGISTRATION_TASK',
  'SCHEDULING_TASK',
  'FINAL_PAYMENT',
  
  // Tesla's internal process, in a typical sequence
  'FINAL_INVOICE',
  'FACTORY_GATE',
  'FINISHED_GOODS',
  'VEHICLE_REGISTRATION_TASK',
  'CONTAINMENT_HOLD',
  'SERVICE_VISIT',
  'STAGING',
  'DELIVERY_TASK',
];

const getGateLabel = (gateKey: string): string => GATE_LABELS[gateKey] || gateKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const GateItem: React.FC<{ gate: Gate }> = ({ gate }) => {
  const isBlocker = gate.isBlocker;
  const owner = gate.actionOwner;

  let ownerText = 'Tesla';
  let OwnerIcon = Server;
  if (owner === 'Customer') {
    ownerText = 'You';
    OwnerIcon = User;
  }
  
  const statusIcon = isBlocker ? <XCircle className="w-6 h-6 text-amber-500 flex-shrink-0" /> : <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />;
  
  return (
    <li className="flex items-start space-x-4 py-3">
      {statusIcon}
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 dark:text-white">{getGateLabel(gate.gate)}</p>
        <p className="text-sm text-gray-500 dark:text-tesla-gray-400">
          Status: <span className={isBlocker ? 'font-medium text-amber-500' : 'font-medium text-green-500'}>{isBlocker ? 'Pending' : 'Complete'}</span>
        </p>
      </div>
      {owner && (
        <div className="flex items-center text-xs font-medium bg-gray-100 dark:bg-tesla-gray-700 text-gray-600 dark:text-tesla-gray-300 px-2 py-1 rounded-full flex-shrink-0">
          <OwnerIcon className="w-3 h-3 mr-1.5" />
          <span>Action: {ownerText}</span>
        </div>
      )}
    </li>
  );
};


const DeliveryGates: React.FC<DeliveryGatesProps> = ({ gates }) => {
  // Explicitly type gateArray to allow filter and sort to infer types correctly
  const gateArray: Gate[] = gates ? Object.values(gates) : [];

  const sortGates = (gateA: Gate, gateB: Gate): number => {
    // Priority 1: Customer tasks before Tesla tasks
    const ownerA = gateA.actionOwner === 'Customer' ? 0 : 1;
    const ownerB = gateB.actionOwner === 'Customer' ? 0 : 1;
    if (ownerA !== ownerB) {
      return ownerA - ownerB;
    }

    // Priority 2: Predefined sort order
    const indexA = GATE_SORT_ORDER.indexOf(gateA.gate);
    const indexB = GATE_SORT_ORDER.indexOf(gateB.gate);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1; // A is in the list, B is not -> A comes first
    if (indexB !== -1) return 1;  // B is in the list, A is not -> B comes first

    // Priority 3: Alphabetical fallback for any unknown gates
    return gateA.gate.localeCompare(gateB.gate);
  };

  const blockers = gateArray.filter(g => g.isBlocker).sort(sortGates);
  const nonBlockers = gateArray.filter(g => !g.isBlocker).sort(sortGates);
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-tesla-gray-700/50">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2">Delivery Readiness</h3>
      {gateArray.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-tesla-gray-400 px-1 py-2">
          No delivery readiness tasks to show at this time.
        </p>
      ) : (
        <>
          {blockers.length === 0 ? (
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">Ready for Next Steps</p>
                    <p className="text-sm text-green-700 dark:text-green-400">All pre-delivery checks are complete. Awaiting final scheduling.</p>
                </div>
            </div>
          ) : (
            <>
                <p className="text-sm text-gray-500 dark:text-tesla-gray-400 mb-3">The following items must be completed before you can accept delivery:</p>
                <ul className="divide-y divide-gray-200 dark:divide-tesla-gray-700/50">
                    {blockers.map(gate => <GateItem key={gate.gate} gate={gate} />)}
                </ul>
            </>
          )}
          {nonBlockers.length > 0 && (
              <details className="mt-4">
                  <summary className="text-sm font-semibold text-gray-500 dark:text-tesla-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-white list-inside">
                      Show Completed Items ({nonBlockers.length})
                  </summary>
                  <ul className="divide-y divide-gray-200 dark:divide-tesla-gray-700/50 mt-2 border-t border-gray-200 dark:border-tesla-gray-700/50">
                      {nonBlockers.map(gate => <GateItem key={gate.gate} gate={gate} />)}
                  </ul>
              </details>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryGates;